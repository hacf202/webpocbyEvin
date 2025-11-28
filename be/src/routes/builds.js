// src/routes/builds.js

import express from "express";
import {
	PutItemCommand,
	UpdateItemCommand,
	DeleteItemCommand,
	GetItemCommand,
	QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";

import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import {
	boolToString,
	prepareBuildForDynamo,
	normalizeBuildFromDynamo,
} from "../utils/dynamodb.js";
import {
	getPublicBuilds,
	invalidatePublicBuildsCache,
} from "../utils/buildCache.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";

// GET /api/builds
router.get("/", async (req, res) => {
	try {
		const { items } = await getPublicBuilds();
		res.json({ items });
	} catch (error) {
		console.error("Error getting public builds:", error);
		res.status(500).json({ error: "Could not retrieve builds" });
	}
});

// GET /api/builds/my-builds
router.get("/my-builds", authenticateCognitoToken, async (req, res) => {
	const creator = req.user["cognito:username"];
	try {
		const command = new QueryCommand({
			TableName: BUILDS_TABLE,
			IndexName: "creator-index",
			KeyConditionExpression: "creator = :creator",
			ExpressionAttributeValues: marshall({ ":creator": creator }),
		});
		const { Items } = await client.send(command);
		const items = Items
			? Items.map(item => normalizeBuildFromDynamo(unmarshall(item)))
			: [];
		res.json({ items });
	} catch (error) {
		console.error("Error getting user's builds:", error);
		res.status(500).json({ error: "Could not retrieve your builds" });
	}
});

// GET /api/builds/:id
router.get("/:id", async (req, res) => {
	const { id } = req.params;
	let userSub = null;

	const authHeader = req.headers.authorization;
	if (authHeader && authHeader.startsWith("Bearer ")) {
		const token = authHeader.split(" ")[1];
		try {
			const payload = JSON.parse(atob(token.split(".")[1]));
			userSub = payload.sub;
		} catch (err) {
			console.warn("Invalid token format");
		}
	}

	try {
		const { Item } = await client.send(
			new GetItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
			})
		);

		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = normalizeBuildFromDynamo(unmarshall(Item));

		if (build.display === true) {
			await client.send(
				new UpdateItemCommand({
					TableName: BUILDS_TABLE,
					Key: marshall({ id }),
					UpdateExpression: "SET #views = if_not_exists(#views, :zero) + :inc",
					ExpressionAttributeNames: { "#views": "views" },
					ExpressionAttributeValues: marshall({ ":inc": 1, ":zero": 0 }),
				})
			);
			return res.json(build);
		}

		if (!userSub || build.sub !== userSub) {
			return res.status(404).json({ error: "Build not found or not public" });
		}

		res.json(build);
	} catch (error) {
		console.error("Error getting build:", error);
		res.status(500).json({ error: "Could not retrieve build" });
	}
});

// POST /api/builds
router.post("/", authenticateCognitoToken, async (req, res) => {
	const {
		championName,
		description = "",
		relicSet = [],
		powers = [],
		rune = [],
		star = 0,
		display = false,
		regions = [], // [ADD] Nhận regions từ request
	} = req.body;

	if (!championName || !Array.isArray(relicSet) || relicSet.length === 0) {
		return res
			.status(400)
			.json({ error: "Champion name and relicSet are required." });
	}

	const build = prepareBuildForDynamo({
		id: uuidv4(),
		sub: req.user.sub,
		creator: req.user["cognito:username"],
		description,
		championName,
		relicSet,
		powers,
		rune,
		like: 0,
		star,
		display,
		views: 0,
		regions, // [ADD] Thêm vào object để lưu
		createdAt: new Date().toISOString(),
	});

	try {
		await client.send(
			new PutItemCommand({
				TableName: BUILDS_TABLE,
				Item: marshall(build),
			})
		);

		if (display === true) invalidatePublicBuildsCache();

		res.status(201).json({
			message: "Build created successfully",
			build: normalizeBuildFromDynamo(build),
		});
	} catch (error) {
		console.error("Error creating build:", error);
		res.status(500).json({ error: "Could not create build" });
	}
});

// PUT /api/builds/:id
router.put("/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const {
		description,
		relicSet,
		powers,
		rune,
		star,
		display,
		regions, // [ADD] Nhận regions khi update
	} = req.body;
	const userSub = req.user.sub;

	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const oldBuild = unmarshall(Item);
		if (oldBuild.sub !== userSub) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		let updateExpression = "SET";
		const expressionAttributeNames = {};
		const expressionAttributeValues = {};
		let hasUpdates = false;

		const fields = {
			description,
			relicSet,
			powers,
			rune,
			star,
			display,
			regions, // [ADD] Thêm regions vào fields cần update
		};
		Object.entries(fields).forEach(([key, value]) => {
			if (value !== undefined) {
				hasUpdates = true;
				const attrKey = `#${key}`;
				const valKey = `:${key}`;
				updateExpression += ` ${attrKey} = ${valKey},`;
				expressionAttributeNames[attrKey] = key;
				expressionAttributeValues[valKey] =
					key === "display" ? boolToString(value) : value;
			}
		});

		if (!hasUpdates)
			return res.status(400).json({ error: "No fields to update" });

		updateExpression = updateExpression.slice(0, -1);

		const command = new UpdateItemCommand({
			TableName: BUILDS_TABLE,
			Key: marshall({ id }),
			UpdateExpression: updateExpression,
			ExpressionAttributeNames: expressionAttributeNames,
			ExpressionAttributeValues: marshall(expressionAttributeValues),
			ReturnValues: "ALL_NEW",
		});

		const { Attributes } = await client.send(command);
		const updatedBuild = normalizeBuildFromDynamo(unmarshall(Attributes));

		if (oldBuild.display || updatedBuild.display) {
			invalidatePublicBuildsCache();
		}

		res.json({ message: "Build updated successfully", build: updatedBuild });
	} catch (error) {
		console.error("Error updating build:", error);
		res.status(500).json({ error: "Could not update build" });
	}
});

// DELETE /api/builds/:id
router.delete("/:id", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const userSub = req.user.sub;

	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = unmarshall(Item);
		if (build.sub !== userSub) {
			return res.status(403).json({ error: "Unauthorized" });
		}

		if (build.display === true) invalidatePublicBuildsCache();

		await client.send(
			new DeleteItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		res.json({ message: "Build deleted successfully" });
	} catch (error) {
		console.error("Error deleting build:", error);
		res.status(500).json({ error: "Could not delete build" });
	}
});

router.patch("/:id/like", async (req, res) => {
	const { id } = req.params;

	try {
		const { Item } = await client.send(
			new GetItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
			})
		);

		if (!Item) {
			return res.status(404).json({ error: "Build not found" });
		}

		const build = unmarshall(Item);

		const result = await client.send(
			new UpdateItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
				UpdateExpression: "SET #like = if_not_exists(#like, :zero) + :inc",
				ExpressionAttributeNames: { "#like": "like" },
				ExpressionAttributeValues: marshall({
					":inc": 1,
					":zero": 0,
				}),
				ReturnValues: "UPDATED_NEW",
			})
		);

		const newLikeCount = result.Attributes
			? unmarshall(result.Attributes).like
			: (build.like || 0) + 1;

		if (build.display === true) {
			invalidatePublicBuildsCache();
		}

		res.json({ like: newLikeCount });
	} catch (error) {
		console.error("Like error:", error);
		res.status(500).json({ error: "Could not like build" });
	}
});

export default router;
