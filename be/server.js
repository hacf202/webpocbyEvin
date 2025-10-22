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
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
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
const COMMENTS_TABLE = "wpocComment";
const FAVORITE_TABLE = "Favorite";

const client = new DynamoDBClient({ region: AWS_REGION });

// --- FIX: Changed tokenUse to 'id' ---
const verifier = CognitoJwtVerifier.create({
	userPoolId: COGNITO_USER_POOL_ID,
	tokenUse: "id", // Chấp nhận ID Token thay vì Access Token
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
	if (!token) {
		return res.status(401).json({ error: "Token is missing" });
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

// --- API Routes ---

// Health check
app.get("/api/checkheal", async (req, res) => {
	try {
		await client.send(new DescribeTableCommand({ TableName: BUILDS_TABLE }));
		res.status(200).json({
			status: "OK",
			message: "Server is running and connected to DynamoDB",
		});
	} catch (error) {
		res.status(500).json({
			status: "ERROR",
			message: "Failed to connect to DynamoDB",
			error: error.message,
		});
	}
});

// --- Builds API ---

// Get all builds (public)
app.get("/api/builds", async (req, res) => {
	try {
		const command = new ScanCommand({
			TableName: BUILDS_TABLE,
			// --- FILTER START ---
			FilterExpression: "#display = :display",
			ExpressionAttributeNames: { "#display": "display" },
			ExpressionAttributeValues: marshall({ ":display": true }),
			// --- FILTER END ---
		});
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Error getting all public builds:", error);
		res.status(500).json({ error: "Could not retrieve builds" });
	}
});

// Get builds for the current user (requires auth)
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

app.post("/api/builds", authenticateCognitoToken, async (req, res) => {
	console.log("Received payload for new build:", req.body);

	// Destructure all properties from the request body.
	// 'display' will default to 'false' if it's not provided in the request.
	const {
		championName,
		description = "",
		artifacts = [],
		powers = [],
		rune = [],
		star = 0,
		display = false,
	} = req.body;

	// Validation for required fields remains the same.
	if (!championName || !Array.isArray(artifacts) || artifacts.length === 0) {
		let missingFields = [];
		if (!championName) {
			missingFields.push("championName");
		}
		if (!Array.isArray(artifacts) || artifacts.length === 0) {
			missingFields.push("artifacts (must be a non-empty array)");
		}
		return res.status(400).json({
			error: `Missing required fields: ${missingFields.join(", ")}`,
		});
	}

	// Construct the build item for DynamoDB.
	const build = {
		id: { S: uuidv4() },
		sub: { S: req.user.sub },
		creator: { S: req.user["cognito:username"] },
		description: { S: description },
		championName: { S: championName },
		artifacts: { L: artifacts.map(a => ({ S: a })) },
		powers: { L: powers.map(p => ({ S: p })) },
		rune: { L: rune.map(r => ({ S: r })) },
		like: { N: "0" },
		star: { N: star.toString() },
		// Use the 'display' value from the request body.
		display: { BOOL: display },
	};

	try {
		const command = new PutItemCommand({
			TableName: BUILDS_TABLE,
			Item: build,
		});
		await client.send(command);

		// Return a success message and the created build data.
		res.status(201).json({
			message: "Build created successfully",
			build: unmarshall(build),
		});
	} catch (error) {
		console.error("Error creating build:", error);
		res.status(500).json({ error: "Could not create build" });
	}
});

// Update a build (requires auth)
app.put("/api/builds/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const { description, artifacts, powers, rune, star, display } = req.body;
	const username = req.user["cognito:username"];

	try {
		const getBuild = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		const { Item } = await client.send(getBuild);

		if (!Item) {
			return res.status(404).json({ error: "Build không tồn tại" });
		}

		const build = unmarshall(Item);
		if (build.creator !== username) {
			return res
				.status(403)
				.json({ error: "Bạn không có quyền chỉnh sửa build này" });
		}

		// Construct update expression
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
			return res.status(400).json({ error: "Không có trường nào để cập nhật" });
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
			message: "Build đã được cập nhật",
			build: unmarshall(Attributes),
		});
	} catch (error) {
		console.error("Lỗi cập nhật build:", error);
		res.status(500).json({ error: "Không thể cập nhật build" });
	}
});

