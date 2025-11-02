import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand, // 1. Import thêm DeleteItemCommand
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";

const router = express.Router();
const CHAMPIONS_TABLE = "guidePocChampions";

/**
 * @route   GET /api/champions
 * @desc    Lấy danh sách tất cả tướng (Không thay đổi)
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
 * @route   PUT /api/champions
 * @desc    Tạo mới hoặc cập nhật một tướng (Không thay đổi)
 * @access  Private (Admin)
 */
router.put("/", authenticateCognitoToken, async (req, res) => {
	const championData = req.body;
	if (!championData.championID || !championData.name) {
		return res.status(400).json({ error: "Champion ID và Name là bắt buộc." });
	}

	try {
		const command = new PutItemCommand({
			TableName: CHAMPIONS_TABLE,
			// marshall sẽ tự động xử lý các kiểu dữ liệu
			Item: marshall(championData, { removeUndefinedValues: true }),
		});
		await client.send(command);
		res.status(200).json({
			message: "Dữ liệu tướng đã được lưu thành công.",
			champion: championData,
		});
	} catch (error) {
		console.error("Lỗi khi lưu dữ liệu tướng:", error);
		res.status(500).json({ error: "Không thể lưu dữ liệu tướng." });
	}
});

/**
 * @route   DELETE /api/champions/:championID
 * @desc    Xóa một tướng dựa trên ID.
 * @access  Private (Admin)
 */
router.delete("/:championID", authenticateCognitoToken, async (req, res) => {
	const { championID } = req.params;

	// Chuyển đổi ID từ string (trong URL) sang số
	const parsedChampionID = parseInt(championID, 10);
	if (isNaN(parsedChampionID)) {
		return res.status(400).json({ error: "Champion ID không hợp lệ." });
	}

	try {
		const command = new DeleteItemCommand({
			TableName: CHAMPIONS_TABLE,
			// Key là khóa chính của mục cần xóa
			Key: {
				championID: { N: parsedChampionID.toString() }, // 'N' cho kiểu Number
			},
		});

		await client.send(command);

		res
			.status(200)
			.json({ message: `Tướng với ID ${parsedChampionID} đã được xóa.` });
	} catch (error) {
		console.error("Lỗi khi xóa tướng:", error);
		res.status(500).json({ error: "Không thể xóa tướng." });
	}
});

export default router;
