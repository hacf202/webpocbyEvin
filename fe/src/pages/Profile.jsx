import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const PencilIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		className='h-5 w-5 text-gray-500 hover:text-indigo-600'
		viewBox='0 0 20 20'
		fill='currentColor'
	>
		<path d='M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z' />
		<path
			fillRule='evenodd'
			d='M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z'
			clipRule='evenodd'
		/>
	</svg>
);

// Helper function to mask email
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
	const { user, changeName, changePassword, updateUserName } = useAuth();

	const [isEditingName, setIsEditingName] = useState(false);
	const [name, setName] = useState("");
	const [isNameLoading, setIsNameLoading] = useState(false);

	const [showPasswordForm, setShowPasswordForm] = useState(false);
	const [oldPassword, setOldPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [isPasswordLoading, setIsPasswordLoading] = useState(false);

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
	};

	const handleNameChange = async e => {
		e.preventDefault();
		clearMessages();
		if (!name || name.trim().length < 3) {
			setErrorMessage("Tên hiển thị phải có ít nhất 3 ký tự.");
			return;
		}
		setIsNameLoading(true);
		await changeName(
			name,
			successMessage => {
				setMessage(successMessage);
				updateUserName(name); // SỬA LỖI: Cập nhật state ngay lập tức
				setIsEditingName(false);
			},
			error => setErrorMessage(error)
		);
		setIsNameLoading(false);
	};

	const handlePasswordChange = async e => {
		e.preventDefault();
		clearMessages();
		if (newPassword !== confirmPassword) {
			setErrorMessage("Mật khẩu mới và mật khẩu xác nhận không khớp.");
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
	};

	if (!user) {
		return <div className='text-center p-8'>Vui lòng đăng nhập.</div>;
	}

	return (
		<div className='min-h-screen bg-gray-50 flex items-center justify-center p-4'>
			<div className='max-w-md w-full bg-white shadow-lg rounded-xl p-8'>
				<div className='text-center mb-8'>
					<h2 className='text-3xl font-extrabold text-gray-900'>
						Hồ Sơ Của Bạn
					</h2>
					<p className='mt-2 text-sm text-gray-600'>
						Xem và chỉnh sửa thông tin tài khoản của bạn.
					</p>
				</div>

				<div className='space-y-4'>
					<div className='flex items-center justify-between p-3 bg-gray-100 rounded-lg'>
						<span className='text-sm font-medium text-gray-500'>
							Tên đăng nhập
						</span>
						<span className='text-sm font-semibold text-gray-900'>
							{user.username}
						</span>
					</div>

					<div className='flex items-center justify-between p-3 rounded-lg border'>
						<span className='text-sm font-medium text-gray-500'>
							Tên người dùng
						</span>
						{!isEditingName ? (
							<div className='flex items-center space-x-2'>
								<span className='text-sm font-semibold text-gray-900'>
									{user.name}
								</span>
								<button
									onClick={() => setIsEditingName(true)}
									className='focus:outline-none'
								>
									<PencilIcon />
								</button>
							</div>
						) : (
							<form
								onSubmit={handleNameChange}
								className='flex items-center space-x-2 w-2/3'
							>
								<input
									type='text'
									value={name}
									onChange={e => setName(e.target.value)}
									className='w-full px-2 py-1 text-sm border-b-2 border-indigo-500 focus:outline-none'
									autoFocus
								/>
								<button
									type='submit'
									className='text-sm text-indigo-600 hover:text-indigo-800 font-semibold'
									disabled={isNameLoading}
								>
									{isNameLoading ? "Lưu..." : "Lưu"}
								</button>
								<button
									type='button'
									onClick={cancelNameEdit}
									className='text-sm text-gray-500 hover:text-gray-700'
								>
									Hủy
								</button>
							</form>
						)}
					</div>

					<div className='flex items-center justify-between p-3 bg-gray-100 rounded-lg'>
						<span className='text-sm font-medium text-gray-500'>Email</span>
						<span className='text-sm font-semibold text-gray-900'>
							{maskEmail(user.email)}
						</span>
					</div>

					<div className='pt-4'>
						<button
							onClick={() => setShowPasswordForm(!showPasswordForm)}
							className='w-full text-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none'
						>
							Đổi mật khẩu
						</button>
					</div>
				</div>

				{showPasswordForm && (
					<form
						onSubmit={handlePasswordChange}
						className='mt-6 space-y-4 animate-fade-in-down'
					>
						<div>
							<label className='block text-sm font-medium text-gray-700'>
								Mật khẩu cũ
							</label>
							<input
								type='password'
								value={oldPassword}
								onChange={e => setOldPassword(e.target.value)}
								required
								className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700'>
								Mật khẩu mới
							</label>
							<input
								type='password'
								value={newPassword}
								onChange={e => setNewPassword(e.target.value)}
								required
								className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
							/>
						</div>
						<div>
							<label className='block text-sm font-medium text-gray-700'>
								Xác nhận mật khẩu
							</label>
							<input
								type='password'
								value={confirmPassword}
								onChange={e => setConfirmPassword(e.target.value)}
								required
								className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
							/>
						</div>
						<button
							type='submit'
							disabled={isPasswordLoading}
							className='w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50'
						>
							{isPasswordLoading ? "Đang cập nhật..." : "Xác nhận đổi mật khẩu"}
						</button>
					</form>
				)}

				<div className='mt-6'>
					{message && (
						<p className='text-sm text-green-600 text-center'>{message}</p>
					)}
					{errorMessage && (
						<p className='text-sm text-red-600 text-center'>{errorMessage}</p>
					)}
				</div>
			</div>
		</div>
	);
};

export default Profile;
