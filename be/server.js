// server.js

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import {
	DynamoDBClient,
	ScanCommand,
	PutItemCommand,
	UpdateItemCommand,
	DeleteItemCommand,
	DescribeTableCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import {
	CognitoIdentityProviderClient,
	AdminGetUserCommand,
	ForgotPasswordCommand,
	AdminUpdateUserAttributesCommand,
	ChangePasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

// Check for required environment variables
const requiredEnvVars = [
	"AWS_REGION",
	"AWS_ACCESS_KEY_ID",
	"AWS_SECRET_ACCESS_KEY",
	"COGNITO_USER_POOL_ID",
	"COGNITO_APP_CLIENT_ID",
	"FRONTEND_URL",
];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingEnvVars.length > 0) {
	console.error("Missing environment variables:", missingEnvVars.join(", "));
	process.exit(1);
}

const {
	AWS_REGION,
	COGNITO_USER_POOL_ID,
	COGNITO_APP_CLIENT_ID,
	FRONTEND_URL,
} = process.env;

const BUILDS_TABLE = "Builds";
const COMMENTS_TABLE = "Comments";

const client = new DynamoDBClient({ region: AWS_REGION });

const cognitoClient = new CognitoIdentityProviderClient({ region: AWS_REGION });

const verifier = CognitoJwtVerifier.create({
	userPoolId: COGNITO_USER_POOL_ID,
	tokenUse: "id",
	clientId: COGNITO_APP_CLIENT_ID,
});

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(morgan("dev"));
const allowedOrigins = [
	FRONTEND_URL,
	"http://localhost:5173",
	"https://guidepoc.vercel.app",
];
app.use(
	cors({
		origin: function (origin, callback) {
			if (!origin || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
	})
);
app.use(express.json());

// Authentication Middleware
const authenticateCognitoToken = async (req, res, next) => {
	const authHeader = req.headers.authorization;
	if (!authHeader) {
		return res.status(401).json({ error: "Authorization header is missing" });
	}
	const token = authHeader.split(" ")[1];
	if (!token || token === "null" || token === "undefined") {
		return res.status(401).json({ error: "Token is missing or invalid" });
	}

	try {
		const payload = await verifier.verify(token);
		req.user = payload;
		next();
	} catch (error) {
		console.error("Token verification error:", error.message);
		return res.status(403).json({ error: "Invalid or expired token" });
	}
};
app.post("/api/auth/forgot-password-strict", async (req, res) => {
	const { username, email } = req.body;

	if (!username || !email) {
		return res
			.status(400)
			.json({ error: "Vui lòng cung cấp đầy đủ tên người dùng và email." });
	}

	try {
		const getUserCommand = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});

		const userData = await cognitoClient.send(getUserCommand);

		if (
			userData.UserStatus !== "CONFIRMED" &&
			userData.UserStatus !== "FORCE_CHANGE_PASSWORD"
		) {
			return res.status(403).json({
				error: "Tài khoản chưa được xác minh hoặc không hoạt động.",
			});
		}

		const registeredEmailAttribute = userData.UserAttributes.find(
			attr => attr.Name === "email"
		);
		const registeredEmail = registeredEmailAttribute
			? registeredEmailAttribute.Value
			: null;

		if (!registeredEmail) {
			return res.status(404).json({
				error: "Tài khoản này không có email đăng ký hợp lệ.",
			});
		}

		if (registeredEmail.toLowerCase() !== email.toLowerCase()) {
			console.log(
				`Email mismatch for user ${username}. Registered: ${registeredEmail}, Provided: ${email}`
			);
			return res.status(400).json({
				error:
					"Email và Tên người dùng không khớp với thông tin đã đăng ký. Vui lòng kiểm tra lại.",
			});
		}

		const forgotPasswordCommand = new ForgotPasswordCommand({
			ClientId: COGNITO_APP_CLIENT_ID,
			Username: username,
		});

		const response = await cognitoClient.send(forgotPasswordCommand);

		const destination = response.CodeDeliveryDetails.Destination;
		const deliveryMedium = response.CodeDeliveryDetails.DeliveryMedium;

		res.json({
			message: `Mã xác minh đã được gửi đến ${deliveryMedium} đã đăng ký (kết thúc bằng: ${destination})`,
			deliveryDetails: response.CodeDeliveryDetails,
		});
	} catch (error) {
		console.error("Strict Forgot Password API Error:", error);

		let errorMessage =
			"Lỗi hệ thống khi khôi phục mật khẩu. Vui lòng thử lại sau.";
		let statusCode = 500;

		if (error.name === "UserNotFoundException") {
			errorMessage = `Tên người dùng "${username}" không tồn tại.`;
			statusCode = 404;
		} else if (
			error.name === "InvalidParameterException" ||
			error.name === "TooManyRequestsException"
		) {
			errorMessage = error.message;
			statusCode = 400;
		} else if (error.name === "NotAuthorizedException") {
			errorMessage =
				"Lỗi xác thực Cognito: Ứng dụng không có quyền thực hiện hành động này.";
			statusCode = 403;
		}

		res.status(statusCode).json({ error: errorMessage });
	}
});

// --- API Routes ---

app.get("/api/checkheal", async (req, res) => {
	try {
		await client.send(new DescribeTableCommand({ TableName: BUILDS_TABLE }));
		await client.send(new DescribeTableCommand({ TableName: COMMENTS_TABLE }));
		res.status(200).json({
			status: "OK",
			message:
				"Server is running and connected to DynamoDB (Builds & Comments)",
		});
	} catch (error) {
		res.status(500).json({
			status: "ERROR",
			message: "Failed to connect to DynamoDB",
			error: error.message,
		});
	}
});

// --- User Management API ---

app.get("/api/users/:username", async (req, res) => {
	const { username } = req.params;

	if (!username) {
		return res.status(400).json({ error: "Username is required" });
	}

	try {
		const getUserCommand = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});

		const userData = await cognitoClient.send(getUserCommand);

		const nameAttribute = userData.UserAttributes.find(
			attr => attr.Name === "name"
		);
		const displayName = nameAttribute ? nameAttribute.Value : username;

		res.json({ name: displayName });
	} catch (error) {
		console.error(`Error fetching user ${username}:`, error);
		if (error.name === "UserNotFoundException") {
			return res.status(404).json({ error: "User not found" });
		}
		res.status(500).json({ error: "Could not retrieve user information" });
	}
});

