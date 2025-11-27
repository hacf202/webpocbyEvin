// src/routes/favorites.js
import express from "express";
import {
	PutItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { normalizeBuildFromDynamo } from "../utils/dynamodb.js";
import { invalidatePublicBuildsCache } from "../utils/buildCache.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";
const FAVORITES_TABLE = "guidePocFavoriteBuilds";

// 1. LẤY DANH SÁCH FAVORITE CỦA USER
router.get("/favorites", authenticateCognitoToken, async (req, res) => {
	const userSub = req.user.sub;
	try {
		const { Items: favItems } = await client.send(
			new QueryCommand({
				TableName: FAVORITES_TABLE,
				IndexName: "user_sub-index",
				KeyConditionExpression: "user_sub = :userSub",
				ExpressionAttributeValues: marshall({ ":userSub": userSub }),
				ScanIndexForward: false,
			})
		);

		if (!favItems || favItems.length === 0) return res.json([]);

		const builds = await Promise.all(
			favItems.map(async item => {
				const { id } = unmarshall(item);
				const { Item } = await client.send(
					new GetItemCommand({
						TableName: BUILDS_TABLE,
						Key: marshall({ id }),
					})
				);
				return Item ? normalizeBuildFromDynamo(unmarshall(Item)) : null;
			})
		);

		res.json(builds.filter(Boolean));
	} catch (error) {
		console.error("Error fetching favorites:", error);
		res.status(500).json({ error: "Could not fetch favorites" });
	}
});

// 2. TOGGLE FAVORITE
router.patch("/:id/favorite", authenticateCognitoToken, async (req, res) => {
	const { id: buildId } = req.params;
	const userSub = req.user.sub;
	const username = req.user["cognito:username"] || "Anonymous";

	try {
		const { Item: buildItem } = await client.send(
			new GetItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id: buildId }),
			})
		);
		if (!buildItem) return res.status(404).json({ error: "Build not found" });

		const build = normalizeBuildFromDynamo(unmarshall(buildItem));

		const { Items } = await client.send(
			new QueryCommand({
				TableName: FAVORITES_TABLE,
				KeyConditionExpression: "id = :buildId AND user_sub = :userSub",
				ExpressionAttributeValues: marshall({
					":buildId": buildId,
					":userSub": userSub,
				}),
			})
		);

		let isFavorited = false;
		if (Items?.length > 0) {
			await client.send(
				new DeleteItemCommand({
					TableName: FAVORITES_TABLE,
					Key: marshall({ id: buildId, user_sub: userSub }),
				})
			);
		} else {
			isFavorited = true;
			await client.send(
				new PutItemCommand({
					TableName: FAVORITES_TABLE,
					Item: marshall({
						id: buildId,
						user_sub: userSub,
						username,
						championName: build.championName,
						creatorName: build.creatorName || "Vô Danh",
						createdAt: new Date().toISOString(),
					}),
				})
			);
		}

		if (build.display === true) invalidatePublicBuildsCache();

		res.json({
			...build,
			isFavorited,
			message: isFavorited ? "Favorited" : "Unfavorited",
		});
	} catch (error) {
		console.error("Toggle favorite error:", error);
		res.status(500).json({ error: "Could not toggle favorite" });
	}
});

// 3. CHECK STATUS (Single)
router.get(
	"/:id/favorite/status",
	authenticateCognitoToken,
	async (req, res) => {
		const { id: buildId } = req.params;
		const userSub = req.user.sub;
		try {
			const { Count } = await client.send(
				new QueryCommand({
					TableName: FAVORITES_TABLE,
					KeyConditionExpression: "id = :buildId AND user_sub = :userSub",
					ExpressionAttributeValues: marshall({
						":buildId": buildId,
						":userSub": userSub,
					}),
					Select: "COUNT",
				})
			);
			res.json({ isFavorited: Count > 0 });
		} catch (error) {
			res.status(500).json({ error: "Error checking status" });
		}
	}
);

// 4. COUNT (Single)
router.get("/:id/favorite/count", async (req, res) => {
	const { id: buildId } = req.params;
	try {
		const { Count } = await client.send(
			new QueryCommand({
				TableName: FAVORITES_TABLE,
				IndexName: "id-index",
				KeyConditionExpression: "id = :buildId",
				ExpressionAttributeValues: marshall({ ":buildId": buildId }),
				Select: "COUNT",
			})
		);
		res.json({ count: Count || 0 });
	} catch (error) {
		res.json({ count: 0 });
	}
});

// 5. BATCH STATUS (Đã có, giữ nguyên)
router.get("/favorites/batch", authenticateCognitoToken, async (req, res) => {
	const { ids } = req.query;
	const userSub = req.user.sub;

	if (!ids || !userSub) return res.json({});
	const buildIds = ids.split(",").filter(Boolean);
	if (buildIds.length === 0) return res.json({});

	try {
		const results = await Promise.all(
			buildIds.map(async buildId => {
				try {
					const { Count } = await client.send(
						new QueryCommand({
							TableName: FAVORITES_TABLE,
							KeyConditionExpression: "id = :buildId AND user_sub = :userSub",
							ExpressionAttributeValues: marshall({
								":buildId": buildId,
								":userSub": userSub,
							}),
							Select: "COUNT",
						})
					);
					return { id: buildId, isFavorited: Count > 0 };
				} catch {
					return { id: buildId, isFavorited: false };
				}
			})
		);

		const statusMap = Object.fromEntries(
			results.map(r => [r.id, r.isFavorited])
		);
		res.setHeader("Cache-Control", "no-store");
		res.json(statusMap);
	} catch (error) {
		console.error("Batch error:", error);
		res.status(500).json({ error: "Batch failed" });
	}
});

// [MỚI] 6. BATCH COUNT (Thêm vào để giảm log spam)
router.get("/favorites/count/batch", async (req, res) => {
	const { ids } = req.query;
	if (!ids) return res.json({});

	const buildIds = ids.split(",").filter(Boolean);
	if (buildIds.length === 0) return res.json({});

	try {
		const results = await Promise.all(
			buildIds.map(async buildId => {
				try {
					const { Count } = await client.send(
						new QueryCommand({
							TableName: FAVORITES_TABLE,
							IndexName: "id-index", // Index dùng cho đếm tổng
							KeyConditionExpression: "id = :buildId",
							ExpressionAttributeValues: marshall({ ":buildId": buildId }),
							Select: "COUNT",
						})
					);
					return { id: buildId, count: Count || 0 };
				} catch {
					return { id: buildId, count: 0 };
				}
			})
		);

		const countMap = Object.fromEntries(results.map(r => [r.id, r.count]));
		res.json(countMap);
	} catch (error) {
		console.error("Batch count error:", error);
		res.status(500).json({ error: "Batch count failed" });
	}
});

export default router;
