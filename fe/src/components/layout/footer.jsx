// src/components/Footer.jsx
import { memo } from "react";

function Footer() {
	return (
		// Sử dụng các biến CSS cho footer
		<footer className='bg-[var(--color-footer-bg)] text-[var(--color-footer-text)] py-4 mt-10'>
			<div className='max-w-[1200px] mx-auto px-4 sm:px-6 text-center'>
				<p className='text-base sm:text-lg'>
					LoR Guide - Hướng dẫn chơi Legends of Runeterra
				</p>
				<p className='text-sm sm:text-base mt-2'>
					Đăng ký kênh Evin LoR tại:{" "}
					<a
						href='https://www.youtube.com/@Evin0126/'
						target='_blank'
						// Sử dụng biến màu cho link
						className='underline text-[var(--color-footer-link)] hover:opacity-80'
						rel='noopener noreferrer'
					>
						https://www.youtube.com/@Evin0126/
					</a>
				</p>
				<p className='text-sm mt-2 font-bold'>donate: MB 011220040126</p>
			</div>
		</footer>
	);
}

export default memo(Footer);
