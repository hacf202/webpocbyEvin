import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx";

import Modal from "../common/modal";
import Button from "../common/button";
import Logo from "../../../Yuumi.png";

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
	BookOpen,
	Wrench,
	Sparkles,
	LoaderPinwheel,
} from "lucide-react";

function Navbar() {
	const { user, logout, isAdmin } = useContext(AuthContext);
	const navigate = useNavigate();

	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
		setIsSidebarOpen(false);
		setIsProfileOpen(false);
		setIsItemsDropdownOpen(false);
		setIsToolsDropdownOpen(false);
	};

	// Đóng khi click ngoài
	useEffect(() => {
		const handleClickOutside = event => {
			const refs = [
				{ ref: profileMenuRef, setter: setIsProfileOpen },
				{ ref: itemsDropdownRef, setter: setIsItemsDropdownOpen },
				{ ref: toolsDropdownRef, setter: setIsToolsDropdownOpen },
			];

			refs.forEach(({ ref, setter }) => {
				if (ref.current && !ref.current.contains(event.target)) {
					setter(false);
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

	// Class cho dropdown con trong Sidebar
	const sidebarDropdownItem =
		"flex items-center gap-2 px-4 py-2 text-sm text-nav-link-text hover:bg-nav-hover-bg rounded-lg transition-colors w-full text-left";

	// Hàm đóng Sidebar + giữ dropdown
	const handleChildClick = () => {
		setIsSidebarOpen(false);
	};

	// Hàm đóng tất cả
	const handleMainClick = () => {
		closeAllMenus();
	};

	const handleMainNavClick = () => {
		closeAllMenus();
	};

	// Class riêng cho Sidebar mobile - KHÔNG scale, hitbox ổn định
	const sidebarNavLinkClass = ({ isActive }) =>
		`flex items-center gap-2 py-2 px-4 rounded-lg transition-colors duration-200 hover:bg-nav-hover-bg text-nav-link-text w-full text-left ${
			isActive ? "font-bold bg-nav-active-bg" : ""
		}`;

	return (
		<>
			{/* HEADER */}
			<header className='bg-header-bg text-header-text p-2 sm:p-4 shadow-xl sticky top-0 z-50 transition-all duration-300 font-secondary'>
				<div className='container mx-auto flex justify-between items-center'>
					{/* LOGO */}
					<NavLink
						to='/'
						className='flex items-center group'
						onClick={handleMainNavClick}
					>
						<img
							src={Logo}
							alt='Web POC Logo'
							className='h-8 sm:h-10 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-110'
						/>
						<span className='ml-2 text-header-text font-primary text-xl sm:text-3xl'>
							GUIDE POC
						</span>
					</NavLink>

					{/* Hamburger */}
					<button
						className='xl:hidden focus:outline-none p-2 rounded-lg hover:bg-nav-hover-bg transition-colors'
						onClick={() => setIsSidebarOpen(true)}
						aria-label='Mở menu'
					>
						<Menu className='w-6 h-6' />
					</button>

					{/* Desktop Nav */}
					<nav className='hidden xl:flex items-center gap-1'>
						<NavLink to='/champions' className={navLinkClass}>
							<Swords className='w-6 h-6' /> Tướng
						</NavLink>

						<div className='relative' ref={itemsDropdownRef}>
							<button
								onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
								className='flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-nav-hover-bg transition-all'
							>
								<Package className='w-6 h-6' /> Vật phẩm
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
								<div className='absolute left-0 mt-2 w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
									<NavLink
										to='/items'
										className={dropdownLinkClass}
										onClick={handleMainNavClick}
									>
										<Package className='w-5 h-5' /> Vật phẩm
									</NavLink>
									<NavLink
										to='/relics'
										className={dropdownLinkClass}
										onClick={handleMainNavClick}
									>
										<Sparkles className='w-5 h-5' /> Cổ vật
									</NavLink>
									<NavLink
										to='/powers'
										className={dropdownLinkClass}
										onClick={handleMainNavClick}
									>
										<Zap className='w-5 h-5' /> Sức mạnh
									</NavLink>
									<NavLink
										to='/runes'
										className={dropdownLinkClass}
										onClick={handleMainNavClick}
									>
										<Gem className='w-5 h-5' /> Ngọc
									</NavLink>
								</div>
							)}
						</div>

						<NavLink to='/builds' className={navLinkClass}>
							<ScrollText className='w-6 h-6' /> Build
						</NavLink>

						<div className='relative' ref={toolsDropdownRef}>
							<button
								onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
								className='flex items-center gap-2 py-2 px-4 rounded-lg hover:bg-nav-hover-bg transition-all'
							>
								<Wrench className='w-6 h-6' /> Công cụ
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
								<div className='absolute left-0 mt-2 w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
									<NavLink
										to='/randomizer'
										className={dropdownLinkClass}
										onClick={handleMainNavClick}
									>
										<LoaderPinwheel className='w-5 h-5' /> Vòng quay
									</NavLink>
									<NavLink
										to='/introduction'
										className={dropdownLinkClass}
										onClick={handleMainNavClick}
									>
										<BookOpen className='w-5 h-5' /> Giới thiệu
									</NavLink>
								</div>
							)}
						</div>

						<div className='ml-4 flex items-center'>
							{user ? (
								<div className='relative' ref={profileMenuRef}>
									<button
										onClick={() => setIsProfileOpen(!isProfileOpen)}
										className='flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-nav-hover-bg transition-all hover:scale-105'
									>
										<span className='text-sm font-medium'>{user.name}</span>
										<User className='h-8 w-8' />
									</button>
									{isProfileOpen && (
										<div className='absolute right-0 mt-2 w-56 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2'>
											<NavLink
												to='/profile'
												className={dropdownLinkClass}
												onClick={handleMainNavClick}
											>
												<Settings className='w-4 h-4' /> Thông tin
											</NavLink>
											{isAdmin && (
												<NavLink
													to='/admin'
													className={`${dropdownLinkClass} font-semibold text-text-link-admin`}
													onClick={handleMainNavClick}
												>
													<Shield className='w-4 h-4' /> Admin Panel
												</NavLink>
											)}
											<button
												onClick={() => setIsLogoutModalOpen(true)}
												className={`${dropdownLinkClass} w-full text-left`}
											>
												<LogOut className='w-4 h-4' /> Đăng xuất
											</button>
										</div>
									)}
								</div>
							) : (
								<NavLink
									to='/auth'
									onClick={handleMainNavClick}
									className='flex items-center gap-2 py-2 px-4 rounded-lg bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg transition-all hover:scale-105'
								>
									<LogIn className='h-5 w-5' /> Đăng nhập
								</NavLink>
							)}
						</div>
					</nav>
				</div>
			</header>

			{/* SIDEBAR MOBILE */}
			<div
				className={`fixed inset-0 z-50 xl:hidden transition-opacity duration-300 ${
					isSidebarOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={() => setIsSidebarOpen(false)}
			>
				<div className='absolute inset-0 bg-black bg-opacity-50' />

				<div
					className={`absolute left-0 top-0 h-full w-64 sm:w-72 bg-header-bg shadow-2xl transform transition-transform duration-300 ${
						isSidebarOpen ? "translate-x-0" : "-translate-x-full"
					} overflow-y-auto`}
					onClick={e => e.stopPropagation()}
				>
					<div className='flex justify-between items-center p-4 border-b border-header-border'>
						<span className='text-xl font-bold text-header-text font-primary'>
							MENU
						</span>
						<button
							onClick={() => setIsSidebarOpen(false)}
							className='p-2 rounded-lg hover:bg-nav-hover-bg transition-colors text-header-text'
						>
							<X className='w-6 h-6' />
						</button>
					</div>

					<nav className='p-4 space-y-2'>
						{/* Tướng */}
						<NavLink
							to='/champions'
							className={sidebarNavLinkClass}
							onClick={handleMainClick}
						>
							<Swords className='w-6 h-6' /> Tướng
						</NavLink>

						{/* VẬT PHẨM - CHA */}
						<div ref={itemsDropdownRef}>
							<button
								onClick={() => setIsItemsDropdownOpen(prev => !prev)}
								className={`${sidebarNavLinkClass({
									isActive: false,
								})} !font-normal justify-between`}
							>
								<div className='flex items-center gap-2'>
									<Package className='w-6 h-6' /> Vật phẩm
								</div>
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
								<div className='pl-8 space-y-1 mt-1'>
									<NavLink
										to='/items'
										className={sidebarDropdownItem}
										onClick={handleChildClick}
									>
										<Package className='w-5 h-5' /> Vật phẩm
									</NavLink>
									<NavLink
										to='/relics'
										className={sidebarDropdownItem}
										onClick={handleChildClick}
									>
										<Sparkles className='w-5 h-5' /> Cổ vật
									</NavLink>
									<NavLink
										to='/powers'
										className={sidebarDropdownItem}
										onClick={handleChildClick}
									>
										<Zap className='w-5 h-5' /> Sức mạnh
									</NavLink>
									<NavLink
										to='/runes'
										className={sidebarDropdownItem}
										onClick={handleChildClick}
									>
										<Gem className='w-5 h-5' /> Ngọc
									</NavLink>
								</div>
							)}
						</div>

						{/* Build */}
						<NavLink
							to='/builds'
							className={sidebarNavLinkClass}
							onClick={handleMainClick}
						>
							<ScrollText className='w-6 h-6' /> Build
						</NavLink>

						{/* CÔNG CỤ - CHA */}
						<div ref={toolsDropdownRef}>
							<button
								onClick={() => setIsToolsDropdownOpen(prev => !prev)}
								className={`${sidebarNavLinkClass({
									isActive: false,
								})} !font-normal justify-between`}
							>
								<div className='flex items-center gap-2'>
									<Wrench className='w-6 h-6' /> Công cụ
								</div>
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
								<div className='pl-8 space-y-1 mt-1'>
									<NavLink
										to='/randomizer'
										className={sidebarDropdownItem}
										onClick={handleChildClick}
									>
										<LoaderPinwheel className='w-5 h-5' /> Vòng quay
									</NavLink>
									<NavLink
										to='/introduction'
										className={sidebarDropdownItem}
										onClick={handleChildClick}
									>
										<BookOpen className='w-5 h-5' /> Giới thiệu
									</NavLink>
								</div>
							)}
						</div>

						{/* Auth */}
						<div className='border-t border-header-border pt-4 mt-4 space-y-1'>
							{user ? (
								<>
									<div className='flex items-center gap-2 px-4 py-2 text-header-text text-sm font-medium'>
										<User className='h-6 w-6' />
										<span>{user.name}</span>
									</div>
									<NavLink
										to='/profile'
										className={sidebarNavLinkClass}
										onClick={handleMainClick}
									>
										<Settings className='w-5 h-5' /> Thông tin
									</NavLink>
									{isAdmin && (
										<NavLink
											to='/admin'
											className={sidebarNavLinkClass}
											onClick={handleMainClick}
										>
											<Shield className='w-5 h-5' /> Admin Panel
										</NavLink>
									)}
									<button
										onClick={() => {
											setIsLogoutModalOpen(true);
											setIsSidebarOpen(false);
										}}
										className={`${sidebarNavLinkClass({
											isActive: false,
										})} !justify-start`}
									>
										<LogOut className='w-5 h-5' /> Đăng xuất
									</button>
								</>
							) : (
								<NavLink
									to='/auth'
									onClick={handleMainClick}
									className='flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-btn-primary-bg text-btn-primary-text hover:bg-btn-primary-hover-bg transition-colors w-full'
								>
									<LogIn className='h-5 w-5' /> Đăng nhập
								</NavLink>
							)}
						</div>
					</nav>
				</div>
			</div>

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
