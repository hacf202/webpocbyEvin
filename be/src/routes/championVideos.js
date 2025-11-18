// be/src/routes/championVideos.js

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
const VIDEOS_TABLE = "guidePocVideoAndMusic"; // <-- Tên bảng DynamoDB

/**
 * GET /api/champion-videos
 * Lấy toàn bộ link video của các tướng
 */
router.get("/", async (req, res) => {
	try {
		const command = new ScanCommand({ TableName: VIDEOS_TABLE });
		const { Items } = await client.send(command);
		const videos = Items ? Items.map(item => unmarshall(item)) : [];
		res.json(videos);
	} catch (error) {
		console.error("Error getting champion videos:", error);
		res.status(500).json({ error: "Could not retrieve champion videos" });
	}
});

/**
 * PUT /api/champion-videos
 * Upsert (thêm mới hoặc ghi đè) một bản ghi video
 * Body: { name: "Swain", link: "https://...", MusicVideo: "https://..." }
 */
router.put("/", authenticateCognitoToken, async (req, res) => {
	const videoData = req.body;

	// name là khóa chính → bắt buộc
	if (!videoData.name) {
		return res.status(400).json({ error: "Champion name is required" });
	}

	try {
		const command = new PutItemCommand({
			TableName: VIDEOS_TABLE,
			Item: marshall(videoData),
		});
		await client.send(command);

		res.status(200).json({
			message: "Champion video data saved successfully",
			video: videoData,
		});
	} catch (error) {
		console.error("Error saving champion video:", error);
		res.status(500).json({ error: "Could not save champion video" });
	}
});

/**
 * DELETE /api/champion-videos/:championName
 * Xóa video của tướng theo tên
 */
router.delete("/:championName", authenticateCognitoToken, async (req, res) => {
	const { championName } = req.params;

	if (!championName) {
		return res.status(400).json({ error: "Champion name is required" });
	}

	try {
		const command = new DeleteItemCommand({
			TableName: VIDEOS_TABLE,
			Key: marshall({ name: championName }), // name là PK
		});
		await client.send(command);

		res.status(200).json({
			message: `Video for champion ${championName} deleted successfully`,
		});
	} catch (error) {
		console.error("Error deleting champion video:", error);
		res.status(500).json({ error: "Could not delete champion video" });
	}
});

export default router;
