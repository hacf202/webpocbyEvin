import React, {
	createContext,
	useState,
	useEffect,
	useContext,
	useCallback,
} from "react";
// AuthContext.jsx
import * as authService from "./services/authService";

export const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// Hàm giải mã JWT payload có hỗ trợ ký tự UTF-8 (tiếng Việt)
const decodeJwtPayload = token => {
	try {
		const base64Url = token.split(".")[1];
		const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
		const jsonPayload = decodeURIComponent(
			atob(base64)
				.split("")
				.map(function (c) {
					return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
				})
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
	const login = async (username, password, onSuccess, onError) => {
		try {
			const data = await authService.initiateAuth(username, password);
			const { IdToken, AccessToken, RefreshToken } = data.AuthenticationResult;
			handleLogin(IdToken, AccessToken, RefreshToken);
			onSuccess("Đăng nhập thành công!");
		} catch (error) {
			onError(error.message);
		}
	};

	const logout = () => {
		setUser(null);
		setToken(null);
		setAccessToken(null);
		setIsAdmin(false);
		localStorage.removeItem("token");
		localStorage.removeItem("access_token");
	};

	const signUp = async (username, email, password, onSuccess, onError) => {
		try {
			// Bạn có thể thêm validation ở đây nếu muốn
			// Ví dụ: if (password.length < 8) { ... }
			setTempPassword(password); // Lưu mật khẩu tạm thời để tự động đăng nhập
			await authService.signUp(username, email, password);
			onSuccess("Mã OTP đã được gửi đến email của bạn.");
		} catch (error) {
			onError(error.message);
		}
	};

	const confirmSignUp = async (username, code, onSuccess, onError) => {
		try {
			await authService.confirmSignUp(username, code);
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
		}
	};

	const resendConfirmationCode = async (username, onSuccess, onError) => {
		try {
			await authService.resendConfirmationCode(username);
			onSuccess("Mã OTP mới đã được gửi đến email của bạn.");
		} catch (error) {
			onError(error.message);
		}
	};

	const forgotPassword = async (username, email, onSuccess, onError) => {
		try {
			const data = await authService.forgotPassword(username, email);
			onSuccess(data.message);
		} catch (error) {
			onError(error.message);
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
			// Bạn có thể thêm validation mật khẩu ở đây
			await authService.confirmPasswordReset(username, code, newPassword);
			onSuccess("Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.");
		} catch (error) {
			onError(error.message);
		}
	};

	const changeName = async (newName, onSuccess, onError) => {
		try {
			const data = await authService.changeName(newName, token);
			// Cập nhật lại tên trong state và token
			updateUserName(newName);
			onSuccess(data.message);
		} catch (err) {
			onError(err.message);
		}
	};

	const changePassword = async (
		oldPassword,
		newPassword,
		onSuccess,
		onError
	) => {
		try {
			const data = await authService.changePassword(
				oldPassword,
				newPassword,
				accessToken,
				token
			);
			onSuccess(data.message);
		} catch (err) {
			onError(err.message);
		}
	};

	const updateUserName = newName => {
		setUser(currentUser =>
			currentUser ? { ...currentUser, name: newName } : null
		);
		// Lưu ý: Việc này chỉ cập nhật state ở client. Lần đăng nhập tiếp theo sẽ lấy lại tên từ token.
		// Để cập nhật vĩnh viễn, backend của bạn cần cập nhật thuộc tính 'name' trong Cognito
		// và bạn cần lấy lại token mới sau khi đổi tên.
	};

	const getUserNameBySub = async sub => {
		try {
			const data = await authService.getUserNameBySub(sub);
			return data.name;
		} catch (error) {
			console.error("Error fetching user name by sub:", error);
			return null;
		}
	};

	// Tất cả các giá trị và hàm được cung cấp cho toàn bộ ứng dụng
	const value = {
		user,
		token,
		accessToken,
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
		updateUserName,
		getUserNameBySub,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
