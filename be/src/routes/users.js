// src/routes/users.js
import express from "express";
import {
	AdminGetUserCommand,
	AdminUpdateUserAttributesCommand,
	ChangePasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient } from "../config/cognito.js";
import { authenticateCognitoToken } from "../middleware/authenticate.js";

const router = express.Router();
const COGNITO_USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

// GET /api/user/me - Lấy thông tin người dùng hiện tại
router.get("/user/me", authenticateCognitoToken, async (req, res) => {
	try {
		const command = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: req.user["cognito:username"],
		});
		const { UserAttributes } = await cognitoClient.send(command);
		const userProfile = UserAttributes.reduce((acc, { Name, Value }) => {
			acc[Name] = Value;
			return acc;
		}, {});
		res.json(userProfile);
	} catch (error) {
		console.error("Error fetching user profile:", error);
		res.status(500).json({ error: "Could not fetch user profile" });
	}
});

// GET /api/users/:username - Lấy thông tin công khai của một người dùng
router.get("/users/:username", async (req, res) => {
	const { username } = req.params;
	try {
		const command = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});
		const { UserAttributes } = await cognitoClient.send(command);
		const nameAttribute = UserAttributes.find(attr => attr.Name === "name");
		const publicProfile = {
			username: username,
			name: nameAttribute ? nameAttribute.Value : username,
		};
		res.json(publicProfile);
	} catch (error) {
		if (error.name === "UserNotFoundException") {
			return res.status(404).json({ error: "User not found" });
		}
		console.error("Error fetching public user info:", error);
		res.status(500).json({ error: "Could not fetch user info" });
	}
});

// POST /api/user/change-password - Đổi mật khẩu
router.post(
	"/user/change-password",
	authenticateCognitoToken,
	async (req, res) => {
		const { previousPassword, proposedPassword } = req.body;
		const accessToken = req.headers.authorization.split(" ")[1];

		if (!previousPassword || !proposedPassword) {
			return res
				.status(400)
				.json({ error: "Both previous and new passwords are required" });
		}

		try {
			const command = new ChangePasswordCommand({
				PreviousPassword: previousPassword,
				ProposedPassword: proposedPassword,
				AccessToken: accessToken,
			});
			await cognitoClient.send(command);
			res.json({ message: "Password changed successfully" });
		} catch (error) {
			console.error("Change password error:", error);
			res
				.status(400)
				.json({ error: error.message || "Could not change password" });
		}
	}
);
// PUT /api/user/change-name
router.put("/user/change-name", authenticateCognitoToken, async (req, res) => {
	const { name } = req.body;
	const username = req.user["cognito:username"];

	if (!name || name.trim().length < 3) {
		return res.status(400).json({ error: "Tên phải có ít nhất 3 ký tự" });
	}

	try {
		const command = new AdminUpdateUserAttributesCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
			UserAttributes: [{ Name: "name", Value: name.trim() }],
		});
		await cognitoClient.send(command);
		res.json({ message: "Cập nhật tên thành công" });
	} catch (error) {
		console.error("Change name error:", error);
		res.status(500).json({ error: "Không thể cập nhật tên" });
	}
});

// GET /api/user/info/:sub → Lấy tên theo sub (cần mapping nếu sub ≠ username)
router.get("/user/info/:sub", async (req, res) => {
	const { sub } = req.params;
	try {
		const command = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: sub, // Nếu sub = username → hoạt động
		});
		const { UserAttributes } = await cognitoClient.send(command);
		const name =
			UserAttributes.find(a => a.Name === "name")?.Value || "Người chơi";
		res.json({ name });
	} catch (error) {
		if (error.name === "UserNotFoundException") {
			return res.status(404).json({ error: "User not found" });
		}
		console.error("Get user info error:", error);
		res.status(500).json({ error: "Lỗi server" });
	}
});

export default router;
