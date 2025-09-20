import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
	const { login } = useContext(AuthContext);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const handleLogin = async () => {
		const trimmedUsername = username.trim();
		const trimmedPassword = password.trim();
		if (!trimmedUsername || !trimmedPassword) {
			setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
			return;
		}

		setError("");
		setIsLoading(true);

		const clientId =
			import.meta.env.VITE_COGNITO_APP_CLIENT_ID ||
			"4m3m01cnuvi10maals6nedshf7";
		if (!clientId) {
			setError("Lỗi cấu hình: Client ID không được cung cấp");
			setIsLoading(false);
			return;
		}

		try {
			const response = await fetch(
				"https://cognito-idp.us-east-1.amazonaws.com",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/x-amz-json-1.1",
						"X-Amz-Target": "AWSCognitoIdentityProviderService.InitiateAuth",
					},
					body: JSON.stringify({
						AuthFlow: "USER_PASSWORD_AUTH",
						ClientId: clientId,
						AuthParameters: {
							USERNAME: trimmedUsername,
							PASSWORD: trimmedPassword,
						},
					}),
				}
			);

			if (!response.ok) {
				const text = await response.text();
				try {
					const err = JSON.parse(text);
					const errorMessage =
						err.__type === "InvalidParameterException" &&
						err.Message.includes("USER_PASSWORD_AUTH flow not enabled")
							? "Đăng nhập thất bại: Tính năng đăng nhập chưa được kích hoạt. Vui lòng liên hệ quản trị viên."
							: err.__type === "UserNotConfirmedException"
							? "Tài khoản chưa được xác minh. Vui lòng xác minh OTP."
							: "Tài khoản hoặc mật khẩu không đúng";
					throw new Error(errorMessage);
				} catch (parseError) {
					throw new Error("Tài khoản hoặc mật khẩu không đúng");
				}
			}

			const data = await response.json();
			if (data.AuthenticationResult && data.AuthenticationResult.IdToken) {
				const idToken = data.AuthenticationResult.IdToken;
				const payload = JSON.parse(atob(idToken.split(".")[1]));
				login(idToken, {
					sub: payload.sub,
					username: payload["cognito:username"],
				});
				navigate("/builds");
			} else {
				throw new Error("Đăng nhập thất bại: Không nhận được token");
			}
		} catch (err) {
			const errorMessage = err.message.includes("Failed to fetch")
				? "Lỗi kết nối mạng hoặc CORS. Vui lòng kiểm tra mạng."
				: err.message || "Lỗi khi đăng nhập: Vui lòng thử lại";
			setError(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const isButtonDisabled = isLoading || !username.trim() || !password.trim();

	return (
		<div className='login bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md'>
			(
			<>
				<h1 className='text-2xl font-bold text-white mb-4'>Đăng nhập</h1>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300'>
						Tài khoản:
					</label>
					<input
						type='text'
						value={username}
						onChange={e => setUsername(e.target.value)}
						className='mt-1 block w-full bg-gray-800 text-white rounded-md p-2'
						disabled={isLoading}
						placeholder='Nhập tài khoản'
					/>
				</div>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300'>
						Mật khẩu:
					</label>
					<input
						type='password'
						value={password}
						onChange={e => setPassword(e.target.value)}
						className='mt-1 block w-full bg-gray-800 text-white rounded-md p-2'
						disabled={isLoading}
						placeholder='Nhập mật khẩu'
					/>
				</div>
				<button
					onClick={handleLogin}
					className={`px-4 py-2 bg-blue-600 text-white rounded-md ${
						isButtonDisabled
							? "opacity-50 cursor-not-allowed"
							: "hover:bg-blue-700"
					}`}
					disabled={isButtonDisabled}
				>
					{isLoading ? "Đang xử lý..." : "Đăng nhập"}
				</button>

				{error && <p className='mt-2 text-red-500'>{error}</p>}
			</>
			)
		</div>
	);
};

export default Login;
