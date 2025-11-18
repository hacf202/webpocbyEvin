// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import * as authService from "./services/authService";

export const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Giải mã JWT payload (hỗ trợ tiếng Việt đầy đủ)
const decodeJwtPayload = token => {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
				.join("")
		);
		return JSON.parse(jsonPayload);
	} catch (e) {
		console.error("Failed to decode JWT payload:", e);
		return null;
	}
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null); // ID Token
	const [accessToken, setAccessToken] = useState(null); // Access Token
	const [refreshToken, setRefreshToken] = useState(null); // Refresh Token
	const [isAdmin, setIsAdmin] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [tempPassword, setTempPassword] = useState(null); // Dùng khi confirm signup

	// Hàm refresh token im lặng (dùng chung)
	const silentRefresh = async currentRefreshToken => {
		try {
			const data = await authService.refreshToken(currentRefreshToken);
			const { IdToken, AccessToken } = data.AuthenticationResult;
			handleLogin(IdToken, AccessToken, currentRefreshToken);
			console.log("Token refreshed successfully");
			return true;
		} catch (error) {
			console.error("Silent refresh failed:", error);
			logout();
			return false;
		}
	};

	// Khôi phục session khi load trang
	useEffect(() => {
		const initAuth = async () => {
			const storedIdToken = localStorage.getItem("token");
			const storedAccessToken = localStorage.getItem("access_token");
			const storedRefreshToken = localStorage.getItem("refresh_token");

			if (storedIdToken && storedAccessToken && storedRefreshToken) {
				const payload = decodeJwtPayload(storedIdToken);

				if (payload && payload.exp * 1000 > Date.now()) {
					// Token còn hạn → khôi phục ngay
					handleLogin(storedIdToken, storedAccessToken, storedRefreshToken);
				} else {
					// Token hết hạn → thử refresh ngay lập tức
					await silentRefresh(storedRefreshToken);
				}
			}
			setIsLoading(false);
		};

		initAuth();
	}, []);

	// Auto refresh thông minh: chạy định kỳ + khi quay lại tab
	useEffect(() => {
		if (!token || !refreshToken) return;

		const checkAndRefresh = async () => {
			const payload = decodeJwtPayload(token);
			if (!payload) {
				logout();
				return;
			}

			const expiresInMs = payload.exp * 1000 - Date.now();
			if (expiresInMs < 10 * 60 * 1000) {
				// dưới 10 phút
				await silentRefresh(refreshToken);
			}
		};

		// Kiểm tra mỗi 5 phút
		const interval = setInterval(checkAndRefresh, 5 * 60 * 1000);

		// Khi người dùng quay lại tab hoặc ứng dụng
		const handleVisibilityChange = () => {
			if (!document.hidden) checkAndRefresh();
		};
		const handleFocus = () => checkAndRefresh();

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleFocus);

		// Cleanup
		return () => {
			clearInterval(interval);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleFocus);
		};
	}, [token, refreshToken]);

	// Xử lý login (đăng nhập thủ công, refresh, confirm signup...)
	const handleLogin = (idToken, accessToken, newRefreshToken = null) => {
		localStorage.setItem("token", idToken);
		localStorage.setItem("access_token", accessToken);

		if (newRefreshToken) {
			localStorage.setItem("refresh_token", newRefreshToken);
			setRefreshToken(newRefreshToken);
		}

		setToken(idToken);
		setAccessToken(accessToken);

		const payload = decodeJwtPayload(idToken);
		if (payload) {
			setUser({
				sub: payload.sub,
				username: payload["cognito:username"],
				name: payload.name || payload["cognito:username"],
				email: payload.email,
			});
			setIsAdmin((payload["cognito:groups"] || []).includes("admin"));
		}
	};

	const login = async (username, password, onSuccess, onError) => {
		try {
			const data = await authService.initiateAuth(username, password);
			const { IdToken, AccessToken, RefreshToken } = data.AuthenticationResult;
			handleLogin(IdToken, AccessToken, RefreshToken);
			onSuccess?.("Đăng nhập thành công!");
		} catch (error) {
			onError?.(error.message || "Đăng nhập thất bại");
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setAccessToken(null);
		setRefreshToken(null);
		setIsAdmin(false);
		localStorage.removeItem("token");
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
	};

	const signUp = async (username, email, password, onSuccess, onError) => {
		try {
			setTempPassword(password);
			await authService.signUp(username, email, password);
			onSuccess?.("Mã OTP đã được gửi đến email của bạn.");
		} catch (error) {
			onError?.(error.message);
		}
	};

	const confirmSignUp = async (username, code, onSuccess, onError) => {
		try {
			await authService.confirmSignUp(username, code);
			const data = await authService.initiateAuth(username, tempPassword);
			const { IdToken, AccessToken, RefreshToken } = data.AuthenticationResult;
			handleLogin(IdToken, AccessToken, RefreshToken);
			onSuccess?.("Tài khoản đã được xác minh và đăng nhập thành công!");
		} catch (error) {
			if (error.message.includes("Incorrect username or password")) {
				onSuccess?.("Xác minh thành công! Vui lòng đăng nhập.");
			} else {
				onError?.(error.message);
			}
		} finally {
			setTempPassword(null);
		}
	};

	const resendConfirmationCode = async (username, onSuccess, onError) => {
		try {
			await authService.resendConfirmationCode(username);
			onSuccess?.("Mã OTP mới đã được gửi!");
		} catch (error) {
			onError?.(error.message);
		}
	};

	const forgotPassword = async (username, email, onSuccess, onError) => {
		try {
			const data = await authService.forgotPassword(username, email);
			onSuccess?.(data.message);
		} catch (error) {
			onError?.(error.message);
		}
	};

	const confirmPasswordReset = async (
		username,
		code,
		newPassword,
		onSuccess,
		onError
	) => {
		try {
			await authService.confirmPasswordReset(username, code, newPassword);
			onSuccess?.("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
		} catch (error) {
			onError?.(error.message);
		}
	};

	const changeName = async (newName, onSuccess, onError) => {
		try {
			const data = await authService.changeName(newName, token);
			setUser(prev => (prev ? { ...prev, name: newName } : null));
			onSuccess?.(data.message);
		} catch (err) {
			onError?.(err.message || "Không thể đổi tên");
		}
	};

	const changePassword = async (
		oldPassword,
		newPassword,
		onSuccess,
		onError
	) => {
		if (!accessToken) return onError?.("Không tìm thấy access token");

		try {
			const data = await authService.changePassword(
				oldPassword,
				newPassword,
				accessToken,
				token
			);
			onSuccess?.(data.message || "Đổi mật khẩu thành công!");
		} catch (err) {
			onError?.(err.message || "Đổi mật khẩu thất bại");
		}
	};

	const getUserNameBySub = async sub => {
		try {
			const data = await authService.getUserNameBySub(sub);
			return data.name;
		} catch (error) {
			console.error("Error fetching user name:", error);
			return null;
		}
	};

	const value = {
		user,
		token,
		accessToken,
		refreshToken,
		isAdmin,
		isLoading,
		login,
		logout,
		signUp,
		confirmSignUp,
		resendConfirmationCode,
		forgotPassword,
		confirmPasswordReset,
		changeName,
		changePassword,
		getUserNameBySub,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
