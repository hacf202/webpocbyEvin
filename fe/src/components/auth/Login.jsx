import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Login = ({ onSwitchToRegister, onSuccess }) => {
	const { login, forgotPassword } = useContext(AuthContext);

	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const [isForgotPassword, setIsForgotPassword] = useState(false);
	const [forgotUsername, setForgotUsername] = useState("");
	const [forgotEmail, setForgotEmail] = useState("");
	const [success, setSuccess] = useState("");

	const handleLogin = async () => {
		const trimmedUsername = username.trim();
		const trimmedPassword = password.trim();
		if (!trimmedUsername || !trimmedPassword) {
			setError("Vui lòng nhập đầy đủ tài khoản và mật khẩu");
			return;
		}

		setError("");
		setIsLoading(true);

		await login(
			trimmedUsername,
			trimmedPassword,
			successMessage => {
				setIsLoading(false);
				if (onSuccess) {
					onSuccess(successMessage);
				}
			},
			errorMessage => {
				setIsLoading(false);
				setError(errorMessage);
			}
		);
	};

	const handleForgotPassword = async () => {
		if (!forgotUsername || !forgotEmail) {
			setError("Vui lòng nhập tên người dùng và email.");
			return;
		}
		setIsLoading(true);
		setError("");
		setSuccess("");
		await forgotPassword(
			forgotUsername,
			forgotEmail,
			message => {
				setIsLoading(false);
				setSuccess(message);
			},
			err => {
				setIsLoading(false);
				setError(err);
			}
		);
	};

	const isButtonDisabled = isLoading || !username.trim() || !password.trim();

	return (
		<div className='p-4'>
			{isForgotPassword ? (
				<div>
					<h2 className='text-xl font-bold mb-4'>Quên Mật Khẩu</h2>
					{success ? (
						<p className='text-green-500 mb-4'>{success}</p>
					) : (
						<>
							{error && <p className='text-red-500 mb-2'>{error}</p>}
							<div className='mb-4'>
								<label className='block text-sm font-medium mb-1'>
									Tên người dùng
								</label>
								<input
									type='text'
									value={forgotUsername}
									onChange={e => setForgotUsername(e.target.value)}
									className='w-full p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]'
								/>
							</div>
							<div className='mb-4'>
								<label className='block text-sm font-medium mb-1'>Email</label>
								<input
									type='email'
									value={forgotEmail}
									onChange={e => setForgotEmail(e.target.value)}
									className='w-full p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]'
								/>
							</div>
							<div className='flex justify-between items-center mt-4'>
								<button
									onClick={handleForgotPassword}
									disabled={isLoading}
									className='px-4 py-2 text-white rounded-md bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)]'
								>
									{isLoading ? "Đang gửi..." : "Gửi yêu cầu"}
								</button>
								<button
									onClick={() => setIsForgotPassword(false)}
									className='text-sm underline text-[var(--color-text-link)]'
								>
									Quay lại Đăng nhập
								</button>
							</div>
						</>
					)}
				</div>
			) : (
				<>
					<h2 className='text-xl font-bold mb-4'>Đăng Nhập</h2>
					{error && <p className='text-red-500 mb-2'>{error}</p>}
					<div className='mb-4'>
						<label className='block text-sm font-medium mb-1'>Tài khoản</label>
						<input
							type='text'
							value={username}
							onChange={e => setUsername(e.target.value)}
							className='w-full p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]'
							placeholder='Nhập tài khoản'
						/>
					</div>
					<div className='mb-4'>
						<label className='block text-sm font-medium mb-1'>Mật khẩu</label>
						<input
							type='password'
							value={password}
							onChange={e => setPassword(e.target.value)}
							className='w-full p-2 rounded-md bg-[var(--color-surface)] border border-[var(--color-border)]'
							placeholder='Nhập mật khẩu'
						/>
						<button
							type='button'
							onClick={() => {
								setIsForgotPassword(true);
								setError("");
							}}
							className='mt-1 block text-sm underline text-[var(--color-text-link)]'
						>
							Quên mật khẩu?
						</button>
					</div>
					<div className='flex justify-between items-center mt-4'>
						<button
							onClick={handleLogin}
							className={`px-4 py-2 text-white rounded-md bg-[var(--color-primary)] ${
								isButtonDisabled
									? "opacity-50 cursor-not-allowed"
									: "hover:bg-[var(--color-primary-hover)]"
							}`}
							disabled={isButtonDisabled}
						>
							{isLoading ? "Đang xử lý..." : "Đăng nhập"}
						</button>
						<button
							onClick={onSwitchToRegister}
							className='text-sm underline text-[var(--color-text-link)]'
						>
							Bạn chưa có tài khoản? Đăng ký ngay
						</button>
					</div>
				</>
			)}
		</div>
	);
};

export default Login;
