import { memo } from "react";

function Footer() {
	return (
		<footer className='bg-gray-800 text-white py-4 mt-10'>
			<div className='max-w-[1200px] mx-auto px-4 sm:px-6 text-center'>
				<p className='text-base sm:text-lg'>
					LoR Guide - Hướng dẫn chơi Legends of Runeterra
				</p>
				<p className='text-sm sm:text-base mt-2'>
					Đăng ký kênh Evin LoR tại:{" "}
					<a
						href='https://www.youtube.com/@Evin0126/'
						target='_blank'
						className='underline text-blue-400 hover:text-blue-300'
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
