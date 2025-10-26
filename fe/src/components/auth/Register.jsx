import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import OTPConfirmation from "./OTPConfirmation";

const Register = ({ onClose, onSwitchToLogin }) => {
	// Thêm onSwitchToLogin
	const { signUp } = useContext(AuthContext);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const handleRegister = async e => {
		e.preventDefault();
		if (password !== confirmPassword) {
			setError("Mật khẩu và xác nhận mật khẩu không khớp");
			return;
		}
		if (!username) {
			setError("Vui lòng nhập tên người dùng");
			return;
		}
		setIsLoading(true);
		setError(null);
		signUp(
			username,
			email,
			password,
			msg => {
				setSuccess(msg);
				setStep(2);
				setIsLoading(false);
			},
			() => {
				setError("Tài khoản đã được đăng ký trước đó, vui lòng thử tên khác");
				setIsLoading(false);
			}
		);
	};

	return (
		<div
			className='register-modal p-6 rounded-lg shadow-lg'
			style={{
				backgroundColor: "var(--color-background)", // Thay thế bg-gray-900
				border: "1px solid var(--color-border)",
			}}
		>
			<h2
				className='text-xl font-bold mb-4'
				style={{ color: "var(--color-text-primary)" }} // Thay thế text-white
			>
				Đăng Ký
			</h2>
			{step === 1 ? (
				<form onSubmit={handleRegister}>
					<input
						type='text'
						placeholder='Tên người dùng'
						value={username}
						onChange={e => setUsername(e.target.value)}
						className='mb-2 p-2 w-full rounded'
						style={{
							backgroundColor: "var(--color-surface)", // Thay thế bg-gray-800
							color: "var(--color-text-primary)", // Thay thế text-white
							border: "1px solid var(--color-border)",
						}}
						disabled={isLoading}
					/>
					<input
						type='email'
						placeholder='Email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						className='mb-2 p-2 w-full rounded'
						style={{
							backgroundColor: "var(--color-surface)", // Thay thế bg-gray-800
							color: "var(--color-text-primary)", // Thay thế text-white
							border: "1px solid var(--color-border)",
						}}
						disabled={isLoading}
					/>
					<input
						type='password'
						placeholder='Mật khẩu'
						value={password}
						onChange={e => setPassword(e.target.value)}
						className='mb-2 p-2 w-full rounded'
						style={{
							backgroundColor: "var(--color-surface)", // Thay thế bg-gray-800
							color: "var(--color-text-primary)", // Thay thế text-white
							border: "1px solid var(--color-border)",
						}}
						disabled={isLoading}
					/>
					<input
						type='password'
						placeholder='Xác nhận mật khẩu'
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						className='mb-2 p-2 w-full rounded'
						style={{
							backgroundColor: "var(--color-surface)", // Thay thế bg-gray-800
							color: "var(--color-text-primary)", // Thay thế text-white
							border: "1px solid var(--color-border)",
						}}
						disabled={isLoading}
					/>
					<p
						className='text-sm mb-2'
						style={{ color: "var(--color-text-secondary)" }} // Thay thế text-gray-400
					>
						Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc
					</p>
					<div className='flex justify-between items-center mt-4'>
						<button
							type='submit'
							className={`text-white px-4 py-2 rounded ${
								isLoading
									? "opacity-50 cursor-not-allowed"
									: "hover:bg-[var(--color-primary-hover)]"
							}`}
							style={{ backgroundColor: "var(--color-primary)" }} // Thay thế bg-blue-600
							disabled={isLoading}
						>
							{isLoading ? "Đang xử lý..." : "Đăng Ký"}
						</button>
						<button
							type='button'
							onClick={onSwitchToLogin} // Nút chuyển về Đăng nhập
							className='text-sm underline'
							style={{ color: "var(--color-text-link)" }} // Thay thế text-gray-400 và hover:text-gray-200
						>
							Quay lại Đăng nhập
						</button>
					</div>
				</form>
			) : (
				<OTPConfirmation
					username={username}
					onSuccess={msg => {
						setSuccess(msg);
						setTimeout(() => onClose(), 2000);
					}}
					onClose={onClose}
				/>
			)}
			{error && <p className='text-[var(--color-danger)] mt-2'>{error}</p>}
			{success && <p className='text-green-500 mt-2'>{success}</p>}
		</div>
	);
};

export default Register;