app.put("/api/user/change-name", authenticateCognitoToken, async (req, res) => {
	const { name } = req.body;
	const username = req.user["cognito:username"];

	if (!name || name.trim().length < 3) {
		return res
			.status(400)
			.json({ error: "Tên hiển thị phải có ít nhất 3 ký tự." });
	}

	try {
		const command = new AdminUpdateUserAttributesCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
			UserAttributes: [
				{
					Name: "name",
					Value: name,
				},
			],
		});
		await cognitoClient.send(command);
		res.json({ message: "Tên hiển thị đã được cập nhật thành công." });
	} catch (error) {
		console.error("Error changing user name:", error);
		res.status(500).json({ error: "Không thể cập nhật tên hiển thị." });
	}
});

app.post(
	"/api/user/change-password",
	authenticateCognitoToken,
	async (req, res) => {
		const { oldPassword, newPassword, accessToken } = req.body;

		if (!oldPassword || !newPassword || !accessToken) {
			return res.status(400).json({
				error: "Vui lòng cung cấp mật khẩu cũ, mật khẩu mới và access token.",
			});
		}
		if (newPassword.length < 8) {
			return res
				.status(400)
				.json({ error: "Mật khẩu mới phải có ít nhất 8 ký tự." });
		}

		try {
			const command = new ChangePasswordCommand({
				PreviousPassword: oldPassword,
				ProposedPassword: newPassword,
				AccessToken: accessToken,
			});
			await cognitoClient.send(command);
			res.json({ message: "Mật khẩu đã được thay đổi thành công." });
		} catch (error) {
			console.error("Error changing password:", error);
			if (error.name === "NotAuthorizedException") {
				return res
					.status(401)
					.json({ error: error.message || "Mật khẩu cũ không đúng." });
			}
			if (error.name === "InvalidPasswordException") {
				return res.status(400).json({
					error: "Mật khẩu mới không đáp ứng yêu cầu của hệ thống.",
				});
			}
			res.status(500).json({ error: "Không thể thay đổi mật khẩu." });
		}
	}
);

// --- Builds API ---

