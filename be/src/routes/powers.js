// be/src/routes/powers.js

import express from "express";
import {
	ScanCommand,
	PutItemCommand,
	DeleteItemCommand, // <<< THÊM MỚI
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";

const router = express.Router();
const POWERS_TABLE = "guidePocPowers";

// GET /api/powers - Lấy danh sách tất cả các năng lực
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: POWERS_TABLE });
		const { Items } = await client.send(command);
		const powers = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(powers);
	} catch (error) {
		console.error("Error getting powers:", error);
		res.status(500).json({ error: "Could not retrieve powers" });
	}
});

// PUT /api/powers - Cập nhật hoặc thêm mới (Upsert)
router.put("/", authenticateCognitoToken, async (req, res) => {
	const powerData = req.body;
	if (!powerData.powerCode) {
		return res.status(400).json({ error: "Power code is required" });
	}
	try {
		const command = new PutItemCommand({
			TableName: POWERS_TABLE,
			Item: marshall(powerData),
		});
		await client.send(command);
		res.status(200).json({
			message: "Power data updated successfully",
			power: powerData,
		});
	} catch (error) {
		console.error("Error updating power data:", error);
		res.status(500).json({ error: "Could not update power data" });
	}
});

// <<< THÊM MỚI: Route để xóa power theo powerCode >>>
router.delete("/:powerCode", authenticateCognitoToken, async (req, res) => {
	const { powerCode } = req.params;

	if (!powerCode) {
		return res.status(400).json({ error: "Power code is required" });
	}

	try {
		const command = new DeleteItemCommand({
			TableName: POWERS_TABLE,
			Key: marshall({ powerCode }),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: `Power with code ${powerCode} deleted successfully` });
	} catch (error) {
		console.error("Error deleting power:", error);
		res.status(500).json({ error: "Could not delete power" });
	}
});

export default router;
