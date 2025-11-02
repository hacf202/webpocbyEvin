// src/routes/builds.js

import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	UpdateItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { AdminGetUserCommand } from "@aws-sdk/client-cognito-identity-provider";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

// Import các client và middleware từ thư mục cấu hình
import client from "../config/db.js";
import { cognitoClient } from "../config/cognito.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";

const router = express.Router();

// Định nghĩa tên bảng
const BUILDS_TABLE = "Builds";
const COMMENTS_TABLE = "Comments";
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// --- Builds API ---

// GET /api/builds - Lấy tất cả các build công khai
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({
			TableName: BUILDS_TABLE,
			FilterExpression: "#display = :display",
			ExpressionAttributeNames: { "#display": "display" },
			ExpressionAttributeValues: marshall({ ":display": true }),
		});
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];

		if (items.length === 0) {
			return res.json({ items: [] });
		}

		const uniqueUsernames = [...new Set(items.map(item => item.creator))];
		const userPromises = uniqueUsernames.map(async username => {
			try {
				const getUserCommand = new AdminGetUserCommand({
					UserPoolId: COGNITO_USER_POOL_ID,
					Username: username,
				});
				const userData = await cognitoClient.send(getUserCommand);
				const nameAttribute = userData.UserAttributes.find(
					attr => attr.Name === "name"
				);
				return {
					username,
					name: nameAttribute ? nameAttribute.Value : username,
				};
			} catch (error) {
				console.error(`Could not fetch info for user ${username}:`, error.name);
				return { username, name: username };
			}
		});

		const resolvedUsers = await Promise.all(userPromises);
		const userMap = resolvedUsers.reduce((acc, user) => {
			acc[user.username] = user.name;
			return acc;
		}, {});

		const enrichedItems = items.map(item => ({
			...item,
			creatorName: userMap[item.creator] || item.creator,
		}));

		res.json({ items: enrichedItems });
	} catch (error) {
		console.error("Error getting all public builds:", error);
		res.status(500).json({ error: "Could not retrieve builds" });
	}
});

// GET /api/builds/my-builds - Lấy các build của người dùng đã xác thực
router.get("/my-builds", authenticateCognitoToken, async (req, res) => {
	const creator = req.user["cognito:username"];
	try {
		const command = new ScanCommand({
			TableName: BUILDS_TABLE,
			FilterExpression: "creator = :creator",
			ExpressionAttributeValues: marshall({ ":creator": creator }),
		});
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Error getting user's builds:", error);
		res.status(500).json({ error: "Could not retrieve your builds" });
	}
});

// GET /api/builds/favorites - Lấy các build yêu thích của người dùng
router.get("/favorites", authenticateCognitoToken, async (req, res) => {
	const userSub = req.user.sub;
	try {
		const params = {
			TableName: BUILDS_TABLE,
			FilterExpression: "contains(#favoriteAttr, :userSub)",
			ExpressionAttributeNames: { "#favoriteAttr": "favorite" },
			ExpressionAttributeValues: marshall({ ":userSub": userSub }),
		};
		const command = new ScanCommand(params);
		const response = await client.send(command);
		const favoriteBuilds = response.Items.map(item => unmarshall(item));
		res.json(favoriteBuilds);
	} catch (error) {
		console.error("Error fetching favorite builds:", error);
		res.status(500).json({ error: "Could not fetch favorite builds" });
	}
});

