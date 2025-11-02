// be/src/routes/runes.js

import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";

const router = express.Router();
const RUNES_TABLE = "guidePocRunes";

// GET /api/runes - Lấy danh sách tất cả các runes
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: RUNES_TABLE });
		const { Items } = await client.send(command);
		const runes = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(runes);
	} catch (error) {
		console.error("Error getting runes:", error);
		res.status(500).json({ error: "Could not retrieve runes" });
	}
});

// PUT /api/runes - Cập nhật hoặc thêm mới (Upsert)
router.put("/", authenticateCognitoToken, async (req, res) => {
	const runeData = req.body;
	if (!runeData.runeCode) {
		return res.status(400).json({ error: "Rune code is required" });
	}
	try {
		const command = new PutItemCommand({
			TableName: RUNES_TABLE,
			Item: marshall(runeData),
		});
		await client.send(command);
		res.status(200).json({
			message: "Rune data updated successfully",
			rune: runeData,
		});
	} catch (error) {
		console.error("Error updating rune data:", error);
		res.status(500).json({ error: "Could not update rune data" });
	}
});

// Route để xóa rune theo runeCode
router.delete("/:runeCode", authenticateCognitoToken, async (req, res) => {
	const { runeCode } = req.params;

	if (!runeCode) {
		return res.status(400).json({ error: "Rune code is required" });
	}

	try {
		const command = new DeleteItemCommand({
			TableName: RUNES_TABLE,
			Key: marshall({ runeCode }),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: `Rune with code ${runeCode} deleted successfully` });
	} catch (error) {
		console.error("Error deleting rune:", error);
		res.status(500).json({ error: "Could not delete rune" });
	}
});

export default router;
