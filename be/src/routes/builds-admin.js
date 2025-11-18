// src/routes/builds-admin.js
import express from "express";
import {
	GetItemCommand,
	ScanCommand,
	UpdateItemCommand,
	DeleteItemCommand,
	PutItemCommand, // THÊM: để tạo build mới
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import { normalizeBuildFromDynamo } from "../utils/dynamodb.js";
import { invalidatePublicBuildsCache } from "../utils/buildCache.js"; // ĐÃ CÓ

const router = express.Router();
const BUILDS_TABLE = "Builds";

/**
 * GET /api/admin/builds – LẤY TẤT CẢ
 */
router.get("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: BUILDS_TABLE });
		const { Items } = await client.send(command);
		const builds = Items
			? Items.map(item => normalizeBuildFromDynamo(unmarshall(item)))
			: [];
		res.json({ items: builds });
	} catch (error) {
		console.error("Lỗi lấy tất cả build (admin):", error);
		res.status(500).json({ error: "Không thể lấy danh sách build." });
	}
});

/**
 * POST /api/admin/builds – TẠO MỚI (THÊM MỚI)
 */
router.post("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const buildData = req.body;

	if (!buildData.championName?.trim()) {
		return res.status(400).json({ error: "Tên tướng là bắt buộc." });
	}

	const id = Date.now().toString(); // hoặc dùng uuidv4()
	const newBuild = {
		id,
		...buildData,
		creator: req.user["cognito:username"],
		sub: req.user.sub,
		createdAt: new Date().toISOString(),
		views: 0,
		like: 0,
		favorite: [],
		display: buildData.display === true,
	};

	try {
		await client.send(
			new PutItemCommand({
				TableName: BUILDS_TABLE,
				Item: marshall(newBuild, { removeUndefinedValues: true }),
			})
		);

		const normalized = normalizeBuildFromDynamo(newBuild);
		normalized.creatorName = req.user.name || req.user["cognito:username"];

		// XÓA CACHE nếu build mới là công khai
		if (normalized.display) {
			invalidatePublicBuildsCache();
		}

		res
			.status(201)
			.json({ message: "Tạo build thành công", build: normalized });
	} catch (error) {
		console.error("Lỗi tạo build:", error);
		res.status(500).json({ error: "Không thể tạo build." });
	}
});

/**
 * PUT /api/admin/builds/:id – SỬA
 */
router.put("/:id", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const { id } = req.params;
	const updates = req.body;

	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		if (!Item) return res.status(404).json({ error: "Build không tồn tại." });

		const oldBuild = unmarshall(Item);
		const oldDisplay = oldBuild.display === "true" || oldBuild.display === true;

		// Xây dựng update
		let updateExpression = "SET";
		const expressionAttributeNames = {};
		const expressionAttributeValues = {};

		const allowedFields = [
			"championName",
			"description",
			"artifacts",
			"powers",
			"rune",
			"star",
			"display",
			"like",
			"views",
		];

		let hasUpdates = false;
		Object.entries(updates).forEach(([key, value]) => {
			if (allowedFields.includes(key) && value !== undefined) {
				hasUpdates = true;
				const attrKey = `#${key}`;
				const valKey = `:${key}`;
				updateExpression += ` ${attrKey} = ${valKey},`;
				expressionAttributeNames[attrKey] = key;
				expressionAttributeValues[valKey] =
					key === "display" ? (value ? "true" : "false") : value;
			}
		});

		if (!hasUpdates) {
			return res
				.status(400)
				.json({ error: "Không có trường nào để cập nhật." });
		}

		updateExpression = updateExpression.slice(0, -1);

		const command = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: marshall(expressionAttributeValues),
			ReturnValues: "ALL_NEW",
		});

		const { Attributes } = await client.send(command);
		const updatedBuild = normalizeBuildFromDynamo(unmarshall(Attributes));

		// XÓA CACHE nếu display thay đổi HOẶC build đang công khai
		const newDisplay = updatedBuild.display === true;
		if (oldDisplay || newDisplay) {
			invalidatePublicBuildsCache();
		}

		res.json({ message: "Cập nhật thành công", build: updatedBuild });
	} catch (error) {
		console.error("Lỗi sửa build:", error);
		res.status(500).json({ error: "Không thể cập nhật build." });
	}
});

/**
 * DELETE /api/admin/builds/:id – XÓA
 */
router.delete(
	"/:id",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { id } = req.params;

		try {
			const { Item } = await client.send(
				new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
			);
			if (!Item) return res.status(404).json({ error: "Build không tồn tại." });

			const build = unmarshall(Item);
			const wasPublic = build.display === "true" || build.display === true;

			await client.send(
				new DeleteItemCommand({
					TableName: BUILDS_TABLE,
					Key: marshall({ id }),
				})
			);

			// XÓA CACHE nếu build bị xóa là công khai
			if (wasPublic) {
				invalidatePublicBuildsCache();
			}

			res.json({ message: "Xóa build thành công" });
		} catch (error) {
			console.error("Lỗi xóa build:", error);
			res.status(500).json({ error: "Không thể xóa build." });
		}
	}
);

export default router;
