// be/src/routes/items.js

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
const ITEMS_TABLE = "guidePocItems";

// GET /api/items - Lấy danh sách tất cả các items
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: ITEMS_TABLE });
		const { Items } = await client.send(command);
		const items = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(items);
	} catch (error) {
		console.error("Error getting items:", error);
		res.status(500).json({ error: "Could not retrieve items" });
	}
});

// PUT /api/items - Cập nhật hoặc thêm mới (Upsert)
router.put("/", authenticateCognitoToken, async (req, res) => {
	const itemData = req.body;
	if (!itemData.itemCode) {
		return res.status(400).json({ error: "Item code is required" });
	}
	try {
		const command = new PutItemCommand({
			TableName: ITEMS_TABLE,
			Item: marshall(itemData),
		});
		await client.send(command);
		res.status(200).json({
			message: "Item data updated successfully",
			item: itemData,
		});
	} catch (error) {
		console.error("Error updating item data:", error);
		res.status(500).json({ error: "Could not update item data" });
	}
});

// Route để xóa item theo itemCode
router.delete("/:itemCode", authenticateCognitoToken, async (req, res) => {
	const { itemCode } = req.params;

	if (!itemCode) {
		return res.status(400).json({ error: "Item code is required" });
	}

	try {
		const command = new DeleteItemCommand({
			TableName: ITEMS_TABLE,
			Key: marshall({ itemCode }),
		});
		await client.send(command);
		res
			.status(200)
			.json({ message: `Item with code ${itemCode} deleted successfully` });
	} catch (error) {
		console.error("Error deleting item:", error);
		res.status(500).json({ error: "Could not delete item" });
	}
});

export default router;
