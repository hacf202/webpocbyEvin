import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [tempPassword, setTempPassword] = useState(null);

	useEffect(() => {
		const storedToken = localStorage.getItem("token");
		if (storedToken) {
			try {
				const payload = JSON.parse(atob(storedToken.split(".")[1]));
				if (payload.exp * 1000 > Date.now()) {
					setToken(storedToken);
					setUser({
						sub: payload.sub,
						username: payload["cognito:username"],
					});
				} else {
					console.log("Token expired, removing from localStorage");
					localStorage.removeItem("token");
				}
			} catch (err) {
				console.error("Error parsing token:", err);
				localStorage.removeItem("token");
			}
		}
	}, []);

	const login = (idToken, userData) => {
		localStorage.setItem("token", idToken);
		setToken(idToken);
		setUser(userData);
		console.log("Logged in:", {
			sub: userData.sub,
			username: userData.username,
		});
	};

	const logout = () => {
		localStorage.removeItem("token");
		localStorage.removeItem("refresh_token");
		setToken(null);
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
				UserAttributes: [{ Name: "email", Value: email }],
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
							localStorage.setItem(
								"refresh_token",
								data.AuthenticationResult.RefreshToken
							);
							const payload = JSON.parse(atob(idToken.split(".")[1]));
							login(idToken, {
								sub: payload.sub,
								username: payload["cognito:username"],
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

	return (
		<AuthContext.Provider
			value={{
				user,
				token,
				login,
				logout,
				signUp,
				confirmSignUp,
				resendConfirmationCode,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
