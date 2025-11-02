// be/src/routes/generalPower.js

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
const GENERAL_POWER_TABLE = "guidePocGeneralPowers";

// GET /api/generalPower - Lấy danh sách tất cả các general power
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: GENERAL_POWER_TABLE });
		const { Items } = await client.send(command);
		const generalPowers = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(generalPowers);
	} catch (error) {
		console.error("Error getting general powers:", error);
		res.status(500).json({ error: "Could not retrieve general powers" });
	}
});

// PUT /api/generalPower - Cập nhật hoặc thêm mới (Upsert)
router.put("/", authenticateCognitoToken, async (req, res) => {
	const generalPowerData = req.body;
	if (!generalPowerData.generalPowerCode) {
		return res.status(400).json({ error: "General power code is required" });
	}
	try {
		const command = new PutItemCommand({
			TableName: GENERAL_POWER_TABLE,
			Item: marshall(generalPowerData),
		});
		await client.send(command);
		res.status(200).json({
			message: "General power data updated successfully",
			generalPower: generalPowerData,
		});
	} catch (error) {
		console.error("Error updating general power data:", error);
		res.status(500).json({ error: "Could not update general power data" });
	}
});

// Route để xóa general power theo generalPowerCode
router.delete(
	"/:generalPowerCode",
	authenticateCognitoToken,
	async (req, res) => {
		const { generalPowerCode } = req.params;

		if (!generalPowerCode) {
			return res.status(400).json({ error: "General power code is required" });
		}

		try {
			const command = new DeleteItemCommand({
				TableName: GENERAL_POWER_TABLE,
				Key: marshall({ generalPowerCode }),
			});
			await client.send(command);
			res.status(200).json({
				message: `General power with code ${generalPowerCode} deleted successfully`,
			});
		} catch (error) {
			console.error("Error deleting general power:", error);
			res.status(500).json({ error: "Could not delete general power" });
		}
	}
);

export default router;
