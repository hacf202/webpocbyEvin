import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const OTPConfirmation = ({
	username,
	email, // Giữ lại email nếu cần hiển thị, nhưng không dùng cho logic API
	onSuccess,
	onClose,
	isPasswordReset = false,
	newPassword,
	setNewPassword,
}) => {
	// SỬA: Thay đổi tên hàm để khớp với AuthContext mới
	const { confirmSignUp, confirmPasswordReset, resendConfirmationCode } =
		useContext(AuthContext);
	const [otp, setOtp] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(null);

	const handleConfirmOtp = async e => {
		e.preventDefault();
		if (!otp.trim()) {
			setError("Vui lòng nhập mã OTP");
			return;
		}
		setIsLoading(true);
		setError(null);

		if (isPasswordReset) {
			if (
				!newPassword ||
				newPassword.length < 8 ||
				!/[0-9]/.test(newPassword) ||
				!/[a-zA-Z]/.test(newPassword)
			) {
				setError("Mật khẩu mới phải có ít nhất 8 ký tự, bao gồm chữ và số");
				setIsLoading(false);
				return;
			}
			confirmPasswordReset(
				username, // SỬA: Sử dụng username làm đối số cho ConfirmForgotPassword
				otp,
				newPassword,
				msg => {
					setSuccess(msg);
					setIsLoading(false);
					onSuccess(msg); // Gọi onSuccess để thông báo và chuyển màn hình
				},
				err => {
					setError(err);
					setIsLoading(false);
				}
			);
		} else {
			confirmSignUp(
				username, // Đối với sign-up, sử dụng username
				otp,
				msg => {
					setSuccess(msg);
					setTimeout(() => onClose(), 2000);
				},
				setError
			);
		}
	};

	const handleResendOtp = async () => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);
		resendConfirmationCode(
			username, // SỬA: Luôn sử dụng username cho cả password reset và sign-up
			msg => {
				setSuccess(msg);
				setIsLoading(false);
			},
			err => {
				setError(err);
				setIsLoading(false);
			}
		);
	};

	return (
		<div
			className='otp-confirmation p-6 rounded-lg shadow-lg'
			style={{
				backgroundColor: "var(--color-background)", // Thay thế bg-gray-800
				border: "1px solid var(--color-border)",
			}}
		>
			<h2
				className='text-xl font-bold mb-4'
				style={{ color: "var(--color-text-primary)" }} // Thay thế text-white
			>
				{isPasswordReset ? "Xác Minh Mã Khôi Phục" : "Xác Minh OTP"}
			</h2>
			{isPasswordReset && (
				<div className='mb-4'>
					<label
						className='block text-sm font-medium mb-1'
						style={{ color: "var(--color-text-secondary)" }} // Thay thế text-gray-300
					>
						Mật khẩu mới:
					</label>
					<input
						type='password'
						placeholder='Nhập mật khẩu mới'
						value={newPassword}
						onChange={e => setNewPassword(e.target.value)}
						className='p-2 w-full rounded'
						style={{
							backgroundColor: "var(--color-surface)", // Thay thế bg-gray-700
							color: "var(--color-text-primary)", // Thay thế text-white
							border: "1px solid var(--color-border)",
						}}
						disabled={isLoading}
					/>
				</div>
			)}
			<form onSubmit={handleConfirmOtp}>
				<input
					type='text'
					placeholder='Mã OTP'
					value={otp}
					onChange={e => setOtp(e.target.value)}
					className='mb-2 p-2 w-full rounded'
					style={{
						backgroundColor: "var(--color-surface)", // Thay thế bg-gray-700
						color: "var(--color-text-primary)", // Thay thế text-white
						border: "1px solid var(--color-border)",
					}}
					disabled={isLoading}
				/>
				<div className='flex gap-2'>
					<button
						type='submit'
						className={`flex-1 text-white px-4 py-2 rounded ${
							isLoading
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-[var(--color-primary-hover)]"
						}`}
						style={{ backgroundColor: "var(--color-primary)" }} // Thay thế bg-blue-600
						disabled={isLoading}
					>
						{isLoading ? "Đang xử lý..." : "Xác Minh"}
					</button>
					<button
						type='button'
						onClick={handleResendOtp}
						className={`flex-1 text-white px-4 py-2 rounded ${
							isLoading
								? "opacity-50 cursor-not-allowed"
								: "hover:bg-[var(--color-text-secondary)]" // Dùng Secondary làm màu nền cho nút phụ
						}`}
						style={{ backgroundColor: "var(--color-border)" }} // Thay thế bg-gray-600
						disabled={isLoading}
					>
						{isLoading ? "Đang xử lý..." : "Gửi Lại OTP"}
					</button>
				</div>
			</form>
			{error && <p className='text-[var(--color-danger)] mt-2'>{error}</p>}
			{success && <p className='text-green-500 mt-2'>{success}</p>}
		</div>
	);
};

export default OTPConfirmation;
