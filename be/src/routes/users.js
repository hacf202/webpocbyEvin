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

// ==========================================
// HỆ THỐNG IN-MEMORY CACHE ĐƠN GIẢN
// ==========================================
const userCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 Phút
const MAX_CACHE_SIZE = 1000; // Giới hạn lưu 1000 users để bảo vệ RAM

const getFromCache = key => {
	const cached = userCache.get(key);
	if (!cached) return null;

	// Kiểm tra xem cache còn hạn không
	if (Date.now() - cached.timestamp > CACHE_TTL) {
		userCache.delete(key); // Hết hạn thì xóa
		return null;
	}
	return cached.data;
};

const setToCache = (key, data) => {
	// Cơ chế dọn dẹp đơn giản: Nếu đầy thì xóa phần tử cũ nhất (FIFO)
	if (userCache.size >= MAX_CACHE_SIZE) {
		const firstKey = userCache.keys().next().value;
		userCache.delete(firstKey);
	}
	userCache.set(key, { data, timestamp: Date.now() });
};

const invalidateCache = key => {
	if (userCache.has(key)) {
		userCache.delete(key);
	}
};
// ==========================================

// 1. GET /api/user/me - Lấy thông tin bản thân (Không cache để đảm bảo realtime)
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

// 2. GET /api/users/:username - Lấy thông tin công khai (CÓ CACHE)
router.get("/users/:username", async (req, res) => {
	const { username } = req.params;

	// [CACHE] Bước 1: Kiểm tra cache
	const cachedData = getFromCache(username);
	if (cachedData) {
		// Trả về dữ liệu từ RAM ngay lập tức
		return res.json(cachedData);
	}

	try {
		const command = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: username,
		});
		const { UserAttributes } = await cognitoClient.send(command);
		const nameAttribute = UserAttributes.find(attr => attr.Name === "name");

		const publicProfile = {
			username,
			name: nameAttribute ? nameAttribute.Value : username,
		};

		// [CACHE] Bước 2: Lưu vào cache
		setToCache(username, publicProfile);

		res.json(publicProfile);
	} catch (error) {
		if (error.name === "UserNotFoundException") {
			return res.status(404).json({ error: "User not found" });
		}
		console.error("Error fetching public user info:", error);
		res.status(500).json({ error: "Could not fetch user info" });
	}
});

// 3. POST /api/user/change-password
router.post(
	"/user/change-password",
	authenticateCognitoToken,
	async (req, res) => {
		const { previousPassword, proposedPassword, accessToken } = req.body;

		if (!previousPassword || !proposedPassword || !accessToken) {
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

// 4. PUT /api/user/change-name - Đổi tên hiển thị (XÓA CACHE)
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

		// [CACHE] Bước 3: Quan trọng - Xóa cache cũ để hiển thị tên mới ngay
		invalidateCache(username);

		res.json({ message: "Cập nhật tên thành công" });
	} catch (error) {
		console.error("Change name error:", error);
		res.status(500).json({ error: "Không thể cập nhật tên" });
	}
});

// 5. GET /api/user/info/:sub - Lấy info bằng sub (CÓ CACHE)
// Route này thường được dùng khi hiển thị avatar/tên trong list builds
router.get("/user/info/:sub", async (req, res) => {
	const { sub } = req.params;

	// [CACHE] Kiểm tra cache theo sub (ở đây giả định sub đóng vai trò như username trong hệ thống cũ)
	// Nếu sub khác username, bạn cần lưu cache theo key riêng, ví dụ: `sub:${sub}`
	const cachedData = getFromCache(sub);
	if (cachedData) {
		return res.json(cachedData);
	}

	try {
		const command = new AdminGetUserCommand({
			UserPoolId: COGNITO_USER_POOL_ID,
			Username: sub,
		});
		const { UserAttributes } = await cognitoClient.send(command);
		const name =
			UserAttributes.find(a => a.Name === "name")?.Value || "Người chơi";

		const result = { name };

		// [CACHE] Lưu cache
		setToCache(sub, result);

		res.json(result);
	} catch (error) {
		if (error.name === "UserNotFoundException") {
			return res.status(404).json({ error: "User not found" });
		}
		console.error("Get user info error:", error);
		res.status(500).json({ error: "Lỗi server" });
	}
});

// 6. POST /api/users/batch - Lấy thông tin nhiều user cùng lúc (Tối ưu cho List)
router.post("/users/batch", async (req, res) => {
	const { userIds } = req.body; // Mảng các sub hoặc username: ["sub1", "sub2", "sub1"]

	if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
		return res.json({});
	}

	// Loại bỏ trùng lặp để tiết kiệm request
	const uniqueIds = [...new Set(userIds)];
	const result = {};
	const idsToFetch = [];

	// 1. Kiểm tra Cache trước
	uniqueIds.forEach(id => {
		const cached = getFromCache(id);
		if (cached) {
			result[id] = cached.name;
		} else {
			idsToFetch.push(id);
		}
	});

	// 2. Nếu cache chưa có đủ, fetch từ Cognito song song
	if (idsToFetch.length > 0) {
		try {
			const fetchPromises = idsToFetch.map(async id => {
				try {
					const command = new AdminGetUserCommand({
						UserPoolId: COGNITO_USER_POOL_ID,
						Username: id,
					});
					const { UserAttributes } = await cognitoClient.send(command);
					const name =
						UserAttributes.find(a => a.Name === "name")?.Value || "Người chơi";

					// Lưu vào cache
					setToCache(id, { name });
					return { id, name };
				} catch (err) {
					console.warn(`Failed to fetch user ${id}:`, err.message);
					return { id, name: "Vô danh" }; // Fallback nếu lỗi
				}
			});

			const fetchedUsers = await Promise.all(fetchPromises);
			fetchedUsers.forEach(u => {
				result[u.id] = u.name;
			});
		} catch (error) {
			console.error("Batch fetch error:", error);
		}
	}

	// Trả về map: { "sub1": "Tên A", "sub2": "Tên B" }
	res.json(result);
});

export default router;
