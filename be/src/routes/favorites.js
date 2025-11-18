// src/routes/favorites.js

import express from "express";
import {
	UpdateItemCommand,
	GetItemCommand,
	ScanCommand, // ĐÃ THÊM
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import client from "../config/db.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";
import { normalizeBuildFromDynamo } from "../utils/dynamodb.js";
import { invalidatePublicBuildsCache } from "../utils/buildCache.js";

const router = express.Router();
const BUILDS_TABLE = "Builds";

// GET /api/builds/favorites
router.get("/favorites", authenticateCognitoToken, async (req, res) => {
	const userSub = req.user.sub;
	try {
		const command = new ScanCommand({
			TableName: BUILDS_TABLE,
			FilterExpression: "contains(#favorite, :userSub)",
			ExpressionAttributeNames: { "#favorite": "favorite" },
			ExpressionAttributeValues: marshall({ ":userSub": userSub }),
		});
		const { Items } = await client.send(command);
		const items = Items
			? Items.map(item => normalizeBuildFromDynamo(unmarshall(item)))
			: [];
		res.json(items);
	} catch (error) {
		console.error("Error fetching favorite builds:", error);
		res.status(500).json({ error: "Could not fetch favorite builds" });
	}
});

// PATCH /:id/like
router.patch("/:id/like", async (req, res) => {
	const { id } = req.params;
	try {
		const { Attributes } = await client.send(
			new UpdateItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
				UpdateExpression: "SET #like = if_not_exists(#like, :zero) + :inc",
				ExpressionAttributeNames: { "#like": "like" },
				ExpressionAttributeValues: marshall({ ":inc": 1, ":zero": 0 }),
				ReturnValues: "ALL_NEW",
			})
		);

		const updatedBuild = normalizeBuildFromDynamo(unmarshall(Attributes));
		if (updatedBuild.display === true) invalidatePublicBuildsCache();

		res.json(updatedBuild);
	} catch (error) {
		console.error("Error liking build:", error);
		res.status(500).json({ error: "Could not like build" });
	}
});

// PATCH /:id/favorite
router.patch("/:id/favorite", authenticateCognitoToken, async (req, res) => {
	const { id } = req.params;
	const userSub = req.user.sub;
	try {
		const { Item } = await client.send(
			new GetItemCommand({ TableName: BUILDS_TABLE, Key: marshall({ id }) })
		);
		if (!Item) return res.status(404).json({ error: "Build not found" });

		const build = unmarshall(Item);
		let favorites = build.favorite || [];
		const index = favorites.indexOf(userSub);
		if (index > -1) favorites.splice(index, 1);
		else favorites.push(userSub);

		const { Attributes } = await client.send(
			new UpdateItemCommand({
				TableName: BUILDS_TABLE,
				Key: marshall({ id }),
				UpdateExpression: "SET #fav = :list",
				ExpressionAttributeNames: { "#fav": "favorite" },
				ExpressionAttributeValues: marshall({ ":list": favorites }),
				ReturnValues: "ALL_NEW",
			})
		);

		const updatedBuild = normalizeBuildFromDynamo(unmarshall(Attributes));
		if (updatedBuild.display === true) invalidatePublicBuildsCache();

		res.json(updatedBuild);
	} catch (error) {
		console.error("Error toggling favorite:", error);
		res.status(500).json({ error: "Could not toggle favorite" });
	}
});

export default router;
