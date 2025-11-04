// src/components/layout/Navbar.jsx (ĐÃ THAY BẰNG LOGO)

import React, { useContext, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

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
	Wrench,
	ScrollText,
	Landmark,
	Zap,
	Gem,
	Dices,
} from "lucide-react";

// Import logo (đảm bảo file tồn tại trong thư mục public hoặc assets)
import logo from "./icon/Yuumi.png"; // Đường dẫn đến logo
import championIcon from "./icon/champion.png";
import itemIcon from "./icon/item.png";
import listIcon from "./icon/list.png";
import relicIcon from "./icon/relic.png";
import powerIcon from "./icon/power.png";
import reliclistIcon from "./icon/reliclist.png";
import runeIcon from "./icon/rune.png";
import wheelIcon from "./icon/wheel.png";

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
		`flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-nav-hover-bg hover:scale-105 text-nav-link-text ${
			isActive ? "bg-nav-active-bg font-bold" : ""
		}`;

	const dropdownLinkClass =
		"flex items-center gap-2 px-4 py-2 text-sm text-dropdown-item-text hover:bg-dropdown-item-hover-bg transition-colors";

	return (
		<>
			<header className='bg-header-bg text-header-text p-4 shadow-xl sticky top-0 z-50 transition-all duration-300 font-secondary'>
				<div className='container mx-auto flex justify-between items-center'>
					{/* LOGO - Thay thế bằng hình ảnh */}
					<NavLink
						to='/'
						className='flex items-center group'
						onClick={closeAllMenus}
					>
						<img
							src={logo}
							alt='Web POC Logo'
							className='h-10 w-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-110'
						/>
						<span className='ml-2 text-header-text font-primary text-3xl'>
							GUIDE POC
						</span>
					</NavLink>

					{/* Hamburger Button */}
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
						} xl:flex xl:items-center xl:gap-1 absolute xl:static top-16 left-0 w-full xl:w-auto bg-header-bg xl:bg-transparent z-40 shadow-lg xl:shadow-none transition-all duration-300`}
					>
						<nav className='flex flex-col xl:flex-row xl:items-center p-4 xl:p-0 gap-2 xl:gap-1'>
							{/* Danh sách tướng */}
							<NavLink
								to='/champions'
								className={navLinkClass}
								onClick={closeAllMenus}
							>
								<img
									src={championIcon}
									alt='Champion'
									className='w-8 h-8 object-contain'
									style={{ filter: "invert(1) brightness(2)" }}
								/>
								Danh sách tướng
							</NavLink>

							{/* Bộ cổ vật */}
							<NavLink
								to='/builds'
								className={navLinkClass}
								onClick={closeAllMenus}
							>
								<img
									src={reliclistIcon}
									alt='Bộ cổ vật'
									className='w-8 h-8 object-contain'
									style={{ filter: "invert(1) brightness(2)" }}
								/>
								Bộ cổ vật
							</NavLink>

							{/* Dropdown: Trang bị */}
							<div className='relative' ref={itemsDropdownRef}>
								<button
									onClick={() => setIsItemsDropdownOpen(!isItemsDropdownOpen)}
									className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-nav-hover-bg hover:scale-105 w-full xl:w-auto text-nav-link-text ${
										isItemsDropdownOpen ? "bg-nav-active-bg" : ""
									}`}
								>
									<img
										src={listIcon}
										alt='weapon'
										className='w-8 h-8 object-contain'
										style={{ filter: "invert(1) brightness(2)" }}
									/>
									Trang bị
									<svg
										className={`w-4 h-4 transition-transform duration-300 ${
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
									<div className='xl:absolute left-0 xl:mt-2 w-full xl:w-56 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2 animate-slide-down duration-200'>
										<NavLink
											to='/relics'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<img
												src={relicIcon}
												alt='relic'
												className='w-8 h-8 object-contain'
											/>
											Cổ Vật
										</NavLink>
										<NavLink
											to='/powers'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<img
												src={powerIcon}
												alt='power'
												className='w-8 h-8 object-contain'
											/>
											Sức Mạnh
										</NavLink>
										<NavLink
											to='/items'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<img
												src={itemIcon}
												alt='item'
												className='w-8 h-8 object-contain'
											/>
											Vật Phẩm
										</NavLink>
										<NavLink
											to='/runes'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<img
												src={runeIcon}
												alt='rune'
												className='w-8 h-8 object-contain'
											/>
											Ngọc
										</NavLink>
									</div>
								)}
							</div>

							{/* Dropdown: Công cụ */}
							<div className='relative' ref={toolsDropdownRef}>
								<button
									onClick={() => setIsToolsDropdownOpen(!isToolsDropdownOpen)}
									className={`flex items-center gap-2 py-2 px-4 rounded-lg transition-all duration-200 hover:bg-nav-hover-bg hover:scale-105 w-full xl:w-auto text-nav-link-text ${
										isToolsDropdownOpen ? "bg-nav-active-bg" : ""
									}`}
								>
									<Wrench className='w-8 h-8' />
									Công cụ
									<svg
										className={`w-4 h-4 transition-transform duration-300 ${
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
									<div className='xl:absolute left-0 xl:mt-2 w-full xl:w-48 bg-dropdown-bg border border-dropdown-border rounded-lg shadow-xl py-2 animate-slide-down duration-200'>
										<NavLink
											to='/randomizer'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<img
												src={wheelIcon}
												alt='wheel'
												className='w-8 h-8 object-contain'
											/>
											Vòng quay
										</NavLink>
										<NavLink
											to='/introduction'
											className={dropdownLinkClass}
											onClick={closeAllMenus}
										>
											<img
												src={wheelIcon}
												alt='introduction'
												className='w-8 h-8 object-contain'
											/>
											Giới thiệu
										</NavLink>
									</div>
								)}
							</div>
						</nav>

						{/* Auth Section */}
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
