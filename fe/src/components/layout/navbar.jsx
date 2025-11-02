import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// --- BƯỚC 1: IMPORT CÁC COMPONENT MỚI ---
import Modal from "../common/Modal"; // Giả sử Modal.jsx cùng cấp, hãy điều chỉnh đường dẫn nếu cần
import Button from "../common/Button"; // Giả sử Button.jsx cùng cấp, hãy điều chỉnh đường dẫn nếu cần

function Navbar() {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const navigate = useNavigate();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const profileMenuRef = useRef(null);

	// --- BƯỚC 2: THÊM STATE ĐỂ QUẢN LÝ MODAL ---
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	// Hàm thực hiện đăng xuất sau khi người dùng xác nhận trong Modal
	const confirmLogout = () => {
		logout();
		setIsLogoutModalOpen(false); // Đóng modal
		closeAllMenus(); // Đóng các menu khác nếu đang mở
		navigate("/");
	};

	const closeAllMenus = () => {
		setIsMenuOpen(false);
		setIsProfileOpen(false);
	};

	useEffect(() => {
		function handleClickOutside(event) {
			if (
				profileMenuRef.current &&
				!profileMenuRef.current.contains(event.target)
			) {
				setIsProfileOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [profileMenuRef]);

	return (
		<>
			<header className='bg-[var(--color-navbar-bg)] text-[var(--color-navbar-text)] p-4 shadow-xl sticky top-0 z-50'>
				<div className='container mx-auto flex justify-between items-center'>
					<NavLink
						to='/'
						className='text-2xl font-bold'
						onClick={closeAllMenus}
					>
						Web POC
					</NavLink>

					{/* ... (Phần code hamburger menu và các link điều hướng không đổi) ... */}
					<button
						className='xl:hidden focus:outline-none'
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						aria-label='Toggle menu'
					>
						<svg
							className='w-6 h-6'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d={
									isMenuOpen
										? "M6 18L18 6M6 6l12 12"
										: "M4 6h16M4 12h16M4 18h16"
								}
							/>
						</svg>
					</button>

					<div
						className={`${
							isMenuOpen ? "block" : "hidden"
						} xl:flex xl:items-center xl:gap-4 absolute xl:static top-16 left-0 w-full xl:w-auto bg-[var(--color-navbar-bg)] xl:bg-transparent z-40`}
					>
						<nav className='flex flex-col xl:flex-row xl:items-center p-4 xl:p-0 border-t xl:border-none border-gray-600'>
							<NavLink
								to='/champions'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-4 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsMenuOpen(false)}
							>
								Tướng
							</NavLink>
							<NavLink
								to='/relics'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-4 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsMenuOpen(false)}
							>
								Cổ Vật
							</NavLink>
							<NavLink
								to='/powers'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-4 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsMenuOpen(false)}
							>
								Sức Mạnh
							</NavLink>
							<NavLink
								to='/items'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-4 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsMenuOpen(false)}
							>
								Vật Phẩm
							</NavLink>
							<NavLink
								to='/runes'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-4 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsMenuOpen(false)}
							>
								Ngọc
							</NavLink>
							<NavLink
								to='/builds'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-4 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsMenuOpen(false)}
							>
								Builds
							</NavLink>
							<NavLink
								to='/randomizer'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-4 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsMenuOpen(false)}
							>
								Vòng quay
							</NavLink>
						</nav>

						<div className='flex items-center gap-4 p-4 xl:p-0 border-t xl:border-none border-gray-600'>
							{user ? (
								<div className='relative' ref={profileMenuRef}>
									<button
										onClick={() => setIsProfileOpen(!isProfileOpen)}
										className='flex items-center gap-2 py-2 px-3 rounded-md hover:bg-[rgba(255,255,255,0.1)] focus:outline-none'
									>
										<span className='text-sm font-medium'>{user.name}</span>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-8 w-8'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
											strokeWidth={2}
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
									</button>

									{isProfileOpen && (
										<div className='absolute right-0 mt-2 w-48 bg-[var(--color-surface)] rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5'>
											<NavLink
												to='/profile'
												className='block px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)]'
												onClick={closeAllMenus}
											>
												Thông tin tài khoản
											</NavLink>
											{isAdmin && (
												<NavLink
													to='/admin' // Dẫn đến trang mặc định của admin panel
													onClick={closeAllMenus}
													className='block px-4 py-2 text-sm font-semibold text-[var(--color-text-link)] hover:bg-[var(--color-background)]'
												>
													Admin Panel
												</NavLink>
											)}
											<button
												onClick={() => setIsLogoutModalOpen(true)}
												className='block w-full text-left px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-background)]'
											>
												Đăng Xuất
											</button>
										</div>
									)}
								</div>
							) : (
								<NavLink
									to='/auth'
									onClick={() => setIsMenuOpen(false)}
									aria-label='Đăng Nhập'
								>
									<svg
										xmlns='http://www.w3.org/2000/svg'
										className='h-8 w-8 hover:opacity-80'
										fill='none'
										viewBox='0 0 24 24'
										stroke='currentColor'
										strokeWidth={2}
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
										/>
									</svg>
								</NavLink>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* --- BƯỚC 4: THÊM MODAL VÀO GIAO DIỆN --- */}
			<Modal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				title='Xác nhận Đăng xuất'
				maxWidth='max-w-sm'
			>
				<div>
					<p className='text-[var(--color-text-secondary)]'>
						Bạn có chắc chắn muốn kết thúc phiên làm việc này không?
					</p>
					<div className='flex justify-end gap-4 mt-6'>
						<Button variant='ghost' onClick={() => setIsLogoutModalOpen(false)}>
							Hủy
						</Button>
						<Button variant='danger' onClick={confirmLogout}>
							Đăng xuất
						</Button>
					</div>
				</div>
			</Modal>
		</>
	);
}

export default Navbar;
