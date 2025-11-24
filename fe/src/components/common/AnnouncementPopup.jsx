// src/components/common/AnnouncementPopup.jsx
import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import Button from "./button";
import Logo from "/ahriicon.png";

const ANNOUNCEMENT_KEY = "pocguide_announcement_2025";
const ANNOUNCEMENT_TEXT = "Tên miền chính thức: pocguide.top";

const AnnouncementPopup = () => {
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		// Kiểm tra nếu đã xem rồi thì không hiện
		const hasSeen = localStorage.getItem(ANNOUNCEMENT_KEY);
		if (!hasSeen) {
			const timer = setTimeout(() => {
				setIsOpen(true);
				localStorage.setItem(ANNOUNCEMENT_KEY, "true");
			}, 0); // Hiển thị sau 1.5s khi vào trang

			return () => clearTimeout(timer);
		}
	}, []);

	const handleClose = () => {
		setIsOpen(false);
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn'>
			<div className='relative max-w-md w-full bg-surface-bg rounded-xl shadow-2xl border border-primary-500/30 p-6 animate-slideUp'>
				{/* Nút đóng */}
				<button
					onClick={handleClose}
					className='absolute top-3 right-3 text-text-secondary hover:text-text-primary transition-colors'
				>
					<X size={20} />
				</button>

				{/* Icon */}
				<div className='flex justify-center mb-4'>
					<div className='p-3 bg-primary-500/10 rounded-full'>
						<img src={Logo} alt='LOGO' className='w-8 h-8 text-primary-500' />
					</div>
				</div>

				{/* Nội dung */}
				<h3 className='text-xl font-bold text-center text-text-primary mb-2'>
					Thông Báo Quan Trọng
				</h3>
				<p className='text-center text-text-secondary mb-6 leading-relaxed'>
					<strong className='text-primary-500'>{ANNOUNCEMENT_TEXT}</strong>
				</p>

				{/* Nút */}
				<div className='flex justify-center'>
					<Button
						onClick={handleClose}
						className='bg-primary-500 hover:bg-primary-600 text-white font-medium px-6'
					>
						Đã hiểu
					</Button>
				</div>
			</div>
		</div>
	);
};

export default AnnouncementPopup;
