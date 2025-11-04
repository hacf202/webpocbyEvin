// src/routes/champions.js
import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { requireAdmin } from "../middleware/requireAdmin.js";

const router = express.Router();
const CHAMPIONS_TABLE = "guidePocChampions";

/**
 * @route   GET /api/champions
 * @desc    Lấy danh sách tất cả tướng
 * @access  Public
 */
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: CHAMPIONS_TABLE });
		const { Items } = await client.send(command);
		const champions = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(champions);
	} catch (error) {
		console.error("Lỗi khi lấy danh sách tướng:", error);
		res.status(500).json({ error: "Không thể lấy danh sách tướng" });
	}
});

/**
 * @route   GET /api/champions/search?name=Kai'sa
 * @desc    Tìm tướng theo tên (dùng name-index)
 * @access  Public
 */
router.get("/search", async (req, res) => {
	const { name } = req.query;

	if (!name || typeof name !== "string" || name.trim().length < 1) {
		return res.status(400).json({ error: "Tham số 'name' là bắt buộc." });
	}

	const searchName = name.trim();

	try {
		const command = new QueryCommand({
			TableName: CHAMPIONS_TABLE,
			IndexName: "name-index",
			KeyConditionExpression: "#name = :name",
			ExpressionAttributeNames: { "#name": "name" },
			ExpressionAttributeValues: marshall({ ":name": searchName }),
		});

		const { Items } = await client.send(command);
		const champions = Items ? Items.map(item => unmarshall(item)) : [];

		res.json({ items: champions });
	} catch (error) {
		console.error("Lỗi tìm kiếm tướng theo tên:", error);
		res.status(500).json({ error: "Không thể tìm kiếm tướng." });
	}
});

/**
 * @route   PUT /api/champions
 * @desc    Tạo mới hoặc cập nhật một tướng
 * @access  Private (Admin only)
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const championData = req.body;

	// === VALIDATION ===
	if (!championData.championID || !championData.name?.trim()) {
		return res.status(400).json({ error: "Champion ID và Name là bắt buộc." });
	}

	// Cấm gửi isNew: true từ client nếu không hợp lệ
	if (championData.isNew === true && typeof championData.isNew !== "boolean") {
		return res.status(400).json({ error: "isNew phải là boolean." });
	}

	const championID = Number(championData.championID);
	if (isNaN(championID) || championID <= 0) {
		return res
			.status(400)
			.json({ error: "Champion ID phải là số nguyên dương." });
	}

	const maxStar = championData.maxStar ?? 7;
	if (!Number.isInteger(maxStar) || maxStar < 1 || maxStar > 7) {
		return res
			.status(400)
			.json({ error: "maxStar phải là số nguyên từ 1 đến 7." });
	}

	const cleanData = {
		...championData,
		championID,
		name: championData.name.trim(),
		maxStar,
	};

	try {
		// === KIỂM TRA TỒN TẠI THEO LOẠI ===
		const checkCmd = new GetItemCommand({
			TableName: CHAMPIONS_TABLE,
			Key: { championID: { N: championID.toString() } },
		});
		const { Item } = await client.send(checkCmd);

		if (championData.isNew === true) {
			// TẠO MỚI → KHÔNG ĐƯỢC TỒN TẠI
			if (Item) {
				return res.status(400).json({ error: "Tướng với ID này đã tồn tại." });
			}
		} else {
			// CẬP NHẬT → PHẢI TỒN TẠI
			if (!Item) {
				return res
					.status(404)
					.json({ error: "Tướng không tồn tại để cập nhật." });
			}
		}

		// === LƯU DỮ LIỆU ===
		const command = new PutItemCommand({
			TableName: CHAMPIONS_TABLE,
			Item: marshall(cleanData, { removeUndefinedValues: true }),
			// Chỉ kiểm tra điều kiện khi tạo mới
			...(championData.isNew === true && {
				ConditionExpression: "attribute_not_exists(championID)",
			}),
		});

		await client.send(command);

		res.status(200).json({
			message: championData.isNew
				? "Tạo tướng mới thành công."
				: "Cập nhật tướng thành công.",
			champion: cleanData,
		});
	} catch (error) {
		if (error.name === "ConditionalCheckFailedException") {
			return res.status(400).json({ error: "Tướng đã tồn tại." });
		}
		console.error("Lỗi khi lưu dữ liệu tướng:", error);
		res.status(500).json({ error: "Không thể lưu dữ liệu tướng." });
	}
});

/**
 * @route   DELETE /api/champions/:championID
 * @desc    Xóa một tướng dựa trên ID
 * @access  Private (Admin only)
 */
router.delete(
	"/:championID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { championID } = req.params;
		const parsedChampionID = parseInt(championID, 10);

		if (isNaN(parsedChampionID) || parsedChampionID <= 0) {
			return res.status(400).json({ error: "Champion ID không hợp lệ." });
		}

		try {
			const getCmd = new GetItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: { championID: { N: parsedChampionID.toString() } },
			});
			const { Item } = await client.send(getCmd);
			if (!Item) {
				return res.status(404).json({ error: "Không tìm thấy tướng để xóa." });
			}

			const deleteCmd = new DeleteItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: { championID: { N: parsedChampionID.toString() } },
			});

			await client.send(deleteCmd);

			res.status(200).json({
				message: `Tướng "${
					unmarshall(Item).name
				}" (ID: ${parsedChampionID}) đã được xóa thành công.`,
			});
		} catch (error) {
			console.error("Lỗi khi xóa tướng:", error);
			res.status(500).json({ error: "Không thể xóa tướng." });
		}
	}
);

export default router;
