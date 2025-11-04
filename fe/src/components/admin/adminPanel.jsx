// src/pages/admin/AdminPanel.jsx (ĐÃ THIẾT KẾ LẠI & RESPONSIVE)
import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
	BookOpen,
	ShieldCheck,
	ArrowLeft,
	LayoutDashboard,
	Sparkles,
	Gem,
	Package,
	Library,
	Users,
	Menu, // Icon Hamburger
	X, // Icon Đóng
	Bell, // Icon Chuông
} from "lucide-react"; // Đã đổi sang Lucide icons

// === Component Thẻ Thống Kê (Stat Card) ===
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
	<div className='bg-surface-bg border border-border rounded-lg p-5 flex items-center gap-4 shadow-sm hover:shadow-md hover:border-primary-500 transition-all duration-200'>
		<div
			className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${colorClass} bg-opacity-10`}
		>
			<Icon className={`w-6 h-6 ${colorClass}`} />
		</div>
		<div>
			<p className='text-sm font-medium text-text-secondary'>{title}</p>
			<p className='text-2xl font-bold text-text-primary'>{value}</p>
		</div>
	</div>
);

// === Component AdminPanel Chính ===
const AdminPanel = () => {
	// State để quản lý việc mở/đóng Sidebar trên di động
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	// Class dùng chung cho các link trong Sidebar
	const navLinkClass = ({ isActive }) =>
		`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
			isActive
				? "bg-primary-500 text-white shadow-md"
				: "text-text-secondary hover:bg-surface-hover hover:text-text-primary"
		}`;

	// Class dùng chung cho các nút "Tác vụ nhanh"
	const quickActionClass =
		"group flex items-center gap-3 px-6 py-4 bg-btn-primary-bg text-btn-primary-text font-semibold rounded-xl shadow-md hover:bg-btn-primary-hover-bg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg";

	// Dữ liệu giả (bạn sẽ fetch từ API)
	const stats = {
		champions: 170,
		builds: 45,
		relics: 89,
		users: 128,
	};

	return (
		<div className='flex h-screen bg-page-bg font-secondary'>
			{/* === LỚP PHỦ OVERLAY (CHO DI ĐỘNG) === */}
			{isSidebarOpen && (
				<div
					className='fixed inset-0 z-30 bg-black/50 xl:hidden'
					onClick={() => setIsSidebarOpen(false)}
				></div>
			)}

			{/* === SIDEBAR (RESPONSIVE) === */}
			<aside
				className={`fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0 bg-surface-bg border-r border-border flex flex-col shadow-lg
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        xl:relative xl:translate-x-0 xl:shadow-sm`} // Luôn hiển thị trên desktop
			>
				{/* Header của Sidebar */}
				<div className='flex items-center justify-between p-4 h-16 border-b border-border'>
					<Link
						to='/admin'
						className='text-2xl font-bold text-text-primary font-primary flex items-center gap-2'
					>
						<LayoutDashboard className='text-primary-500' />
						Admin
					</Link>
					{/* Nút đóng (chỉ hiển thị trên di động) */}
					<button
						onClick={() => setIsSidebarOpen(false)}
						className='p-2 rounded-lg text-text-secondary hover:bg-surface-hover xl:hidden'
					>
						<X size={20} />
					</button>
				</div>

				{/* Các link điều hướng */}
				<nav className='flex-grow p-4 space-y-1 overflow-y-auto'>
					<NavLink to='/admin/championEditor' className={navLinkClass}>
						<BookOpen className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Tướng</span>
					</NavLink>
					<NavLink to='/admin/powerEditor' className={navLinkClass}>
						<Sparkles className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Sức Mạnh</span>
					</NavLink>
					<NavLink to='/admin/relicEditor' className={navLinkClass}>
						<ShieldCheck className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Cổ Vật</span>
					</NavLink>
					<NavLink to='/admin/itemEditor' className={navLinkClass}>
						<Package className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Vật Phẩm</span>
					</NavLink>
					<NavLink to='/admin/runeEditor' className={navLinkClass}>
						<Gem className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Ngọc</span>
					</NavLink>
					<NavLink to='/admin/buildEditor' className={navLinkClass}>
						<Library className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Bộ Cổ Vật</span>
					</NavLink>
				</nav>

				{/* Footer của Sidebar */}
				<div className='p-4 border-t border-border bg-page-bg'>
					<p className='text-xs text-center text-text-secondary'>
						© 2025 Your App Name
					</p>
				</div>
			</aside>

			{/* === MAIN CONTENT WRAPPER === */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				{/* === TOPBAR (CHO RESPONSIVE) === */}
				<header className='flex items-center justify-between h-16 bg-surface-bg border-b border-border px-6 flex-shrink-0 sticky top-0 z-20'>
					{/* Nút Hamburger (chỉ hiển thị trên di động) */}
					<button
						onClick={() => setIsSidebarOpen(true)}
						className='p-2 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary xl:hidden'
					>
						<Menu size={20} />
					</button>

					{/* Khoảng trống để đẩy các icon bên phải */}
					<div className='flex-1'></div>

					{/* Actions bên phải (Thông báo, User) */}
					<div className='flex items-center gap-4'>
						<button className='p-2 rounded-full text-text-secondary hover:bg-surface-hover hover:text-text-primary'>
							<Bell size={20} />
						</button>
						<div className='relative'>
							<button className='flex items-center gap-2'>
								<img
									src='https://via.placeholder.com/40' // Thay bằng avatar user
									alt='User Avatar'
									className='w-8 h-8 rounded-full border-2 border-border'
								/>
							</button>
						</div>
					</div>
				</header>

				{/* === MAIN CONTENT (ĐÃ THIẾT KẾ LẠI) === */}
				<main className='flex-1 p-6 lg:p-10 overflow-auto'>
					<h1 className='text-4xl font-bold text-text-primary font-primary mb-2'>
						Chào mừng, Admin!
					</h1>
					<p className='text-lg text-text-secondary mb-8 leading-relaxed'>
						Đây là tổng quan nhanh về trạng thái hệ thống của bạn.
					</p>

					{/* === 1. Khu vực Thống kê (Tiện dụng hơn) === */}
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
						<StatCard
							title='Tổng số Tướng'
							value={stats.champions}
							icon={BookOpen}
							colorClass='text-primary-500' // Xanh-Tím
						/>
						<StatCard
							title='Tổng số Builds'
							value={stats.builds}
							icon={Library}
							colorClass='text-success' // Xanh lá
						/>
						<StatCard
							title='Tổng số Cổ vật'
							value={stats.relics}
							icon={ShieldCheck}
							colorClass='text-icon-star' // Vàng
						/>
						<StatCard
							title='Người dùng'
							value={stats.users}
							icon={Users}
							colorClass='text-danger-500' // Đỏ
						/>
					</div>

					{/* === 2. Khu vực Tác vụ nhanh (Bố cục đẹp hơn) === */}
					<div className='mt-12'>
						<h3 className='text-xl font-semibold text-text-primary mb-6 font-primary'>
							Các tác vụ nhanh:
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							<NavLink to='/admin/championEditor' className={quickActionClass}>
								<BookOpen className='h-6 w-6 flex-shrink-0' />
								<span>Chỉnh sửa Tướng</span>
							</NavLink>
							<NavLink to='/admin/buildEditor' className={quickActionClass}>
								<Library className='h-6 w-6 flex-shrink-0' />
								<span>Chỉnh sửa Builds</span>
							</NavLink>
							{/* Nút Quay về trang chủ (Style "Outline") */}
							<NavLink
								to='/'
								className='group flex items-center justify-center gap-3 px-6 py-4 bg-surface-bg text-text-primary font-semibold rounded-xl border border-border hover:bg-surface-hover hover:border-primary-500 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md'
							>
								<ArrowLeft className='h-6 w-6 flex-shrink-0' />
								<span>Về trang chủ</span>
							</NavLink>
						</div>
					</div>
				</main>
			</div>
		</div>
	);
};

export default AdminPanel;