// GET /api/builds/:id - Lấy một build cụ thể bằng ID
router.get("/:id", async (req, res) => {
	const { id } = req.params;
	let userSub = null;

	// Nếu có Authorization header → lấy sub (không bắt buộc)
	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.split(" ")[1];
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			userSub = payload.sub;
		} catch (err) {
			console.warn("Invalid token format");
		}
	}

	try {
		const getCommand = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		const { Item } = await client.send(getCommand);

		if (!Item) {
			return res.status(404).json({ error: "Build not found" });
		}

		const build = unmarshall(Item);

		// === CASE 1: Build công khai → ai cũng xem được ===
		if (build.display === true) {
			// Tăng lượt xem
			const updateViewsCommand = new UpdateItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
				UpdateExpression: "SET #views = if_not_exists(#views, :start) + :inc",
				ExpressionAttributeNames: { "#views": "views" },
				ExpressionAttributeValues: marshall({ ":inc": 1, ":start": 0 }),
			});
			await client.send(updateViewsCommand);

			return res.json(build);
		}

		// === CASE 2: Build riêng tư → cần kiểm tra quyền ===
		if (build.display === false) {
			if (!userSub) {
				return res.status(404).json({ error: "Build not found or not public" });
			}
			if (build.sub !== userSub) {
				return res.status(404).json({ error: "Build not found or not public" });
			}
			// Là chủ sở hữu → trả về, KHÔNG tăng view
			return res.json(build);
		}
	} catch (error) {
		console.error("Error getting single build:", error);
		res.status(500).json({ error: "Could not retrieve build" });
	}
});
// POST /api/builds - Tạo một build mới
router.post("/", authenticateCognitoToken, async (req, res) => {
	const {
		championName,
		description = "",
		artifacts = [],
		powers = [],
		rune = [],
		star = 0,
		display = false,
	} = req.body;

	if (!championName || !Array.isArray(artifacts) || artifacts.length === 0) {
		return res
			.status(400)
			.json({ error: "Champion name and artifacts are required." });
	}

	const build = {
		id: uuidv4(),
		sub: req.user.sub,
		creator: req.user["cognito:username"],
		description,
		championName,
		artifacts,
		powers,
		rune,
		like: 0,
		star,
		display,
		favorite: [],
		views: 0,
		createdAt: new Date().toISOString(),
	};

	try {
		const command = new PutItemCommand({
			TableName: BUILDS_TABLE,
			Item: marshall(build),
		});
		await client.send(command);
		res.status(201).json({ message: "Build created successfully", build });
	} catch (error) {
		console.error("Error creating build:", error);
		res.status(500).json({ error: "Could not create build" });
	}
});

// PUT /api/builds/:id - Cập nhật một build
router.put("/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const { description, artifacts, powers, rune, star, display } = req.body;
	const userSub = req.user.sub;

	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = unmarshall(Item);
		if (build.sub !== userSub) {
			return res
				.status(403)
				.json({ error: "You are not authorized to edit this build" });
		}

		let updateExpression = "SET";
		let expressionAttributeValues = {};
		let expressionAttributeNames = {};
		const fieldsToUpdate = {
			description,
			artifacts,
			powers,
			rune,
			star,
			display,
		};

		Object.entries(fieldsToUpdate).forEach(([key, value], index) => {
			if (value !== undefined) {
				updateExpression += `${index > 0 ? "," : ""} #${key} = :${key}`;
				expressionAttributeNames[`#${key}`] = key;
				expressionAttributeValues[`:${key}`] = value;
			}
		});

		if (Object.keys(expressionAttributeValues).length === 0) {
			return res.status(400).json({ error: "No fields to update" });
		}

		const command = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: marshall(expressionAttributeValues),
			ReturnValues: "ALL_NEW",
		});

		const { Attributes } = await client.send(command);
		res.json({
			message: "Build updated successfully",
			build: unmarshall(Attributes),
		});
	} catch (error) {
		console.error("Error updating build:", error);
		res.status(500).json({ error: "Could not update build" });
	}
});

// DELETE /api/builds/:id - Xóa một build
router.delete("/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const userSub = req.user.sub;

	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = unmarshall(Item);
		if (build.sub !== userSub) {
			return res
				.status(403)
				.json({ error: "You are not authorized to delete this build" });
		}

		await client.send(
			new DeleteItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		res.json({ message: "Build deleted successfully" });
	} catch (error) {
		console.error("Error deleting build:", error);
		res.status(500).json({ error: "Could not delete build" });
	}
});

// --- Comments API (trên một build cụ thể) ---

// GET /api/builds/:buildId/comments
router.get("/:buildId/comments", async (req, res) => {
	const { buildId } = req.params;
	try {
		const command = new QueryCommand({
			TableName: COMMENTS_TABLE,
			IndexName: "buildId-index",
			KeyConditionExpression: "buildId = :buildId",
			ExpressionAttributeValues: marshall({ ":buildId": buildId }),
			ScanIndexForward: true, // Sắp xếp theo ngày tạo (sort key)
		});
		const response = await client.send(command);
		const comments = response.Items.map(item => unmarshall(item));
		res.json(comments);
	} catch (error) {
		console.error("Error getting comments:", error);
		res.status(500).json({ error: "Could not retrieve comments" });
	}
});