// Delete a build (requires auth)
app.delete("/api/builds/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const username = req.user["cognito:username"];

	try {
		const getBuild = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		const { Item } = await client.send(getBuild);

		if (!Item) {
			return res.status(404).json({ error: "Build không tồn tại" });
		}
		const build = unmarshall(Item);
		if (build.creator !== username) {
			return res
				.status(403)
				.json({ error: "Bạn không có quyền xóa build này" });
		}

		const command = new DeleteItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		await client.send(command);
		res.json({ message: "Build đã được xóa" });
	} catch (error) {
		console.error("Lỗi xóa build:", error);
		res.status(500).json({ error: "Không thể xóa build" });
	}
});

// --- Favorite API ---

// Lấy danh sách build ưa thích của người dùng hiện tại (yêu cầu xác thực)
app.get("/api/favorites", authenticateCognitoToken, async (req, res) => {
	const { sub } = req.user;
	try {
		const command = new GetItemCommand({
			TableName: FAVORITE_TABLE,
			Key: marshall({ sub }),
		});
		const { Item } = await client.send(command);
		if (Item) {
			const favoriteList = unmarshall(Item);
			res.json({ builds: favoriteList.builds || [] });
		} else {
			// Nếu người dùng chưa có danh sách ưa thích, trả về mảng rỗng
			res.json({ builds: [] });
		}
	} catch (error) {
		console.error("Lỗi lấy danh sách ưa thích:", error);
		res.status(500).json({ error: "Không thể lấy danh sách ưa thích" });
	}
});

// Thêm một build vào danh sách ưa thích (yêu cầu xác thực)
app.post("/api/favorites", authenticateCognitoToken, async (req, res) => {
	const { sub } = req.user;
	const { buildId } = req.body;

	if (!buildId) {
		return res.status(400).json({ error: "buildId là bắt buộc" });
	}

	try {
		// Sử dụng ADD để thêm vào một Set, tự động xử lý trùng lặp
		const command = new UpdateItemCommand({
			TableName: FAVORITE_TABLE,
			Key: marshall({ sub }),
			UpdateExpression: "ADD builds :buildId",
			ExpressionAttributeValues: {
				":buildId": { SS: [buildId] }, // Sử dụng String Set (SS)
			},
			ReturnValues: "ALL_NEW",
		});
		const { Attributes } = await client.send(command);
		res.status(200).json({
			message: "Đã thêm vào danh sách ưa thích",
			favorites: unmarshall(Attributes),
		});
	} catch (error) {
		console.error("Lỗi thêm vào danh sách ưa thích:", error);
		res.status(500).json({ error: "Không thể thêm vào danh sách ưa thích" });
	}
});

// Xóa một build khỏi danh sách ưa thích (yêu cầu xác thực)
app.delete(
	"/api/favorites/:buildId",
	authenticateCognitoToken,
	async (req, res) => {
		const { sub } = req.user;
		const { buildId } = req.params;

		try {
			// Sử dụng DELETE để xóa một item khỏi Set
			const command = new UpdateItemCommand({
				TableName: FAVORITE_TABLE,
				Key: marshall({ sub }),
				UpdateExpression: "DELETE builds :buildId",
				ExpressionAttributeValues: {
					":buildId": { SS: [buildId] },
				},
				ReturnValues: "ALL_NEW",
			});
			const { Attributes } = await client.send(command);
			res.status(200).json({
				message: "Đã xóa khỏi danh sách ưa thích",
				favorites: Attributes ? unmarshall(Attributes) : { sub, builds: [] },
			});
		} catch (error) {
			console.error("Lỗi xóa khỏi danh sách ưa thích:", error);
			res.status(500).json({ error: "Không thể xóa khỏi danh sách ưa thích" });
		}
	}
);

// --- Comments API ---

// Get comments for a champion (public)
app.get("/api/comments/:championName", async (req, res) => {
	const { championName } = req.params;
	try {
		const command = new ScanCommand({
			TableName: COMMENTS_TABLE,
			FilterExpression: "championName = :championName",
			ExpressionAttributeValues: marshall({ ":championName": championName }),
		});
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Error getting comments:", error);
		res.status(500).json({ error: "Could not retrieve comments" });
	}
});

