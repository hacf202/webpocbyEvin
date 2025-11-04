// src/pages/auth/OTPConfirmation.jsx (ĐÃ ĐỒNG BỘ)

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2 } from "lucide-react";

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
				username,
				otp,
				newPassword,
				msg => {
					setSuccess(msg);
					setIsLoading(false);
					onSuccess(msg);
				},
				err => {
					setError(err);
					setIsLoading(false);
				}
			);
		} else {
			confirmSignUp(
				username,
				otp,
				msg => {
					setSuccess(msg);
					onSuccess(msg); // Gọi onSuccess đã được truyền từ Register.jsx
				},
				err => {
					setError(err);
					setIsLoading(false); // Thêm này
				}
			);
		}
	};

	const handleResendOtp = async () => {
		setIsLoading(true);
		setError(null);
		setSuccess(null);
		resendConfirmationCode(
			username,
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
		<div className='p-8'>
			{" "}
			{/* Tăng padding */}
			<h2 className='text-2xl font-bold mb-6 text-text-primary font-primary text-center'>
				{isPasswordReset ? "Xác Minh Mã Khôi Phục" : "Xác Minh OTP"}
			</h2>
			{isPasswordReset && (
				<div className='mb-4'>
					<InputField
						label='Mật khẩu mới:'
						type='password'
						placeholder='Nhập mật khẩu mới'
						value={newPassword}
						onChange={e => setNewPassword(e.target.value)}
						disabled={isLoading}
						className='w-full'
					/>
				</div>
			)}
			<form onSubmit={handleConfirmOtp}>
				<InputField
					type='text'
					placeholder='Mã OTP'
					value={otp}
					onChange={e => setOtp(e.target.value)}
					disabled={isLoading}
					className='mb-6 w-full'
				/>
				<div className='flex flex-col sm:flex-row gap-4'>
					{" "}
					{/* Responsive buttons */}
					<Button
						type='submit'
						disabled={isLoading}
						className='flex-1 w-full sm:w-auto'
						iconLeft={
							isLoading && <Loader2 className='animate-spin' size={16} />
						}
					>
						{isLoading ? "..." : "Xác Minh"}
					</Button>
					<Button
						type='button'
						variant='outline'
						onClick={handleResendOtp}
						disabled={isLoading}
						className='flex-1 w-full sm:w-auto'
						iconLeft={
							isLoading && <Loader2 className='animate-spin' size={16} />
						}
					>
						{isLoading ? "..." : "Gửi Lại OTP"}
					</Button>
				</div>
			</form>
			{error && (
				<p className='text-danger-text-dark mt-4 text-sm text-center'>
					{error}
				</p>
			)}
			{success && (
				<p className='text-success mt-4 text-sm text-center'>{success}</p>
			)}
		</div>
	);
};

export default OTPConfirmation;
