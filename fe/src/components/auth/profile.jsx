// src/pages/auth/Profile.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Pencil, Loader2, ChevronLeft, Eye, EyeOff } from "lucide-react";
import InputField from "../common/inputField";
import Button from "../common/button";

const maskEmail = email => {
	if (!email || !email.includes("@")) return email;
	const [localPart, domain] = email.split("@");
	const domainParts = domain.split(".");
	const tld = domainParts.pop();
	const domainName = domainParts.join(".");
	const maskedLocal =
		localPart.length > 2
			? localPart.substring(0, 2) + "*".repeat(localPart.length - 2)
			: localPart.substring(0, 1) + "*";
	const maskedDomainName =
		domainName.length > 1
			? domainName.substring(0, 1) + "*".repeat(domainName.length - 1)
			: domainName;
	return `${maskedLocal}@${maskedDomainName}.${tld}`;
};

const Profile = () => {
	const { user, changeName, changePassword } = useAuth();
	const navigate = useNavigate();

	// === Tên hiển thị ===
	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState("");
	const [isNameLoading, setIsNameLoading] = useState(false);

	// === Đổi mật khẩu ===
	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");

	// Ẩn/hiện mật khẩu
	const [showOldPassword, setShowOldPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

	// Lỗi riêng từng trường
	const [errors, setErrors] = useState({
		name: "",
		oldPassword: "",
		newPassword: "",
		confirmPassword: "",
	});

	const [message, setMessage] = useState("");
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		if (user && user.name) {
			setName(user.name);
		}
	}, [user]);

	const clearMessages = () => {
		setMessage("");
		setErrorMessage("");
		setErrors({
			name: "",
			oldPassword: "",
			newPassword: "",
			confirmPassword: "",
		});
	};

	// === Xử lý đổi tên ===
	const handleNameChange = async e => {
		e.preventDefault();
		clearMessages();

		const trimmedName = name.trim();
		if (!trimmedName || trimmedName.length < 3) {
			setErrors({ ...errors, name: "Tên phải có ít nhất 3 ký tự" });
			return;
		}

		setIsNameLoading(true);
		await changeName(
			trimmedName,
			successMessage => {
				setMessage(successMessage);
				setIsEditingName(false);
			},
			error => setErrorMessage(error)
		);
		setIsNameLoading(false);
	};

	// === Xử lý đổi mật khẩu ===
	const handlePasswordChange = async e => {
		e.preventDefault();
		clearMessages();

		const err = { oldPassword: "", newPassword: "", confirmPassword: "" };

		if (!oldPassword) err.oldPassword = "Vui lòng nhập mật khẩu cũ";
		if (!newPassword) err.newPassword = "Vui lòng nhập mật khẩu mới";
		else if (newPassword.length < 8)
			err.newPassword = "Mật khẩu phải ≥ 8 ký tự";
		else if (!/[a-z]/.test(newPassword))
			err.newPassword = "Phải có 1 chữ thường";
		else if (!/\d/.test(newPassword)) err.newPassword = "Phải có 1 số";

		if (!confirmPassword) err.confirmPassword = "Vui lòng xác nhận mật khẩu";
		else if (newPassword !== confirmPassword)
			err.confirmPassword = "Mật khẩu không khớp";

		if (err.oldPassword || err.newPassword || err.confirmPassword) {
			setErrors(err);
			return;
		}

		setIsPasswordLoading(true);
		await changePassword(
			oldPassword,
			newPassword,
			successMessage => {
				setMessage(successMessage);
				setShowPasswordForm(false);
				setOldPassword("");
				setNewPassword("");
				setConfirmPassword("");
			},
			error => setErrorMessage(error)
		);
		setIsPasswordLoading(false);
	};

	const cancelNameEdit = () => {
		setName(user.name);
		setIsEditingName(false);
		setErrors({ ...errors, name: "" });
	};

	if (!user) {
		return (
			<div className='text-center p-8 text-text-secondary'>
				Vui lòng đăng nhập.
			</div>
		);
	}

	return (
		<div className='min-h-screen flex items-center justify-center p-4 font-secondary'>
			<div className='max-w-md w-full relative'>
				{/* Nút Quay Lại */}
				<Button
					variant='outline'
					onClick={() => navigate(-1)}
					className='absolute -top-12 left-0'
				>
					<ChevronLeft size={18} />
					Quay lại
				</Button>

				<div className='bg-surface-bg shadow-primary-md rounded-xl p-8 border border-border'>
					<div className='text-center mb-8'>
						<h2 className='text-3xl font-extrabold text-text-primary font-primary'>
							Hồ Sơ Của Bạn
						</h2>
						<p className='mt-2 text-sm text-text-secondary'>
							Xem và chỉnh sửa thông tin tài khoản của bạn.
						</p>
					</div>

					<div className='space-y-4'>
						{/* Tên đăng nhập */}
						<div className='flex items-center justify-between p-3 bg-surface-hover rounded-lg'>
							<span className='text-sm font-medium text-text-secondary'>
								Tên đăng nhập
							</span>
							<span className='text-sm font-semibold text-text-primary'>
								{user.username}
							</span>
						</div>

						{/* Tên hiển thị */}
						<div className='flex items-center justify-between p-3 rounded-lg border border-border'>
							<span className='text-sm font-medium text-text-secondary'>
								Tên người dùng
							</span>
							{!isEditingName ? (
								<div className='flex items-center space-x-2'>
									<span className='text-sm font-semibold text-text-primary'>
										{user.name}
									</span>
									<button
										onClick={() => setIsEditingName(true)}
										className='focus:outline-none text-text-secondary hover:text-primary-500'
									>
										<Pencil size={16} />
									</button>
								</div>
							) : (
								<form
									onSubmit={handleNameChange}
									className='flex items-center space-x-2 w-2/3'
								>
									<InputField
										type='text'
										value={name}
										onChange={e => setName(e.target.value)}
										className='w-full'
										autoFocus
										error={errors.name}
									/>
									<Button
										type='submit'
										variant='primary'
										size='sm'
										disabled={isNameLoading}
										iconLeft={
											isNameLoading && (
												<Loader2 className='animate-spin' size={16} />
											)
										}
									>
										{isNameLoading ? "" : "Lưu"}
									</Button>
									<Button
										type='button'
										variant='ghost'
										size='sm'
										onClick={cancelNameEdit}
									>
										Hủy
									</Button>
								</form>
							)}
						</div>

						{/* Email */}
						<div className='flex items-center justify-between p-3 bg-surface-hover rounded-lg'>
							<span className='text-sm font-medium text-text-secondary'>
								Email
							</span>
							<span className='text-sm font-semibold text-text-primary'>
								{maskEmail(user.email)}
							</span>
						</div>

						{/* Nút đổi mật khẩu */}
						<div className='pt-4'>
							<Button
								onClick={() => setShowPasswordForm(!showPasswordForm)}
								variant='outline'
								className='w-full'
							>
								{showPasswordForm ? "Đóng" : "Đổi mật khẩu"}
							</Button>
						</div>
					</div>

					{/* Form đổi mật khẩu */}
					{showPasswordForm && (
						<form onSubmit={handlePasswordChange} className='mt-6 space-y-4'>
							<InputField
								label='Mật khẩu cũ'
								type={showOldPassword ? "text" : "password"}
								value={oldPassword}
								onChange={e => setOldPassword(e.target.value)}
								error={errors.oldPassword}
								rightIcon={
									<button
										type='button'
										onClick={() => setShowOldPassword(!showOldPassword)}
										className='text-text-secondary hover:text-text-primary'
										tabIndex={-1}
									>
										{showOldPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								}
							/>

							<InputField
								label='Mật khẩu mới'
								type={showNewPassword ? "text" : "password"}
								value={newPassword}
								onChange={e => setNewPassword(e.target.value)}
								error={errors.newPassword}
								rightIcon={
									<button
										type='button'
										onClick={() => setShowNewPassword(!showNewPassword)}
										className='text-text-secondary hover:text-text-primary'
										tabIndex={-1}
									>
										{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
									</button>
								}
							/>

							<InputField
								label='Xác nhận mật khẩu'
								type={showConfirmPassword ? "text" : "password"}
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								error={errors.confirmPassword}
								rightIcon={
									<button
										type='button'
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className='text-text-secondary hover:text-text-primary'
										tabIndex={-1}
									>
										{showConfirmPassword ? (
											<EyeOff size={18} />
										) : (
											<Eye size={18} />
										)}
									</button>
								}
							/>

							<div className='text-xs text-text-secondary'>
								Mật khẩu chỉ cần tối thiểu 8 ký tự, bao gồm chữ thường và số.
							</div>

							<Button
								type='submit'
								variant='primary'
								disabled={isPasswordLoading}
								className='w-full'
								iconLeft={
									isPasswordLoading && (
										<Loader2 className='animate-spin' size={16} />
									)
								}
							>
								{isPasswordLoading
									? "Đang cập nhật..."
									: "Xác nhận đổi mật khẩu"}
							</Button>
						</form>
					)}

					{/* Thông báo */}
					<div className='mt-6'>
						{message && (
							<p className='text-sm text-success text-center'>{message}</p>
						)}
						{errorMessage && (
							<p className='text-sm text-danger-text-dark text-center'>
								{errorMessage}
							</p>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default Profile;
