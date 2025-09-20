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

// Kiểm tra biến môi trường
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
	console.error("Thiếu biến môi trường:", missingEnvVars.join(", "));
	process.exit(1);
}

// Debug: In ra tất cả biến môi trường để kiểm tra
console.log("Biến môi trường đã tải:", {
	AWS_REGION: process.env.AWS_REGION,
	COGNITO_USER_POOL_ID: process.env.COGNITO_USER_POOL_ID,
	COGNITO_APP_CLIENT_ID: process.env.COGNITO_APP_CLIENT_ID,
	FRONTEND_URL: process.env.FRONTEND_URL,
});

const client = new DynamoDBClient({
	region: process.env.AWS_REGION || "us-east-1",
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

const BUILDS_TABLE = "Builds";
const COMMENTS_TABLE = "wpocComment";

const verifier = CognitoJwtVerifier.create({
	userPoolId: process.env.COGNITO_USER_POOL_ID,
	tokenUse: "id",
	clientId: process.env.COGNITO_APP_CLIENT_ID,
});

const app = express();
app.use(morgan("dev"));
app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:5173",
		methods: ["GET", "POST", "PUT", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		exposedHeaders: ["Content-Type"],
		credentials: false,
	})
);
app.use(express.json());

// Middleware để đảm bảo phản hồi JSON
app.use((req, res, next) => {
	res.setHeader("Content-Type", "application/json");
	next();
});

// Middleware để verify Cognito JWT
const authenticateCognitoToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (!token) {
		return res.status(401).json({ error: "Token không hợp lệ: Thiếu token" });
	}

	try {
		const payload = await verifier.verify(token);
		req.user = payload;
		next();
	} catch (err) {
		console.error("Lỗi xác thực token:", {
			message: err.message,
			stack: err.stack,
			userPoolId: process.env.COGNITO_USER_POOL_ID,
			clientId: process.env.COGNITO_APP_CLIENT_ID,
		});
		res.status(403).json({
			error: "Token không hợp lệ",
			details: err.message,
		});
	}
};

// Health check
app.get("/api/checkheal", async (req, res) => {
	try {
		const command = new DescribeTableCommand({ TableName: BUILDS_TABLE });
		await client.send(command);
		res.status(200).json({
			status: "healthy",
			message: "Server và DynamoDB đang hoạt động bình thường",
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error("Lỗi health check:", error);
		res.status(500).json({
			status: "unhealthy",
			message: "Lỗi khi kết nối đến DynamoDB",
			error: error.message,
		});
	}
});

// Load all builds (public)
app.get("/api/builds", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: BUILDS_TABLE });
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Lỗi:", error);
		res.status(500).json({ error: "Không thể tải xuống builds" });
	}
});

// Load user's builds (require auth)
app.get("/api/my-builds", authenticateCognitoToken, async (req, res) => {
	try {
		const command = new ScanCommand({
			TableName: BUILDS_TABLE,
			FilterExpression: "creator = :creator",
			ExpressionAttributeValues: marshall({
				":creator": req.user["cognito:username"],
			}),
		});
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Lỗi:", error);
		res.status(500).json({ error: "Không thể tải my builds" });
	}
});

// Add new build (require auth)
app.post("/api/builds", authenticateCognitoToken, async (req, res) => {
	console.log("Received payload:", req.body);
	const {
		id,
		championName,
		description,
		artifacts = [],
		powers = [],
	} = req.body;

	if (!id || !championName || !description) {
		return res.status(400).json({
			error: `Thiếu các trường bắt buộc: ${!id ? "id, " : ""}${
				!championName ? "championName, " : ""
			}${!description ? "description" : ""}`,
		});
	}

	const build = {
		id: { S: id },
		creator: { S: req.user["cognito:username"] },
		description: { S: description },
		championName: { S: championName },
		artifacts: {
			L: Array.isArray(artifacts) ? artifacts.map(a => ({ S: a })) : [],
		},
		powers: { L: Array.isArray(powers) ? powers.map(p => ({ S: p })) : [] },
	};

	try {
		const getBuild = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id: id }),
		});
		const { Item } = await client.send(getBuild);
		if (Item) {
			return res.status(400).json({ error: "ID build đã tồn tại" });
		}

		const command = new PutItemCommand({
			TableName: BUILDS_TABLE,
			Item: build,
		});
		await client.send(command);
		res
			.status(201)
			.json({ message: "Build đã được tạo", build: unmarshall(build) });
	} catch (error) {
		console.error("Lỗi tạo build:", error);
		res.status(500).json({ error: "Không thể tạo build" });
	}
});

// Update a build (require auth, only owner)
app.put("/api/builds/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const { championName, description, artifacts, powers } = req.body;
	if (!championName || !description) {
		return res.status(400).json({
			error: "Thiếu các trường bắt buộc: championName, description",
		});
	}

	try {
		const getBuild = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		const { Item } = await client.send(getBuild);
		if (!Item || unmarshall(Item).creator !== req.user["cognito:username"]) {
			return res.status(403).json({ error: "Không có quyền sửa build này" });
		}

		const command = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression:
				"SET championName = :c, description = :d, artifacts = :a, powers = :p",
			ExpressionAttributeValues: marshall({
				":c": championName,
				":d": description,
				":a": Array.isArray(artifacts) ? artifacts.map(a => ({ S: a })) : [],
				":p": Array.isArray(powers) ? powers.map(p => ({ S: p })) : [],
			}),
			ReturnValues: "ALL_NEW",
		});
		const response = await client.send(command);
		const updatedItem = unmarshall(response.Attributes);
		res.json({ message: "Build đã được cập nhật", build: updatedItem });
	} catch (error) {
		console.error("Lỗi cập nhật build:", error);
		res.status(500).json({ error: "Không thể cập nhật build" });
	}
});