// POST /api/builds/:buildId/comments
router.post(
	"/:buildId/comments",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId } = req.params;
		const { content, parentId = null, replyToUsername = null } = req.body;

		if (!content) {
			return res.status(400).json({ error: "Comment content is required" });
		}

		try {
			// Kiểm tra xem build có tồn tại không
			const { Item } = await client.send(
				new GetItemCommand({
					TableName: BUILDS_TABLE,
					Key: marshall({ id: buildId }),
				})
			);
			if (!Item) return res.status(404).json({ error: "Build not found" });

			const newComment = {
				id: uuidv4(),
				buildId,
				content,
				user_sub: req.user.sub,
				username: req.user["cognito:username"],
				createdAt: new Date().toISOString(),
				parentId,
				replyToUsername,
			};

			await client.send(
				new PutItemCommand({
					TableName: COMMENTS_TABLE,
					Item: marshall(newComment),
				})
			);
			res.status(201).json(newComment);
		} catch (error) {
			console.error("Error posting comment:", error);
			res.status(500).json({ error: "Could not post comment" });
		}
	}
);

// PUT /api/builds/:buildId/comments/:commentId
router.put(
	"/:buildId/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId, commentId } = req.params;
		const { content } = req.body;
		if (!content) return res.status(400).json({ error: "Content is required" });

		try {
			// DynamoDB có khóa chính phức hợp (buildId, id), nên cần cả hai để Get
			const { Item } = await client.send(
				new GetItemCommand({
					TableName: COMMENTS_TABLE,
					Key: marshall({ buildId, id: commentId }),
				})
			);
			if (!Item) return res.status(404).json({ error: "Comment not found" });

			const comment = unmarshall(Item);
			if (comment.user_sub !== req.user.sub) {
				return res
					.status(403)
					.json({ error: "You are not authorized to edit this comment" });
			}

			const updateCommand = new UpdateItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ buildId, id: commentId }),
				UpdateExpression: "SET #content = :content, #updatedAt = :updatedAt",
				ExpressionAttributeNames: {
					"#content": "content",
					"#updatedAt": "updatedAt",
				},
				ExpressionAttributeValues: marshall({
					":content": content,
					":updatedAt": new Date().toISOString(),
				}),
				ReturnValues: "ALL_NEW",
			});
			const { Attributes } = await client.send(updateCommand);
			res.json(unmarshall(Attributes));
		} catch (error) {
			console.error("Error updating comment:", error);
			res.status(500).json({ error: "Could not update comment" });
		}
	}
);

// DELETE /api/builds/:buildId/comments/:commentId
router.delete(
	"/:buildId/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId, commentId } = req.params;
		try {
			const deleteCommand = new DeleteItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ buildId, id: commentId }),
				ConditionExpression: "user_sub = :user_sub", // Chỉ cho phép xóa nếu user_sub khớp
				ExpressionAttributeValues: marshall({ ":user_sub": req.user.sub }),
			});
			await client.send(deleteCommand);
			res.json({ message: "Comment deleted successfully" });
		} catch (error) {
			if (error.name === "ConditionalCheckFailedException") {
				return res.status(403).json({
					error: "Comment not found or you are not authorized to delete it",
				});
			}
			console.error("Error deleting comment:", error);
			res.status(500).json({ error: "Could not delete comment" });
		}
	}
);

// --- Build Actions (Like/Favorite) ---

// PATCH /api/builds/:id/like - Tăng lượt thích
router.patch("/:id/like", async (req, res) => {
	const { id } = req.params;
	try {
		const command = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression:
				"SET #likeAttr = if_not_exists(#likeAttr, :start) + :inc",
			ExpressionAttributeNames: { "#likeAttr": "like" },
			ExpressionAttributeValues: marshall({ ":inc": 1, ":start": 0 }),
			ReturnValues: "ALL_NEW",
		});
		const { Attributes } = await client.send(command);
		res.json(unmarshall(Attributes));
	} catch (error) {
		console.error("Error liking build:", error);
		res.status(500).json({ error: "Could not like build" });
	}
});

// PATCH /api/builds/:id/favorite - Thêm/xóa khỏi danh sách yêu thích
router.patch("/:id/favorite", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const userSub = req.user.sub;
	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = unmarshall(Item);
		let favorites = build.favorite || [];
		const userIndex = favorites.indexOf(userSub);

		if (userIndex > -1) {
			favorites.splice(userIndex, 1); // User đã thích, giờ bỏ thích
		} else {
			favorites.push(userSub); // User chưa thích, giờ thêm vào
		}

		const updateCommand = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression: "SET #favAttr = :newList",
			ExpressionAttributeNames: { "#favAttr": "favorite" },
			ExpressionAttributeValues: marshall({ ":newList": favorites }),
			ReturnValues: "ALL_NEW",
		});

		const { Attributes } = await client.send(updateCommand);
		res.json(unmarshall(Attributes));
	} catch (error) {
		console.error("Error toggling favorite:", error);
		res.status(500).json({ error: "Could not toggle favorite status" });
	}
});

// Xuất router để sử dụng trong server.js
export default router;