// MODIFIED: Get all builds (public) - now includes creator's display name
app.get("/api/builds", async (req, res) => {
	try {
		// Step 1: Lấy tất cả các build công khai từ DynamoDB
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

		// Step 2: Thu thập tất cả các tên người dùng (creator) duy nhất từ các build
		const uniqueUsernames = [...new Set(items.map(item => item.creator))];

		// Step 3: Truy vấn thông tin người dùng từ Cognito để lấy tên hiển thị
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
				const displayName = nameAttribute ? nameAttribute.Value : username;
				return { username, name: displayName };
			} catch (error) {
				// Nếu người dùng không được tìm thấy, trả về tên người dùng gốc
				console.error(`Could not fetch info for user ${username}:`, error.name);
				return { username, name: username };
			}
		});

		const resolvedUsers = await Promise.all(userPromises);

		// Step 4: Tạo một bản đồ (map) từ username sang tên hiển thị
		const userMap = resolvedUsers.reduce((acc, user) => {
			acc[user.username] = user.name;
			return acc;
		}, {});

		// Step 5: Đính kèm tên hiển thị vào mỗi đối tượng build
		const enrichedItems = items.map(item => ({
			...item,
			creatorName: userMap[item.creator] || item.creator, // Fallback về username nếu không tìm thấy
		}));

		res.json({ items: enrichedItems });
	} catch (error) {
		console.error("Error getting all public builds:", error);
		res.status(500).json({ error: "Could not retrieve builds" });
	}
});

app.get("/api/my-builds", authenticateCognitoToken, async (req, res) => {
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

app.get("/api/builds/favorites", authenticateCognitoToken, async (req, res) => {
	const userSub = req.user.sub;

	try {
		const params = {
			TableName: BUILDS_TABLE,
			FilterExpression: "contains(#favoriteAttr, :userSub)",
			ExpressionAttributeNames: {
				"#favoriteAttr": "favorite",
			},
			ExpressionAttributeValues: marshall({
				":userSub": userSub,
			}),
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

app.get("/api/builds/:id", async (req, res) => {
	const { id } = req.params;

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

		if (build.display === false) {
			return res.status(404).json({ error: "Build not found or not public" });
		}

		const updateViewsCommand = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression: "SET #views = if_not_exists(#views, :start) + :inc",
			ExpressionAttributeNames: {
				"#views": "views",
			},
			ExpressionAttributeValues: marshall({
				":inc": 1,
				":start": 0,
			}),
		});
		await client.send(updateViewsCommand);

		res.json(build);
	} catch (error) {
		console.error("Error getting single build:", error);
		res.status(500).json({ error: "Could not retrieve build" });
	}
});

app.post("/api/builds", authenticateCognitoToken, async (req, res) => {
	console.log("Received payload for new build:", req.body);
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
		let missingFields = [];
		if (!championName) missingFields.push("championName");
		if (!Array.isArray(artifacts) || artifacts.length === 0)
			missingFields.push("artifacts (must be a non-empty array)");
		return res
			.status(400)
			.json({ error: `Missing required fields: ${missingFields.join(", ")}` });
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
		res.status(201).json({
			message: "Build created successfully",
			build: build,
		});
	} catch (error) {
		console.error("Error creating build:", error);
		res.status(500).json({ error: "Could not create build" });
	}
});

app.put("/api/builds/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const { description, artifacts, powers, rune, star, display } = req.body;
	const userSub = req.user.sub;

	try {
		const getBuild = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		const { Item } = await client.send(getBuild);

		if (!Item) {
			return res.status(404).json({ error: "Build not found" });
		}

		const build = unmarshall(Item);
		if (build.sub !== userSub) {
			return res
				.status(403)
				.json({ error: "You are not authorized to edit this build" });
		}

		let updateExpression = "SET";
		let expressionAttributeValues = {};
		let expressionAttributeNames = {};
		let first = true;

		const fieldsToUpdate = {
			description,
			artifacts,
			powers,
			rune,
			star,
			display,
		};

		for (const [key, value] of Object.entries(fieldsToUpdate)) {
			if (value !== undefined) {
				if (!first) updateExpression += ",";
				updateExpression += ` #${key} = :${key}`;
				expressionAttributeNames[`#${key}`] = key;
				expressionAttributeValues[`:${key}`] = value;
				first = false;
			}
		}

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

app.delete("/api/builds/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const userSub = req.user.sub;

	try {
		const getBuild = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		const { Item } = await client.send(getBuild);

		if (!Item) {
			return res.status(404).json({ error: "Build not found" });
		}
		const build = unmarshall(Item);
		if (build.sub !== userSub) {
			return res
				.status(403)
				.json({ error: "You are not authorized to delete this build" });
		}

		const command = new DeleteItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		await client.send(command);
		res.json({ message: "Build deleted successfully" });
	} catch (error) {
		console.error("Error deleting build:", error);
		res.status(500).json({ error: "Could not delete build" });
	}
});

// --- Comments API ---

app.get("/api/builds/:buildId/comments", async (req, res) => {
	const { buildId } = req.params;
	try {
		const params = {
			TableName: COMMENTS_TABLE,
			IndexName: "buildId-index",
			KeyConditionExpression: "buildId = :buildId",
			ExpressionAttributeValues: marshall({
				":buildId": buildId,
			}),
			ScanIndexForward: true,
		};
		const command = new QueryCommand(params);
		const response = await client.send(command);
		const comments = response.Items.map(item => unmarshall(item));
		res.json(comments);
	} catch (error) {
		console.error("Error getting comments:", error);
		res.status(500).json({ error: "Could not retrieve comments" });
	}
});

app.post(
	"/api/builds/:buildId/comments",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId } = req.params;
		const { content, parentId = null, replyToUsername = null } = req.body;
		const user_sub = req.user.sub;
		const username = req.user["cognito:username"];

		if (!content) {
			return res.status(400).json({ error: "Comment content is required" });
		}

		try {
			const getBuild = new GetItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id: buildId }),
			});
			const { Item: buildItem } = await client.send(getBuild);
			if (!buildItem) {
				return res.status(404).json({ error: "Build not found" });
			}
		} catch (error) {
			console.error("Error checking build existence:", error);
			return res.status(500).json({ error: "Could not verify build" });
		}

		const newComment = {
			id: uuidv4(),
			buildId: buildId,
			content: content,
			user_sub: user_sub,
			username: username,
			createdAt: new Date().toISOString(),
			parentId: parentId,
			replyToUsername: replyToUsername,
		};

		try {
			const command = new PutItemCommand({
				TableName: COMMENTS_TABLE,
				Item: marshall(newComment),
			});
			await client.send(command);
			res.status(201).json(newComment);
		} catch (error) {
			console.error("Error posting comment:", error);
			res.status(500).json({ error: "Could not post comment" });
		}
	}
);

