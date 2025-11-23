<<<<<<< HEAD
import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
} from "react";
// AuthContext.jsx
=======
// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
import * as authService from "./services/authService";

export const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

<<<<<<< HEAD
// Hàm giải mã JWT payload có hỗ trợ ký tự UTF-8 (tiếng Việt)
=======
// Giải mã JWT payload (hỗ trợ tiếng Việt đầy đủ)
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
const decodeJwtPayload = token => {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
<<<<<<< HEAD
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
=======
				.map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
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
<<<<<<< HEAD
	const [token, setToken] = useState(null);
	const [accessToken, setAccessToken] = useState(null);
	const [tempPassword, setTempPassword] = useState(null); // Dùng để tự động đăng nhập sau khi xác nhận tài khoản
	const [isAdmin, setIsAdmin] = useState(false); // Thêm state mới
	const [isLoading, setIsLoading] = useState(true);
	// Thêm state
	const [refreshToken, setRefreshToken] = useState(null);

	// Tự động làm mới token khi gần hết hạn
	useEffect(() => {
		if (!token || !refreshToken) return;

		const payload = decodeJwtPayload(token);
		const expiresIn = payload.exp * 1000 - Date.now() - 5 * 60 * 1000; // 5 phút trước khi hết hạn

		const timeout = setTimeout(async () => {
			try {
				const data = await authService.refreshToken(refreshToken);
				const { IdToken, AccessToken } = data.AuthenticationResult;
				handleLogin(IdToken, AccessToken, refreshToken);
			} catch (error) {
				console.error("Refresh token failed:", error);
				logout();
			}
		}, expiresIn);

		return () => clearTimeout(timeout);
	}, [token, refreshToken]);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedAccessToken = localStorage.getItem("access_token");
		const storedRefreshToken = localStorage.getItem("refresh_token");
		if (storedToken && storedAccessToken && storedRefreshToken) {
			const payload = decodeJwtPayload(storedToken);
			if (payload && payload.exp * 1000 > Date.now()) {
				handleLogin(storedToken, storedAccessToken, storedRefreshToken);
			} else {
				logout();
			}
		}
		setIsLoading(false);
	}, []);

	// Trong handleLogin
	const handleLogin = (idToken, accessToken, refreshToken) => {
		localStorage.setItem("token", idToken);
		localStorage.setItem("access_token", accessToken);
		localStorage.setItem("refresh_token", refreshToken); // LƯU REFRESH TOKEN
		setToken(idToken);
		setAccessToken(accessToken);
		setRefreshToken(refreshToken);
		const payload = decodeJwtPayload(idToken);
		setUser({
			sub: payload.sub,
			username: payload["cognito:username"],
			name: payload.name,
			email: payload.email,
		});
		setIsAdmin((payload["cognito:groups"] || []).includes("admin"));
	};

	// Cập nhật login()
=======
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

