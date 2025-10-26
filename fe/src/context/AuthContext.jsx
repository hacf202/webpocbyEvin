import React, { createContext, useState, useEffect, useContext } from "react";

export const AuthContext = createContext();

export const useAuth = () => {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
};

// SỬA LỖI: Hàm giải mã JWT payload có hỗ trợ ký tự UTF-8 (tiếng Việt)
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
		// Fallback to simple atob if the robust one fails, though it might still have issues
		try {
			return JSON.parse(atob(token.split(".")[1]));
		} catch (err) {
			console.error("Fallback decoding also failed:", err);
			return null;
		}
	}
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [accessToken, setAccessToken] = useState(null);
	const [tempPassword, setTempPassword] = useState(null);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		const storedAccessToken = localStorage.getItem("access_token");

		if (storedToken && storedAccessToken) {
			const payload = decodeJwtPayload(storedToken); // SỬA LỖI: Dùng hàm giải mã mới
			if (payload && payload.exp * 1000 > Date.now()) {
				setToken(storedToken);
				setAccessToken(storedAccessToken);
				setUser({
					sub: payload.sub,
					username: payload["cognito:username"],
					name: payload.name,
					email: payload.email,
				});
			} else {
				console.log("Token expired or invalid, removing from localStorage");
				localStorage.removeItem("token");
				localStorage.removeItem("access_token");
			}
		}
	}, []);

	const login = (idToken, accessToken, userData) => {
		localStorage.setItem("token", idToken);
		localStorage.setItem("access_token", accessToken);
		setToken(idToken);
		setAccessToken(accessToken);
		setUser(userData);
		console.log("Logged in:", userData);
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("access_token");
		localStorage.removeItem("refresh_token");
		setToken(null);
		setAccessToken(null);
		setUser(null);
		setTempPassword(null);
		console.log("Logged out");
	};

	const signUp = (username, email, password, onSuccess, onError) => {
		if (!username || username.length < 3) {
			onError("Tên người dùng phải có ít nhất 3 ký tự");
			return;
		}
		if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			onError("Email không hợp lệ");
			return;
		}
		if (
			!password ||
			password.length < 8 ||
			!/[0-9]/.test(password) ||
			!/[a-zA-Z]/.test(password)
		) {
			onError("Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số");
			return;
		}

		const clientId =
			import.meta.env.VITE_COGNITO_APP_CLIENT_ID ||
			"4m3m01cnuvi10maals6nedshf7";
		setTempPassword(password);
		fetch("https://cognito-idp.us-east-1.amazonaws.com", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-amz-json-1.1",
				"X-Amz-Target": "AWSCognitoIdentityProviderService.SignUp",
			},
			body: JSON.stringify({
				ClientId: clientId,
				Username: username,
				Password: password,
				UserAttributes: [
					{ Name: "email", Value: email },
					{ Name: "name", Value: "Vô Danh" }, // THAY ĐỔI: Thêm thuộc tính name với giá trị mặc định
				],
			}),
		})
			.then(response => {
				console.log("Cognito SignUp Response:", {
					status: response.status,
					statusText: response.statusText,
					headers: Object.fromEntries(response.headers.entries()),
				});
				if (!response.ok) {
					return response.text().then(text => {
						try {
							const err = JSON.parse(text);
							const errorMessage =
								err.__type === "UsernameExistsException"
									? `Tên người dùng "${username}" đã được đăng ký. Vui lòng chọn tên người dùng khác hoặc đăng nhập.`
									: err.__type === "InvalidParameterException"
									? "Thông tin không hợp lệ, vui lòng kiểm tra lại tên người dùng hoặc email"
									: err.__type === "InvalidPasswordException"
									? "Mật khẩu không đáp ứng yêu cầu của hệ thống"
									: err.__type === "NotAuthorizedException"
									? "Không có quyền thực hiện đăng ký"
									: err.__type === "TooManyRequestsException"
									? "Yêu cầu quá nhanh, vui lòng thử lại sau vài giây"
									: err.__type === "LimitExceededException"
									? "Vượt quá giới hạn đăng ký, vui lòng thử lại sau"
									: err.Message || `Lỗi đăng ký (mã: ${response.status})`;
							throw new Error(errorMessage);
						} catch (parseError) {
							console.error("Failed to parse error response:", text);
							throw new Error(`Lỗi đăng ký (mã: ${response.status}): ${text}`);
						}
					});
				}
				return response.json();
			})
			.then(data => {
				console.log("Cognito SignUp Data:", data);
				if (data.CodeDeliveryDetails) {
					onSuccess("Mã OTP đã được gửi đến email của bạn");
				} else {
					throw new Error("Đăng ký thất bại: Không nhận được mã OTP");
				}
			})
			.catch(err => {
				console.error("SignUp error:", {
					message: err.message,
					type: err.__type,
					response: err,
					clientId: clientId,
				});
				onError(err.message || "Lỗi khi đăng ký: Vui lòng thử lại");
			});
	};

	const confirmSignUp = (username, code, onSuccess, onError) => {
		const clientId =
			import.meta.env.VITE_COGNITO_APP_CLIENT_ID ||
			"4m3m01cnuvi10maals6nedshf7";
		fetch("https://cognito-idp.us-east-1.amazonaws.com", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-amz-json-1.1",
				"X-Amz-Target": "AWSCognitoIdentityProviderService.ConfirmSignUp",
			},
			body: JSON.stringify({
				ClientId: clientId,
				Username: username,
				ConfirmationCode: code,
			}),
		})
			.then(response => {
				console.log("Cognito ConfirmSignUp Response:", {
					status: response.status,
					statusText: response.statusText,
					headers: Object.fromEntries(response.headers.entries()),
				});
				if (!response.ok) {
					return response.text().then(text => {
						try {
							const err = JSON.parse(text);
							const errorMessage =
								err.__type === "CodeMismatchException"
									? "Mã OTP không đúng, vui lòng kiểm tra lại"
									: err.__type === "ExpiredCodeException"
									? "Mã OTP đã hết hạn, vui lòng yêu cầu mã mới"
									: err.__type === "NotAuthorizedException"
									? "Không có quyền xác minh tài khoản"
									: err.__type === "TooManyRequestsException"
									? "Yêu cầu xác minh quá nhanh, vui lòng thử lại sau vài giây"
									: err.__type === "LimitExceededException"
									? "Vượt quá giới hạn xác minh OTP, vui lòng thử lại sau"
									: err.Message || `Lỗi xác minh OTP (mã: ${response.status})`;
							throw new Error(errorMessage);
						} catch (parseError) {
							console.error("Failed to parse error response:", text);
							throw new Error(
								`Lỗi xác minh OTP (mã: ${response.status}): ${text}`
							);
						}
					});
				}
				return response.json();
			})
			.then(data => {
				if (data.__type) {
					throw new Error(data.Message || "Xác minh OTP thất bại");
				}
				fetch("https://cognito-idp.us-east-1.amazonaws.com", {
					method: "POST",
					headers: {
						"Content-Type": "application/x-amz-json-1.1",
						"X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
					},
					body: JSON.stringify({
						AuthFlow: "USER_PASSWORD_AUTH",
						ClientId: clientId,
						AuthParameters: {
							USERNAME: username,
							PASSWORD: tempPassword,
						},
					}),
				})
					.then(response => {
						console.log("Cognito InitiateAuth Response:", {
							status: response.status,
							statusText: response.statusText,
							headers: Object.fromEntries(response.headers.entries()),
						});
						if (!response.ok) {
							return response.text().then(text => {
								try {
									const err = JSON.parse(text);
									const errorMessage =
										err.__type === "InvalidParameterException" &&
										err.Message.includes("USER_PASSWORD_AUTH flow not enabled")
											? "Tính năng đăng nhập tự động chưa được kích hoạt. Vui lòng đăng nhập thủ công."
											: err.__type === "NotAuthorizedException"
											? "Thông tin đăng nhập không hợp lệ"
											: err.__type === "TooManyRequestsException"
											? "Yêu cầu đăng nhập quá nhanh, vui lòng thử lại sau vài giây"
											: err.__type === "LimitExceededException"
											? "Vượt quá giới hạn đăng nhập, vui lòng thử lại sau"
											: err.Message ||
											  `Đăng nhập sau xác minh thất bại (mã: ${response.status})`;
									throw new Error(errorMessage);
								} catch (parseError) {
									console.error(
										"Failed to parse InitiateAuth error response:",
										text
									);
									throw new Error(
										`Đăng nhập sau xác minh thất bại (mã: ${response.status}): ${text}`
									);
								}
							});
						}
						return response.json();
					})
					.then(data => {
						if (
							data.AuthenticationResult &&
							data.AuthenticationResult.IdToken
						) {
							const idToken = data.AuthenticationResult.IdToken;
							const accessToken = data.AuthenticationResult.AccessToken;
							localStorage.setItem(
								"refresh_token",
								data.AuthenticationResult.RefreshToken
							);
							const payload = decodeJwtPayload(idToken); // SỬA LỖI: Dùng hàm giải mã mới
							login(idToken, accessToken, {
								sub: payload.sub,
								username: payload["cognito:username"],
								name: payload.name,
								email: payload.email,
							});
							setTempPassword(null);
							onSuccess("Tài khoản đã được xác minh và đăng nhập thành công!");
						} else {
							throw new Error(
								"Đăng nhập sau xác minh thất bại: Không nhận được token"
							);
						}
					})
					.catch(err => {
						console.error("Auto-login error:", {
							message: err.message,
							response: err,
							clientId: clientId,
						});
						onSuccess("Xác minh OTP thành công! Vui lòng đăng nhập thủ công.");
						setTempPassword(null);
					});
			})
			.catch(err => {
				console.error("ConfirmSignUp error:", {
					message: err.message,
					response: err,
				});
				onError(err.message || "Lỗi khi xác minh OTP: Vui lòng thử lại");
			});
	};

	const resendConfirmationCode = (username, onSuccess, onError) => {
		const clientId =
			import.meta.env.VITE_COGNITO_APP_CLIENT_ID ||
			"4m3m01cnuvi10maals6nedshf7";
		fetch("https://cognito-idp.us-east-1.amazonaws.com", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-amz-json-1.1",
				"X-Amz-Target":
					"AWSCognitoIdentityProviderService.ResendConfirmationCode",
			},
			body: JSON.stringify({
				ClientId: clientId,
				Username: username,
			}),
		})
			.then(response => {
				console.log("Cognito ResendConfirmationCode Response:", {
					status: response.status,
					statusText: response.statusText,
					headers: Object.fromEntries(response.headers.entries()),
				});
				if (!response.ok) {
					return response.text().then(text => {
						try {
							const err = JSON.parse(text);
							const errorMessage =
								err.__type === "UserNotFoundException"
									? "Tài khoản không tồn tại"
									: err.__type === "InvalidParameterException"
									? "Thông tin không hợp lệ, vui lòng kiểm tra lại tên người dùng"
									: err.__type === "TooManyRequestsException"
									? "Yêu cầu quá nhanh, vui lòng thử lại sau vài giây"
									: err.__type === "LimitExceededException"
									? "Vượt quá giới hạn yêu cầu, vui lòng thử lại sau"
									: err.Message ||
									  `Lỗi gửi lại mã OTP (mã: ${response.status})`;
							throw new Error(errorMessage);
						} catch (parseError) {
							console.error("Failed to parse error response:", text);
							throw new Error(
								`Lỗi gửi lại mã OTP (mã: ${response.status}): ${text}`
							);
						}
					});
				}
				return response.json();
			})
			.then(data => {
				if (data.CodeDeliveryDetails) {
					onSuccess("Mã OTP mới đã được gửi đến email của bạn");
				} else {
					throw new Error("Gửi lại mã OTP thất bại: Không nhận được mã");
				}
			})
			.catch(err => {
				console.error("ResendConfirmationCode error:", {
					message: err.message,
					response: err,
				});
				onError(err.message || "Lỗi khi gửi lại mã OTP: Vui lòng thử lại");
			});
	};

	const forgotPassword = (username, email, onSuccess, onError) => {
		const backendUrl =
			import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

		fetch(`${backendUrl}/api/auth/forgot-password-strict`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				username: username,
				email: email,
			}),
		})
			.then(async response => {
				console.log("Backend ForgotPassword Response:", {
					status: response.status,
					statusText: response.statusText,
				});
				if (!response.ok) {
					const errorData = await response.json().catch(() => ({}));
					const errorMessage =
						errorData.error ||
						`Lỗi không xác định từ máy chủ (mã: ${response.status})`;
					throw new Error(errorMessage);
				}
				return response.json();
			})
			.then(data => {
				onSuccess(data.message + ". Vui lòng kiểm tra hộp thư/tin nhắn.");
			})
			.catch(err => {
				console.error("Strict ForgotPassword error:", {
					message: err.message,
					response: err,
				});
				onError(
					err.message || "Lỗi khi yêu cầu đặt lại mật khẩu: Vui lòng thử lại"
				);
			});
	};

	const confirmPasswordReset = (
		username,
		code,
		newPassword,
		onSuccess,
		onError
	) => {
		if (
			!newPassword ||
			newPassword.length < 8 ||
			!/[0-9]/.test(newPassword) ||
			!/[a-zA-Z]/.test(newPassword)
		) {
			onError("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ và số");
			return;
		}

		const clientId =
			import.meta.env.VITE_COGNITO_APP_CLIENT_ID ||
			"4m3m01cnuvi10maals6nedshf7";
		fetch("https://cognito-idp.us-east-1.amazonaws.com", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-amz-json-1.1",
				"X-Amz-Target":
					"AWSCognitoIdentityProviderService.ConfirmForgotPassword",
			},
			body: JSON.stringify({
				ClientId: clientId,
				Username: username,
				ConfirmationCode: code,
				Password: newPassword,
			}),
		})
			.then(response => {
				console.log("Cognito ConfirmForgotPassword Response:", {
					status: response.status,
					statusText: response.statusText,
					headers: Object.fromEntries(response.headers.entries()),
				});
				if (!response.ok) {
					return response.text().then(text => {
						try {
							const err = JSON.parse(text);
							const errorMessage =
								err.__type === "CodeMismatchException"
									? "Mã xác minh không đúng, vui lòng kiểm tra lại"
									: err.__type === "ExpiredCodeException"
									? "Mã xác minh đã hết hạn, vui lòng yêu cầu mã mới"
									: err.__type === "InvalidPasswordException"
									? "Mật khẩu mới không đáp ứng yêu cầu của hệ thống"
									: err.__type === "UserNotFoundException"
									? `Tên người dùng "${username}" không tồn tại.`
									: err.Message ||
									  `Lỗi đặt lại mật khẩu (mã: ${response.status})`;
							throw new Error(errorMessage);
						} catch (parseError) {
							console.error("Failed to parse error response:", text);
							throw new Error(
								`Lỗi đặt lại mật khẩu (mã: ${response.status}): ${text}`
							);
						}
					});
				}
				return response.json();
			})
			.then(data => {
				if (Object.keys(data).length === 0) {
					onSuccess("Mật khẩu đã được đặt lại thành công! Vui lòng đăng nhập.");
				} else {
					throw new Error("Đặt lại mật khẩu thất bại.");
				}
			})
			.catch(err => {
				console.error("ConfirmForgotPassword error:", {
					message: err.message,
					response: err,
				});
				onError(err.message || "Lỗi khi đặt lại mật khẩu: Vui lòng thử lại");
			});
	};

	const changeName = async (newName, onSuccess, onError) => {
		const backendUrl =
			import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
		try {
			const response = await fetch(`${backendUrl}/api/user/change-name`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: newName }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Có lỗi xảy ra");
			}
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
		const backendUrl =
			import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
		try {
			const response = await fetch(`${backendUrl}/api/user/change-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ oldPassword, newPassword, accessToken }),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || "Có lỗi xảy ra");
			}
			onSuccess(data.message);
		} catch (err) {
			onError(err.message);
		}
	};

	const updateUserName = newName => {
		setUser(currentUser => {
			if (currentUser) {
				return { ...currentUser, name: newName };
			}
			return null;
		});
	};

	// THAY ĐỔI: Thêm hàm mới để lấy tên người dùng bằng sub
	const getUserNameBySub = async sub => {
		const backendUrl =
			import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
		try {
			const response = await fetch(`${backendUrl}/api/user/info/${sub}`);
			if (!response.ok) {
				// Nếu không tìm thấy hoặc có lỗi, trả về null
				return null;
			}
			const data = await response.json();
			return data.name; // Giả sử API trả về { name: '...' }
		} catch (error) {
			console.error("Error fetching user name by sub:", error);
			return null;
		}
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				accessToken,
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
				getUserNameBySub, // THAY ĐỔI: Cung cấp hàm mới qua context
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