// Delete a build (require auth, only owner)
app.delete("/api/builds/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	try {
		const getBuild = new GetItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
		});
		const { Item } = await client.send(getBuild);
		if (!Item || unmarshall(Item).creator !== req.user["cognito:username"]) {
			return res.status(403).json({ error: "Không có quyền xóa build này" });
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

// Load comments for a champion (public)
app.get("/api/comments/:championName", async (req, res) => {
	const { championName } = req.params;
	try {
		const command = new ScanCommand({
			TableName: COMMENTS_TABLE,
			FilterExpression: "championName = :championName",
			ExpressionAttributeValues: marshall({
				":championName": championName,
			}),
		});
		const response = await client.send(command);
		const items = response.Items
			? response.Items.map(item => unmarshall(item))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Lỗi lấy bình luận:", error);
		res.status(500).json({ error: "Không thể tải bình luận" });
	}
});

// Add new comment (require auth)
app.post("/api/comments", authenticateCognitoToken, async (req, res) => {
	const { championName, content } = req.body;

	if (!content) {
		return res.status(400).json({
			error: "Thiếu trường bắt buộc: content",
		});
	}

	const commentid = uuidv4();
	if (typeof commentid !== "string") {
		console.error("Generated commentid is not a string:", commentid);
		return res.status(500).json({ error: "Lỗi tạo commentid" });
	}

	const comment = {
		commentid: commentid,
		championName: championName || "",
		creator: req.user["cognito:username"],
		content: content,
		createdAt: new Date().toISOString(),
		isEdited: false,
	};

	const marshalledComment = {
		commentid: { S: comment.commentid },
		championName: { S: comment.championName },
		creator: { S: comment.creator },
		content: { S: comment.content },
		createdAt: { S: comment.createdAt },
		isEdited: { BOOL: comment.isEdited },
	};

	try {
		const getComment = new GetItemCommand({
			TableName: COMMENTS_TABLE,
			Key: { commentid: { S: commentid } },
		});
		const { Item } = await client.send(getComment);
		if (Item) {
			return res.status(400).json({ error: "ID bình luận đã tồn tại" });
		}

		const command = new PutItemCommand({
			TableName: COMMENTS_TABLE,
			Item: marshalledComment,
		});
		await client.send(command);
		res.status(201).json({
			message: "Bình luận đã được tạo",
			comment: unmarshall(marshalledComment),
		});
	} catch (error) {
		console.error("Lỗi tạo bình luận:", {
			message: error.message,
			stack: error.stack,
			code: error.code,
			payload: req.body,
			commentid,
		});
		if (error.code === "ResourceNotFoundException") {
			return res.status(500).json({
				error: "Bảng wpocComment không tồn tại trong DynamoDB",
				details: error.message,
			});
		}
		res.status(500).json({
			error: "Không thể tạo bình luận",
			details: error.message || "Lỗi không xác định",
		});
	}
});

// Update a comment (require auth, only owner)
app.put(
	"/api/comments/:commentid",
	authenticateCognitoToken,
	async (req, res) => {
		const { commentid } = req.params;
		const { content } = req.body;

		if (!content) {
			return res.status(400).json({
				error: "Thiếu trường bắt buộc: content",
			});
		}

		try {
			const getComment = new GetItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ commentid }),
			});
			const { Item } = await client.send(getComment);
			if (!Item || unmarshall(Item).creator !== req.user["cognito:username"]) {
				return res
					.status(403)
					.json({ error: "Không có quyền sửa bình luận này" });
			}

			const command = new UpdateItemCommand({
				TableName: COMMENTS_TABLE,
				Key: marshall({ commentid }),
				UpdateExpression: "SET content = :c, isEdited = :e",
				ExpressionAttributeValues: marshall({
					":c": content,
					":e": true,
				}),
				ReturnValues: "ALL_NEW",
			});
			const response = await client.send(command);
			const updatedItem = unmarshall(response.Attributes);
			res.json({ message: "Bình luận đã được cập nhật", comment: updatedItem });
		} catch (error) {
			console.error("Lỗi cập nhật bình luận:", error);
			res.status(500).json({ error: "Không thể cập nhật bình luận" });
		}
	}
);

// Delete a comment (require auth, only owner)
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
			if (!Item || unmarshall(Item).creator !== req.user["cognito:username"]) {
				return res
					.status(403)
					.json({ error: "Không có quyền xóa bình luận này" });
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

// Load all comments (public, no auth required)
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
		res.status(500).json({
			error: "Không thể tải tất cả bình luận",
			details: error.message || "Lỗi không xác định",
		});
	}
});

// Xử lý lỗi 404
app.use((req, res) => {
	console.log(`Route không tồn tại: ${req.method} ${req.url}`);
	res.status(404).json({ error: "Route không tồn tại" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
	console.log(`Server đang chạy tại http://localhost:${port}`);
});
