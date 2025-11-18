// be/src/routes/relics.js

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
const RELICS_TABLE = "guidePocRelics";

// GET /api/relics - Lấy danh sách tất cả các relics
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: RELICS_TABLE });
		const { Items } = await client.send(command);
		const relics = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(relics);
	} catch (error) {
		console.error("Error getting relics:", error);
		res.status(500).json({ error: "Could not retrieve relics" });
	}
});

// PUT /api/relics - Cập nhật hoặc thêm mới (Upsert)
router.put("/", authenticateCognitoToken, async (req, res) => {
	const relicData = req.body;
	if (!relicData.relicCode) {
		return res.status(400).json({ error: "Relic code is required" });
	}
	try {
		const command = new PutItemCommand({
			TableName: RELICS_TABLE,
			Item: marshall(relicData),
		});
		await client.send(command);
		res.status(200).json({
			message: "Relic data updated successfully",
			relic: relicData,
		});
	} catch (error) {
		console.error("Error updating relic data:", error);
		res.status(500).json({ error: "Could not update relic data" });
	}
});

// Route để xóa relic theo relicCode
router.delete("/:relicCode", authenticateCognitoToken, async (req, res) => {
	const { relicCode } = req.params;

	if (!relicCode) {
		return res.status(400).json({ error: "Relic code is required" });
	}

	try {
		const command = new DeleteItemCommand({
			TableName: RELICS_TABLE,
			Key: marshall({ relicCode }),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: `Relic with code ${relicCode} deleted successfully` });
	} catch (error) {
		console.error("Error deleting relic:", error);
		res.status(500).json({ error: "Could not delete relic" });
	}
});

export default router;