app.put(
	"/api/builds/:buildId/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId, commentId } = req.params;
		const { content } = req.body;
		const user_sub = req.user.sub;

		if (!content) {
			return res.status(400).json({ error: "Content is required" });
		}

		try {
			const getCommand = new GetItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ buildId: buildId, id: commentId }),
			});
			const { Item } = await client.send(getCommand);

			if (!Item) {
				return res.status(404).json({ error: "Comment not found" });
			}

			const comment = unmarshall(Item);
			if (comment.user_sub !== user_sub) {
				return res
					.status(403)
					.json({ error: "You are not authorized to edit this comment" });
			}

			const updateCommand = new UpdateItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ buildId: buildId, id: commentId }),
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

app.delete(
	"/api/builds/:buildId/comments/:commentId",
	authenticateCognitoToken,
	async (req, res) => {
		const { buildId, commentId } = req.params;
		const user_sub = req.user.sub;

		try {
			const deleteCommand = new DeleteItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ buildId: buildId, id: commentId }),
				ConditionExpression: "user_sub = :user_sub",
				ExpressionAttributeValues: marshall({
					":user_sub": user_sub,
				}),
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

app.patch("/api/builds/:id/like", async (req, res) => {
	const { id } = req.params;

	const params = {
		TableName: BUILDS_TABLE,
		Key: marshall({ id }),
		UpdateExpression: "SET #likeAttr = if_not_exists(#likeAttr, :start) + :inc",
		ExpressionAttributeNames: {
			"#likeAttr": "like",
		},
		ExpressionAttributeValues: marshall({
			":inc": 1,
			":start": 0,
		}),
		ReturnValues: "ALL_NEW",
	};

	try {
		const command = new UpdateItemCommand(params);
		const { Attributes } = await client.send(command);
		res.json(unmarshall(Attributes));
	} catch (error) {
		console.error("Error liking build:", error);
		res.status(500).json({ error: "Could not like build" });
	}
});

app.patch(
	"/api/builds/:id/favorite",
	authenticateCognitoToken,
	async (req, res) => {
		const { id } = req.params;
		const userSub = req.user.sub;

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
			let favorites = build.favorite || [];

			const userIndex = favorites.indexOf(userSub);
			if (userIndex > -1) {
				favorites.splice(userIndex, 1);
			} else {
				favorites.push(userSub);
			}

			const updateCommand = new UpdateItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
				UpdateExpression: "SET #favAttr = :newList",
				ExpressionAttributeNames: {
					"#favAttr": "favorite",
				},
				ExpressionAttributeValues: marshall({
					":newList": favorites,
				}),
				ReturnValues: "ALL_NEW",
			});

			const { Attributes } = await client.send(updateCommand);
			res.json(unmarshall(Attributes));
		} catch (error) {
			console.error("Error toggling favorite:", error);
			res.status(500).json({ error: "Could not toggle favorite status" });
		}
	}
);

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Route not found" });
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
