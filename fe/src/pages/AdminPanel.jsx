// AdminPanel.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import {
	BookOpenIcon,
	ShieldCheckIcon,
	ArrowLeftIcon,
} from "@heroicons/react/24/outline";

const AdminPanel = () => {
	return (
		<div className='flex min-h-[85vh] bg-[var(--color-background)]'>
			{/* === SIDEBAR === */}
			<aside className='w-64 flex-shrink-0 bg-[var(--color-surface)] border-r border-[var(--color-border)] flex flex-col shadow-sm'>
				<div className='p-6 border-b border-[var(--color-border)]'>
					<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-1'>
						Admin Panel
					</h2>
					<p className='text-sm text-[var(--color-text-secondary)]'>
						Bảng điều khiển
					</p>
				</div>
				<nav className='flex-grow p-4 space-y-1 overflow-y-auto'>
					<NavLink
						to='/admin/championEditor'
						className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
							${
								isActive
									? "bg-[var(--color-primary)] text-white shadow-md"
									: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
							}`
						}
					>
						<BookOpenIcon className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Tướng</span>
					</NavLink>
					<NavLink
						to='/admin/powerEditor'
						className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
							${
								isActive
									? "bg-[var(--color-primary)] text-white shadow-md"
									: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
							}`
						}
					>
						<ShieldCheckIcon className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Sức Mạnh</span>
					</NavLink>
					<NavLink
						to='/admin/relicEditor'
						className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
							${
								isActive
									? "bg-[var(--color-primary)] text-white shadow-md"
									: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
							}`
						}
					>
						<BookOpenIcon className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Cổ Vật</span>
					</NavLink>
					<NavLink
						to='/admin/itemEditor'
						className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
							${
								isActive
									? "bg-[var(--color-primary)] text-white shadow-md"
									: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
							}`
						}
					>
						<ShieldCheckIcon className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Vật Phẩm</span>
					</NavLink>
					<NavLink
						to='/admin/runeEditor'
						className={({ isActive }) =>
							`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
							${
								isActive
									? "bg-[var(--color-primary)] text-white shadow-md"
									: "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text-primary)]"
							}`
						}
					>
						<BookOpenIcon className='h-5 w-5 flex-shrink-0' />
						<span>Quản lý Ngọc</span>
					</NavLink>
				</nav>
				<div className='p-4 border-t border-[var(--color-border)] bg-[var(--color-background)]'>
					<p className='text-xs text-center text-[var(--color-text-secondary)]'>
						© 2025 Your App Name
					</p>
				</div>
			</aside>

			{/* === MAIN CONTENT === */}
			<main className='flex-1 p-6 lg:p-10 overflow-auto'>
				<div className='bg-[var(--color-surface)] p-8 rounded-xl shadow-lg border border-[var(--color-border)]'>
					<h1 className='text-4xl font-bold text-[var(--color-text-primary)] mb-4'>
						Chào mừng đến với Trang Quản trị
					</h1>
					<p className='text-lg text-[var(--color-text-secondary)] mb-8 max-w-2xl leading-relaxed'>
						Đây là trung tâm điều khiển của bạn. Vui lòng chọn một mục từ thanh
						điều hướng bên trái để bắt đầu quản lý nội dung một cách dễ dàng.
					</p>
					<div className='border-t border-[var(--color-border)] pt-8'>
						<h3 className='text-xl font-semibold text-[var(--color-text-primary)] mb-6'>
							Các tác vụ nhanh:
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
							<NavLink
								to='/admin/championEditor'
								className='group flex items-center gap-3 px-6 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg'
							>
								<BookOpenIcon className='h-6 w-6 flex-shrink-0 group-hover:scale-110 transition-transform' />
								<span>Chỉnh sửa Tướng</span>
							</NavLink>
							<NavLink
								to='/admin/powerEditor'
								className='group flex items-center gap-3 px-6 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg'
							>
								<ShieldCheckIcon className='h-6 w-6 flex-shrink-0 group-hover:scale-110 transition-transform' />
								<span>Chỉnh sửa Sức Mạnh</span>
							</NavLink>
							<NavLink
								to='/admin/relicEditor'
								className='group flex items-center gap-3 px-6 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg'
							>
								<BookOpenIcon className='h-6 w-6 flex-shrink-0 group-hover:scale-110 transition-transform' />
								<span>Chỉnh sửa Cổ Vật</span>
							</NavLink>
							<NavLink
								to='/admin/itemEditor'
								className='group flex items-center gap-3 px-6 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg'
							>
								<ShieldCheckIcon className='h-6 w-6 flex-shrink-0 group-hover:scale-110 transition-transform' />
								<span>Chỉnh sửa Vật Phẩm</span>
							</NavLink>
							<NavLink
								to='/admin/runeEditor'
								className='group flex items-center gap-3 px-6 py-4 bg-[var(--color-primary)] text-white font-semibold rounded-xl shadow-md hover:bg-[var(--color-primary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-lg'
							>
								<BookOpenIcon className='h-6 w-6 flex-shrink-0 group-hover:scale-110 transition-transform' />
								<span>Chỉnh sửa Ngọc</span>
							</NavLink>
							<NavLink
								to='/'
								className='group flex items-center gap-3 px-6 py-4 bg-[var(--color-surface)] text-[var(--color-text-primary)] font-semibold rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-background)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 transition-all duration-200 transform hover:scale-105 hover:shadow-md'
							>
								<ArrowLeftIcon className='h-6 w-6 flex-shrink-0 group-hover:scale-110 transition-transform' />
								<span>Về trang chủ</span>
							</NavLink>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
};

export default AdminPanel;
