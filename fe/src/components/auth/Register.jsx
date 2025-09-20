import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import OTPConfirmation from "./OTPConfirmation";

const Register = ({ onClose }) => {
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
		<div className='register-modal bg-gray-800 p-6 rounded-lg shadow-lg'>
			<h2 className='text-xl text-white mb-4'>Đăng Ký</h2>
			{step === 1 ? (
				<form onSubmit={handleRegister}>
					<input
						type='text'
						placeholder='Tên người dùng'
						value={username}
						onChange={e => setUsername(e.target.value)}
						className='mb-2 p-2 w-full bg-gray-700 text-white rounded'
						disabled={isLoading}
					/>
					<input
						type='email'
						placeholder='Email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						className='mb-2 p-2 w-full bg-gray-700 text-white rounded'
						disabled={isLoading}
					/>
					<input
						type='password'
						placeholder='Mật khẩu'
						value={password}
						onChange={e => setPassword(e.target.value)}
						className='mb-2 p-2 w-full bg-gray-700 text-white rounded'
						disabled={isLoading}
					/>
					<input
						type='password'
						placeholder='Xác nhận mật khẩu'
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						className='mb-2 p-2 w-full bg-gray-700 text-white rounded'
						disabled={isLoading}
					/>
					<p className='text-gray-400 text-sm mb-2'>
						Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc
					</p>
					<button
						type='submit'
						className={`bg-blue-600 text-white px-4 py-2 rounded ${
							isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
						}`}
						disabled={isLoading}
					>
						{isLoading ? "Đang xử lý..." : "Đăng Ký"}
					</button>
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
			{error && <p className='text-red-500 mt-2'>{error}</p>}
			{success && <p className='text-green-500 mt-2'>{success}</p>}
		</div>
	);
};

export default Register;
