import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

import Modal from "../common/modal";
import Button from "../common/button";

import {
	Menu,
	X,
	User,
	LogIn,
	LogOut,
	Settings,
	Shield,
	Swords,
	Package,
	ScrollText,
	Gem,
	Zap,
	Dices,
	BookOpen,
	Wrench,
	Sparkles,
	LoaderPinwheel,
} from "lucide-react";

function Navbar() {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const navigate = useNavigate();

	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [isProfileOpen, setIsProfileOpen] = useState(false);
	const [isItemsDropdownOpen, setIsItemsDropdownOpen] = useState(false);
	const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);

	const profileMenuRef = useRef(null);
	const itemsDropdownRef = useRef(null);
	const toolsDropdownRef = useRef(null);

	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

	const confirmLogout = () => {
		logout();
		setIsLogoutModalOpen(false);
		closeAllMenus();
		navigate("/");
	};

	const closeAllMenus = () => {
		setIsMenuOpen(false);
		setIsProfileOpen(false);
		setIsItemsDropdownOpen(false);
		setIsToolsDropdownOpen(false);
	};

	useEffect(() => {
		const handleClickOutside = event => {
			[profileMenuRef, itemsDropdownRef, toolsDropdownRef].forEach(ref => {
				if (ref.current && !ref.current.contains(event.target)) {
					if (ref === profileMenuRef) setIsProfileOpen(false);
					if (ref === itemsDropdownRef) setIsItemsDropdownOpen(false);
					if (ref === toolsDropdownRef) setIsToolsDropdownOpen(false);
				}
			});
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const navLinkClass = ({ isActive }) =>
		`flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-nav-hover-bg hover:scale-105 text-nav-link-text relative ${
			isActive
				? "font-bold underline-active-center active"
				: "underline-active-center"
		}`;

	const dropdownLinkClass =
		"flex items-center gap-2 px-4 py-2 text-sm text-dropdown-item-text hover:bg-dropdown-item-hover-bg transition-colors";

	return (
		<>
			<header className='bg-header-bg text-header-text p-4 shadow-xl sticky top-0 z-50 transition-all duration-300 font-secondary'>
				<div className='container mx-auto flex justify-between items-center'>
					{/* LOGO - GIỮ PNG */}
					<NavLink
						to='/'
						className='flex items-center group'
						onClick={closeAllMenus}
					>
						<img
							src='./Yuumi.png'
							alt='Web POC Logo'
							className='h-10 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-110'
						/>
						<span className='ml-2 text-header-text font-primary text-3xl'>
							GUIDE POC
						</span>
					</NavLink>

					{/* Hamburger */}
					<button
						className='xl:hidden focus:outline-none p-2 rounded-lg hover:bg-nav-hover-bg transition-colors'
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						aria-label='Toggle menu'
					>
						{isMenuOpen ? (
							<X className='w-6 h-6' />
						) : (
							<Menu className='w-6 h-6' />
						)}
					</button>

					{/* Navigation */}
					<div
						className={`${
							isMenuOpen ? "block" : "hidden"
						} xl:flex xl:items-center xl:gap-1 ...`}
					>
						<nav className='flex flex-col xl:flex-row gap-2 p-4 xl:p-0'>
							{/* CHAMPION */}
							<NavLink
								to='/champions'
								className={navLinkClass}
								onClick={closeAllMenus}
							>
								<Swords className='w-6 h-6' />
								Tướng
							</NavLink>

							{/* ITEMS DROPDOWN */}
							<div className='relative' ref={itemsDropdownRef}>
								<button
									onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
									className='flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-nav-hover-bg transition-all'
								>
									<Package className='w-6 h-6' />
									Vật phẩm
									<svg
										className={`w-4 h-4 transition-transform ${
											isItemsDropdownOpen ? "rotate-180" : ""
										}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</button>

								{isItemsDropdownOpen && (
									<div className='xl:absolute left-0 xl:mt-2 w-full xl:w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2 animate-slide-down'>
										<NavLink
											to='/items'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<Package className='w-5 h-5' />
											Vật phẩm
										</NavLink>
										<NavLink
											to='/relics'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<Sparkles className='w-5 h-5' />
											Cổ vật
										</NavLink>
										<NavLink
											to='/powers'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<Zap className='w-5 h-5' />
											Sức mạnh
										</NavLink>
										<NavLink
											to='/runes'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<Gem className='w-5 h-5' />
											Ngọc
										</NavLink>
									</div>
								)}
							</div>

							{/* BUILD */}
							<NavLink
								to='/builds'
								className={navLinkClass}
								onClick={closeAllMenus}
							>
								<ScrollText className='w-6 h-6' />
								Build
							</NavLink>

							{/* TOOLS DROPDOWN */}
							<div className='relative' ref={toolsDropdownRef}>
								<button
									onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
									className='flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-nav-hover-bg transition-all'
								>
									<Wrench className='w-6 h-6' />
									Công cụ
									<svg
										className={`w-4 h-4 transition-transform ${
											isToolsDropdownOpen ? "rotate-180" : ""
										}`}
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M19 9l-7 7-7-7'
										/>
									</svg>
								</button>

								{isToolsDropdownOpen && (
									<div className='xl:absolute left-0 xl:mt-2 w-full xl:w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2 animate-slide-down'>
										<NavLink
											to='/randomizer'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<LoaderPinwheel className='w-5 h-5' />
											Vòng quay
										</NavLink>
										<NavLink
											to='/introduction'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<BookOpen className='w-5 h-5' />
											Giới thiệu
										</NavLink>
									</div>
								)}
							</div>
						</nav>

						{/* Auth */}
						<div className='flex items-center gap-4 p-4 xl:p-0 border-t xl:border-none border-header-border'>
							{user ? (
								<div className='relative' ref={profileMenuRef}>
									<button
										onClick={() => setIsProfileOpen(!isProfileOpen)}
										className='flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-nav-hover-bg focus:outline-none transition-all duration-200 hover:scale-105'
									>
										<span className='text-sm font-medium text-nav-link-text'>
											{user.name}
										</span>
										<User className='h-8 w-8' />
									</button>

									{isProfileOpen && (
										<div className='absolute right-0 mt-2 w-56 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2 ring-1 ring-black ring-opacity-5 animate-slide-down duration-200'>
											<NavLink
												to='/profile'
												className={dropdownLinkClass}
												onClick={closeAllMenus}
											>
												<Settings className='w-4 h-4' />
												Thông tin tài khoản
											</NavLink>
											{isAdmin && (
												<NavLink
													to='/admin'
													onClick={closeAllMenus}
													className={`${dropdownLinkClass} font-semibold text-text-link-admin`}
												>
													<Shield className='w-4 h-4' />
													Admin Panel
												</NavLink>
											)}
											<button
												onClick={() => setIsLogoutModalOpen(true)}
												className={`${dropdownLinkClass} w-full`}
											>
												<LogOut className='w-4 h-4' />
												Đăng Xuất
											</button>
										</div>
									)}
								</div>
							) : (
								<NavLink
									to='/auth'
									onClick={closeAllMenus}
									className='flex items-center gap-2 py-2 px-4 rounded-lg bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg transition-all duration-200 hover:scale-105'
								>
									<LogIn className='h-5 w-5' />
									Đăng Nhập
								</NavLink>
							)}
						</div>
					</div>
				</div>
			</header>

			{/* Modal Đăng xuất */}
			<Modal
				isOpen={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				title='Xác nhận Đăng xuất'
				maxWidth='max-w-sm'
			>
				<div>
					<p className='text-text-secondary flex items-center gap-2'>
						<LogOut className='w-5 h-5 text-red-500' />
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