// Create a new comment (requires auth)
app.post("/api/comments", authenticateCognitoToken, async (req, res) => {
	const { championName, text } = req.body;
	if (!championName || !text) {
		return res
			.status(400)
			.json({ error: "championName and text are required" });
	}
	const comment = {
		commentid: { S: uuidv4() },
		creator: { S: req.user["cognito:username"] },
		championName: { S: championName },
		text: { S: text },
		createdAt: { S: new Date().toISOString() },
	};
	try {
		const command = new PutItemCommand({
			TableName: COMMENTS_TABLE,
			Item: comment,
		});
		await client.send(command);
		res
			.status(201)
			.json({ message: "Comment created", comment: unmarshall(comment) });
	} catch (error) {
		console.error("Error creating comment:", error);
		res.status(500).json({ error: "Could not create comment" });
	}
});

// Update a comment (requires auth)
app.put(
	"/api/comments/:commentid",
	authenticateCognitoToken,
	async (req, res) => {
		const { commentid } = req.params;
		const { text } = req.body;
		if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}
		try {
			const getComment = new GetItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ commentid }),
			});
			const { Item } = await client.send(getComment);
			if (!Item) {
				return res.status(404).json({ error: "Comment not found" });
			}
			const comment = unmarshall(Item);
			if (comment.creator !== req.user["cognito:username"]) {
				return res
					.status(403)
					.json({ error: "You are not authorized to edit this comment" });
			}
			const command = new UpdateItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ commentid }),
				UpdateExpression: "SET #text = :text",
				ExpressionAttributeNames: { "#text": "text" },
				ExpressionAttributeValues: marshall({ ":text": text }),
				ReturnValues: "ALL_NEW",
			});
			const { Attributes } = await client.send(command);
			res.json({ message: "Comment updated", comment: unmarshall(Attributes) });
		} catch (error) {
			console.error("Error updating comment:", error);
			res.status(500).json({ error: "Could not update comment" });
		}
	}
);

// Delete a comment (requires auth)
app.delete(
	"/api/comments/:commentid",
	authenticateCognitoToken,
	async (req, res) => {
		const { commentid } = req.params;
		try {
			const getComment = new GetItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ commentid }),
			});
			const { Item } = await client.send(getComment);
			if (!Item) {
				return res.status(404).json({ error: "Bình luận không tồn tại" });
			}
			const comment = unmarshall(Item);
			if (comment.creator !== req.user["cognito:username"]) {
				return res
					.status(403)
					.json({ error: "Bạn không có quyền xóa bình luận này" });
			}
			const command = new DeleteItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ commentid }),
			});
			await client.send(command);
			res.json({ message: "Bình luận đã được xóa" });
		} catch (error) {
			console.error("Lỗi xóa bình luận:", error);
			res.status(500).json({ error: "Không thể xóa bình luận" });
		}
	}
);

// Get all comments (public)
app.get("/api/all-comments", async (req, res) => {
	try {
		const command = new ScanCommand({
			TableName: COMMENTS_TABLE,
		});
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Lỗi lấy tất cả bình luận:", {
			message: error.message,
			stack: error.stack,
			code: error.code,
		});
		if (error.code === "ResourceNotFoundException") {
			return res.status(500).json({
				error: "Bảng wpocComment không tồn tại trong DynamoDB",
				details: error.message,
			});
		}
		res.status(500).json({ error: "Không thể lấy danh sách bình luận" });
	}
});

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

// PATCH to toggle favorite status for a build
app.patch(
	"/api/builds/:id/favorite",
	authenticateCognitoToken,
	async (req, res) => {
		const { id } = req.params;
		const userSub = req.user.sub;

		try {
			// 1. Get the current build to check its favorite list
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

			// 2. Add or remove the user's sub from the list
			const userIndex = favorites.indexOf(userSub);
			if (userIndex > -1) {
				// User already favorited, so remove them
				favorites.splice(userIndex, 1);
			} else {
				// User has not favorited, so add them
				favorites.push(userSub);
			}

			// 3. Update the build with the new favorite list
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

// GET favorite builds for the logged-in user
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

// 404 handler
app.use((req, res) => {
	res.status(404).json({ error: "Route không tồn tại" });
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
