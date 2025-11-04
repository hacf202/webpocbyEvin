// src/pages/auth/Register.jsx

import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import OTPConfirmation from "./OTPConfirmation";
import InputField from "../common/inputField";
import Button from "../common/button";
import { Loader2, Eye, EyeOff } from "lucide-react";

const Register = ({ onClose, onSwitchToLogin }) => {
	const { signUp } = useContext(AuthContext);
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [step, setStep] = useState(1);
	const [isLoading, setIsLoading] = useState(false);

	// Lỗi chỉ hiện khi submit
	const [errors, setErrors] = useState({
		username: "",
		email: "",
		password: "",
		confirmPassword: "",
	});

	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// === Validate (chỉ gọi khi submit) ===
	const validateForm = () => {
		const err = {
			username: "",
			email: "",
			password: "",
			confirmPassword: "",
		};

		if (!username.trim()) err.username = "Vui lòng nhập tên người dùng";
		else if (/[^a-zA-Z0-9_]/.test(username))
			err.username = "Chỉ cho phép chữ, số và gạch dưới";

		if (!email) err.email = "Vui lòng nhập email";
		else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
			err.email = "Email không hợp lệ";

		if (!password) err.password = "Vui lòng nhập mật khẩu";
		else if (password.length < 8) err.password = "Mật khẩu phải ≥ 8 ký tự";
		else if (!/\d/.test(password)) err.password = "Phải có 1 số";

		if (!confirmPassword) err.confirmPassword = "Vui lòng xác nhận mật khẩu";
		else if (password !== confirmPassword)
			err.confirmPassword = "Mật khẩu không khớp";

		setErrors(err);
		return !err.username && !err.email && !err.password && !err.confirmPassword;
	};

	// === Xử lý đăng ký ===
	const handleRegister = async e => {
		e.preventDefault();
		if (!validateForm()) return;

		setIsLoading(true);
		setErrors({ username: "", email: "", password: "", confirmPassword: "" });

		signUp(
			username.trim(),
			email.trim(),
			password,
			() => {
				setStep(2);
				setIsLoading(false);
			},
			err => {
				setErrors({ ...errors, username: "Tài khoản hoặc email đã tồn tại" });
				setIsLoading(false);
			}
		);
	};

	return (
		<div className='p-8'>
			{step === 1 ? (
				<form onSubmit={handleRegister} className='space-y-4'>
					<h2 className='text-2xl font-bold mb-6 text-text-primary font-primary text-center'>
						Đăng Ký Tài Khoản Mới
					</h2>

					<InputField
						type='text'
						placeholder='Tên người dùng'
						value={username}
						onChange={e => setUsername(e.target.value)}
						disabled={isLoading}
						error={errors.username}
						className='w-full'
					/>

					<InputField
						type='email'
						placeholder='Email'
						value={email}
						onChange={e => setEmail(e.target.value)}
						disabled={isLoading}
						error={errors.email}
						className='w-full'
					/>

					<InputField
						type={showPassword ? "text" : "password"}
						placeholder='Mật khẩu (≥8 ký tự)'
						value={password}
						onChange={e => setPassword(e.target.value)}
						disabled={isLoading}
						error={errors.password}
						className='w-full'
						rightIcon={
							<button
								type='button'
								onClick={() => setShowPassword(!showPassword)}
								className='p-1'
								tabIndex={-1}
							>
								{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						}
					/>

					<InputField
						type={showConfirmPassword ? "text" : "password"}
						placeholder='Xác nhận mật khẩu'
						value={confirmPassword}
						onChange={e => setConfirmPassword(e.target.value)}
						disabled={isLoading}
						error={errors.confirmPassword}
						className='w-full'
						rightIcon={
							<button
								type='button'
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className='p-1'
								tabIndex={-1}
							>
								{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
							</button>
						}
					/>

					<p className='text-xs text-text-secondary'>
						Mật khẩu chỉ cần tối thiểu 8 ký tự, bao gồm chữ thường và số.
					</p>

					<div className='flex flex-col sm:flex-row justify-between items-center mt-6 gap-4'>
						<Button
							type='submit'
							disabled={isLoading}
							className='w-full sm:w-auto'
							iconLeft={
								isLoading && <Loader2 className='animate-spin' size={16} />
							}
						>
							{isLoading ? "Đang xử lý..." : "Đăng Ký"}
						</Button>
						<button
							type='button'
							onClick={onSwitchToLogin}
							className='text-sm underline text-text-link hover:text-primary-700 w-full sm:w-auto'
						>
							Quay lại Đăng nhập
						</button>
					</div>
				</form>
			) : (
				<OTPConfirmation
					username={username}
					onSuccess={() => setTimeout(() => onClose(), 2000)}
					onClose={onClose}
				/>
			)}
		</div>
	);
};

export default Register;
