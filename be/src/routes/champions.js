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
const CHAMPIONS_TABLE = "guidePocChampionList";

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
 * @route   GET /api/champions/search?name=Miss%20Fortune
 * @desc    Tìm tướng theo tên (exact match trên name-index)
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
 * @desc    Tạo mới hoặc cập nhật một tướng (championID là String: C056, TFT9_, v.v.)
 * @access  Private (Admin only)
 */
router.put("/", authenticateCognitoToken, requireAdmin, async (req, res) => {
	const rawData = req.body; // ← đúng

	// === VALIDATION ===
	if (!rawData.championID || !rawData.name?.trim()) {
		return res.status(400).json({ error: "championID và name là bắt buộc." });
	}

	const championID = rawData.championID.trim();

	if (championID.length < 2 || championID.length > 50) {
		return res.status(400).json({ error: "championID phải từ 2-50 ký tự." });
	}
	if (!/^[A-Za-z0-9_-]+$/.test(championID)) {
		return res.status(400).json({
			error: "championID chỉ được chứa chữ cái, số, gạch dưới và gạch ngang.",
		});
	}

	const maxStar = Number(rawData.maxStar) || 7;
	if (!Number.isInteger(maxStar) || maxStar < 1 || maxStar > 7) {
		return res.status(400).json({ error: "maxStar phải là số từ 1-7." });
	}

	// LOẠI BỎ isNew TRƯỚC KHI LƯU – QUAN TRỌNG NHẤT
	const { isNew, ...dataToSave } = rawData;

	const cleanData = {
		...dataToSave,
		championID,
		name: rawData.name.trim(),
		maxStar,
	};

	try {
		const checkCmd = new GetItemCommand({
			TableName: CHAMPIONS_TABLE,
			Key: marshall({ championID }),
		});
		const { Item } = await client.send(checkCmd);

		// DÙNG isNew TỪ rawData ĐÃ DESTRUCTURING
		if (isNew === true) {
			if (Item) {
				return res.status(400).json({ error: "Tướng với ID này đã tồn tại." });
			}
		} else {
			if (!Item) {
				return res
					.status(404)
					.json({ error: "Tướng không tồn tại để cập nhật." });
			}
		}

		const command = new PutItemCommand({
			TableName: CHAMPIONS_TABLE,
			Item: marshall(cleanData, { removeUndefinedValues: true }),
			...(isNew === true && {
				ConditionExpression: "attribute_not_exists(championID)",
			}),
		});

		await client.send(command);

		res.json({
			message: isNew
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
 * @desc    Xóa tướng theo championID (String)
 * @access  Private (Admin only)
 */
router.delete(
	"/:championID",
	authenticateCognitoToken,
	requireAdmin,
	async (req, res) => {
		const { championID } = req.params;

		if (
			!championID ||
			typeof championID !== "string" ||
			championID.trim().length < 1
		) {
			return res.status(400).json({ error: "championID không hợp lệ." });
		}

		const id = championID.trim();

		try {
			const getCmd = new GetItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: marshall({ championID: id }),
			});
			const { Item } = await client.send(getCmd);

			if (!Item) {
				return res.status(404).json({ error: "Không tìm thấy tướng để xóa." });
			}

			const deleteCmd = new DeleteItemCommand({
				TableName: CHAMPIONS_TABLE,
				Key: marshall({ championID: id }),
			});

			await client.send(deleteCmd);

			const deletedChampion = unmarshall(Item);

			res.status(200).json({
				message: `Tướng "${deletedChampion.name}" (ID: ${id}) đã được xóa thành công.`,
			});
		} catch (error) {
			console.error("Lỗi khi xóa tướng:", error);
			res.status(500).json({ error: "Không thể xóa tướng." });
		}
	}
);

export default router;
