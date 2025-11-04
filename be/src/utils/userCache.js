// src/utils/userCache.js

import { cognitoClient } from "../config/cognito.js";
import { ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";

const userCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

export const getUserNames = async usernames => {
	if (!usernames || usernames.length === 0) return {};

	const result = {};
	const toFetch = [];

	// Kiểm tra cache
	usernames.forEach(username => {
		const cached = userCache.get(username);
		if (cached && Date.now() < cached.expiry) {
			result[username] = cached.name;
		} else {
			toFetch.push(username);
		}
	});

	if (toFetch.length === 0) return result;

	// Batch Cognito (60 users/lần)
	try {
		const batches = [];
		for (let i = 0; i < toFetch.length; i += 60) {
			batches.push(toFetch.slice(i, i + 60));
		}

		for (const batch of batches) {
			const filter = batch.map(u => `username = "${u}"`).join(" OR ");
			const command = new ListUsersCommand({
				UserPoolId: process.env.COGNITO_USER_POOL_ID,
				Filter: filter,
				Limit: 60,
			});
			const { Users } = await cognitoClient.send(command);
			Users.forEach(user => {
				const name =
					user.Attributes.find(a => a.Name === "name")?.Value || user.Username;
				result[user.Username] = name;
				userCache.set(user.Username, { name, expiry: Date.now() + CACHE_TTL });
			});
		}

		// Fallback
		toFetch.forEach(username => {
			if (!result[username]) {
				result[username] = username;
				userCache.set(username, {
					name: username,
					expiry: Date.now() + CACHE_TTL,
				});
			}
		});
	} catch (error) {
		console.error("Batch Cognito error:", error);
		toFetch.forEach(username => {
			result[username] = username;
		});
	}

	return result;
};