>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
	const login = async (username, password, onSuccess, onError) => {
		try {
			const data = await authService.initiateAuth(username, password);
			const { IdToken, AccessToken, RefreshToken } = data.AuthenticationResult;
			handleLogin(IdToken, AccessToken, RefreshToken);
<<<<<<< HEAD
			onSuccess("Đăng nhập thành công!");
		} catch (error) {
			onError(error.message);
=======
			onSuccess?.("Đăng nhập thành công!");
		} catch (error) {
			onError?.(error.message || "Đăng nhập thất bại");
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setAccessToken(null);
<<<<<<< HEAD
		setIsAdmin(false);
		localStorage.removeItem("token");
		localStorage.removeItem("access_token");
=======
		setRefreshToken(null);
		setIsAdmin(false);
		localStorage.removeItem("token");
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
	};

	const signUp = async (username, email, password, onSuccess, onError) => {
		try {
<<<<<<< HEAD
			// Bạn có thể thêm validation ở đây nếu muốn
			// Ví dụ: if (password.length < 8) { ... }
			setTempPassword(password); // Lưu mật khẩu tạm thời để tự động đăng nhập
			await authService.signUp(username, email, password);
			onSuccess("Mã OTP đã được gửi đến email của bạn.");
		} catch (error) {
			onError(error.message);
=======
			setTempPassword(password);
			await authService.signUp(username, email, password);
			onSuccess?.("Mã OTP đã được gửi đến email của bạn.");
		} catch (error) {
			onError?.(error.message);
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
		}
	};

	const confirmSignUp = async (username, code, onSuccess, onError) => {
		try {
			await authService.confirmSignUp(username, code);
<<<<<<< HEAD
			// Tự động đăng nhập sau khi xác nhận thành công
			const data = await authService.initiateAuth(username, tempPassword);
			const { IdToken, AccessToken } = data.AuthenticationResult;
			handleLogin(IdToken, AccessToken);
			onSuccess("Tài khoản đã được xác minh và đăng nhập thành công!");
		} catch (error) {
			console.error("Lỗi xác nhận hoặc tự động đăng nhập:", error);
			// Nếu tự động đăng nhập thất bại, vẫn thông báo xác nhận thành công
			if (error.message.includes("Incorrect username or password")) {
				onSuccess("Xác minh thành công! Vui lòng đăng nhập.");
			} else {
				onError(error.message);
			}
		} finally {
			setTempPassword(null); // Xóa mật khẩu tạm
=======
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
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
		}
	};

	const resendConfirmationCode = async (username, onSuccess, onError) => {
		try {
			await authService.resendConfirmationCode(username);
<<<<<<< HEAD
			onSuccess("Mã OTP mới đã được gửi đến email của bạn.");
		} catch (error) {
			onError(error.message);
=======
			onSuccess?.("Mã OTP mới đã được gửi!");
		} catch (error) {
			onError?.(error.message);
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
		}
	};

	const forgotPassword = async (username, email, onSuccess, onError) => {
		try {
			const data = await authService.forgotPassword(username, email);
<<<<<<< HEAD
			onSuccess(data.message);
		} catch (error) {
			onError(error.message);
=======
			onSuccess?.(data.message);
		} catch (error) {
			onError?.(error.message);
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
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
<<<<<<< HEAD
			onSuccess("Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.");
		} catch (error) {
			onError(error.message);
=======
			onSuccess?.("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
		} catch (error) {
			onError?.(error.message);
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
		}
	};

	const changeName = async (newName, onSuccess, onError) => {
		try {
			const data = await authService.changeName(newName, token);
<<<<<<< HEAD
			// CẬP NHẬT STATE NGAY LẬP TỨC
			setUser(prev => (prev ? { ...prev, name: newName } : null));
			onSuccess(data.message);
		} catch (err) {
			onError(err.message || "Không thể đổi tên");
=======
			setUser(prev => (prev ? { ...prev, name: newName } : null));
			onSuccess?.(data.message);
		} catch (err) {
			onError?.(err.message || "Không thể đổi tên");
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
		}
	};

	const changePassword = async (
		oldPassword,
		newPassword,
		onSuccess,
		onError
	) => {
<<<<<<< HEAD
		if (!accessToken) {
			onError("Không tìm thấy access token");
			return;
		}
=======
		if (!accessToken) return onError?.("Không tìm thấy access token");
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef

		try {
			const data = await authService.changePassword(
				oldPassword,
				newPassword,
<<<<<<< HEAD
				accessToken, // ← BẮT BUỘC
				token // ← ID Token để xác thực (nếu backend cần)
			);
			onSuccess(data.message);
		} catch (err) {
			onError(err.message || "Không thể đổi mật khẩu");
=======
				accessToken,
				token
			);
			onSuccess?.(data.message || "Đổi mật khẩu thành công!");
		} catch (err) {
			onError?.(err.message || "Đổi mật khẩu thất bại");
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
		}
	};

	const getUserNameBySub = async sub => {
		try {
			const data = await authService.getUserNameBySub(sub);
			return data.name;
		} catch (error) {
<<<<<<< HEAD
			console.error("Error fetching user name by sub:", error);
=======
			console.error("Error fetching user name:", error);
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
			return null;
		}
	};

<<<<<<< HEAD
	// Tất cả các giá trị và hàm được cung cấp cho toàn bộ ứng dụng
=======
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
	const value = {
		user,
		token,
		accessToken,
<<<<<<< HEAD
=======
		refreshToken,
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
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
