import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import OTPConfirmation from "./OTPConfirmation";

const Login = ({ onSwitchToRegister, onSuccess }) => {
	const { login, forgotPassword } = useContext(AuthContext);
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [forgotUsername, setForgotUsername] = useState("");
	const [forgotEmail, setForgotEmail] = useState("");
	const [resetStep, setResetStep] = useState(1);
	const [success, setSuccess] = useState("");
	const [newPassword, setNewPassword] = useState("");

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
			if (data.AuthenticationResult) {
				const idToken = data.AuthenticationResult.IdToken;
				const accessToken = data.AuthenticationResult.AccessToken;
				const payload = JSON.parse(atob(idToken.split(".")[1]));

				const userData = {
					sub: payload.sub,
					username: payload["cognito:username"],
					name: payload.name || payload["cognito:username"],
					email: payload.email, // THÊM: Lấy email từ token
				};

				login(idToken, accessToken, userData);

				if (onSuccess) {
					onSuccess();
				}
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

	const handleForgotPassword = async e => {
		e.preventDefault();
		const trimmedUsername = forgotUsername.trim();
		const trimmedEmail = forgotEmail.trim();

		setError("");
		setSuccess("");

		if (!trimmedUsername) {
			setError("Vui lòng nhập Tên người dùng");
			return;
		}

		if (!trimmedEmail) {
			setError("Vui lòng nhập Email");
			return;
		}

		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
			setError("Email không hợp lệ. Vui lòng kiểm tra lại định dạng.");
			return;
		}

		setIsLoading(true);

		forgotPassword(
			trimmedUsername,
			trimmedEmail,
			msg => {
				setSuccess(msg);
				setResetStep(2);
				setIsLoading(false);
			},
			err => {
				setError(err);
				setIsLoading(false);
			}
		);
	};

	const switchToLogin = () => {
		setIsForgotPassword(false);
		setResetStep(1);
		setError("");
		setSuccess("");
	};

	const isButtonDisabled = isLoading || !username.trim() || !password.trim();

	return (
		<div
			className='login p-6 rounded-lg shadow-lg w-full max-w-md'
			style={{
				backgroundColor: "var(--color-background)",
				border: "1px solid var(--color-border)",
			}}
		>
			<h1
				className='text-2xl font-bold mb-4'
				style={{ color: "var(--color-text-primary)" }}
			>
				{isForgotPassword ? "Khôi Phục Mật Khẩu" : "Đăng nhập"}
			</h1>

			{isForgotPassword && resetStep === 1 && (
				<form onSubmit={handleForgotPassword}>
					<p
						className='text-sm mb-4'
						style={{ color: "var(--color-text-secondary)" }}
					>
						Vui lòng nhập **Tên người dùng** và **Email** đã đăng ký để kiểm tra
						xác minh.
					</p>
					<div className='mb-4'>
						<label
							className='block text-sm font-medium'
							style={{ color: "var(--color-text-secondary)" }}
						>
							Tên người dùng:
						</label>
						<input
							type='text'
							value={forgotUsername}
							onChange={e => setForgotUsername(e.target.value)}
							className='mt-1 block w-full rounded-md p-2'
							style={{
								backgroundColor: "var(--color-surface)",
								color: "var(--color-text-primary)",
								border: "1px solid var(--color-border)",
							}}
							disabled={isLoading}
							placeholder='Nhập tên người dùng'
						/>
					</div>
					<div className='mb-4'>
						<label
							className='block text-sm font-medium'
							style={{ color: "var(--color-text-secondary)" }}
						>
							Email:
						</label>
						<input
							type='email'
							value={forgotEmail}
							onChange={e => setForgotEmail(e.target.value)}
							className='mt-1 block w-full rounded-md p-2'
							style={{
								backgroundColor: "var(--color-surface)",
								color: "var(--color-text-primary)",
								border: "1px solid var(--color-border)",
							}}
							disabled={isLoading}
							placeholder='Nhập email đã đăng ký'
						/>
					</div>
					<div className='flex justify-between items-center mt-4'>
						<button
							type='submit'
							className={`px-4 py-2 text-white rounded-md ${
								isLoading
									? "opacity-50 cursor-not-allowed"
									: "hover:bg-[var(--color-primary-hover)]"
							}`}
							style={{ backgroundColor: "var(--color-primary)" }}
							disabled={isLoading}
						>
							{isLoading ? "Đang gửi mã..." : "Gửi Mã Khôi Phục"}
						</button>
						<button
							type='button'
							onClick={switchToLogin}
							className='text-sm underline'
							style={{ color: "var(--color-text-link)" }}
						>
							Quay lại Đăng nhập
						</button>
					</div>
				</form>
			)}

			{isForgotPassword && resetStep === 2 && (
				<OTPConfirmation
					username={forgotUsername}
					onSuccess={msg => {
						setSuccess(msg);
						setTimeout(() => switchToLogin(), 2000);
					}}
					onClose={switchToLogin}
					isPasswordReset={true}
					newPassword={newPassword}
					setNewPassword={setNewPassword}
				/>
			)}

			{!isForgotPassword && (
				<>
					<div className='mb-4'>
						<label
							className='block text-sm font-medium'
							style={{ color: "var(--color-text-secondary)" }}
						>
							Tài khoản:
						</label>
						<input
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							className='mt-1 block w-full rounded-md p-2'
							style={{
								backgroundColor: "var(--color-surface)",
								color: "var(--color-text-primary)",
								border: "1px solid var(--color-border)",
							}}
							disabled={isLoading}
							placeholder='Nhập tài khoản'
						/>
					</div>
					<div className='mb-4'>
						<label
							className='block text-sm font-medium'
							style={{ color: "var(--color-text-secondary)" }}
						>
							Mật khẩu:
						</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							className='mt-1 block w-full rounded-md p-2'
							style={{
								backgroundColor: "var(--color-surface)",
								color: "var(--color-text-primary)",
								border: "1px solid var(--color-border)",
							}}
							disabled={isLoading}
							placeholder='Nhập mật khẩu'
						/>
						<button
							type='button'
							onClick={() => {
								setIsForgotPassword(true);
								setError("");
							}}
							className='mt-1 block text-sm underline'
							style={{ color: "var(--color-text-link)" }}
						>
							Quên mật khẩu?
						</button>
					</div>
					<div className='flex justify-between items-center mt-4'>
						<button
							onClick={handleLogin}
							className={`px-4 py-2 text-white rounded-md ${
								isButtonDisabled
									? "opacity-50 cursor-not-allowed"
									: "hover:bg-[var(--color-primary-hover)]"
							}`}
							style={{ backgroundColor: "var(--color-primary)" }}
							disabled={isButtonDisabled}
						>
							{isLoading ? "Đang xử lý..." : "Đăng nhập"}
						</button>
						<button
							onClick={onSwitchToRegister}
							className='text-sm underline'
							style={{ color: "var(--color-text-link)" }}
						>
							Bạn chưa có tài khoản? Đăng ký ngay
						</button>
					</div>
				</>
			)}
			{(error || success) && (
				<p
					className='mt-2'
					style={{
						color: error ? "var(--color-danger)" : "var(--color-success)",
					}}
				>
					{error || success}
				</p>
			)}
		</div>
	);
};

export default Login;
