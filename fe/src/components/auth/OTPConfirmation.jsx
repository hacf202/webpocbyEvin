import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const OTPConfirmation = ({
	username,
	email,
	onSuccess,
	onClose,
	isPasswordReset = false,
	newPassword,
	setNewPassword,
}) => {
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
				email, // Sử dụng email làm Username cho confirmPasswordReset
				otp,
				newPassword,
				onSuccess,
				setError
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
		setIsLoading(false);
	};

	const handleResendOtp = async () => {
		setIsLoading(true);
		setError(null);
		resendConfirmationCode(
			isPasswordReset ? email : username, // Sử dụng email cho password reset, username cho sign-up
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
		<div className='otp-confirmation bg-gray-800 p-6 rounded-lg shadow-lg'>
			<h2 className='text-xl text-white mb-4'>
				{isPasswordReset ? "Xác Minh Mã Khôi Phục" : "Xác Minh OTP"}
			</h2>
			{isPasswordReset && (
				<div className='mb-4'>
					<label className='block text-sm font-medium text-gray-300 mb-1'>
						Mật khẩu mới:
					</label>
					<input
						type='password'
						placeholder='Nhập mật khẩu mới'
						value={newPassword}
						onChange={e => setNewPassword(e.target.value)}
						className='p-2 w-full bg-gray-700 text-white rounded'
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
					className='mb-2 p-2 w-full bg-gray-700 text-white rounded'
					disabled={isLoading}
				/>
				<div className='flex gap-2'>
					<button
						type='submit'
						className={`flex-1 bg-blue-600 text-white px-4 py-2 rounded ${
							isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
						}`}
						disabled={isLoading}
					>
						{isLoading ? "Đang xử lý..." : "Xác Minh"}
					</button>
					<button
						type='button'
						onClick={handleResendOtp}
						className={`flex-1 bg-gray-600 text-white px-4 py-2 rounded ${
							isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-700"
						}`}
						disabled={isLoading}
					>
						{isLoading ? "Đang xử lý..." : "Gửi Lại OTP"}
					</button>
				</div>
			</form>
			{error && <p className='text-red-500 mt-2'>{error}</p>}
			{success && <p className='text-green-500 mt-2'>{success}</p>}
		</div>
	);
};

export default OTPConfirmation;
