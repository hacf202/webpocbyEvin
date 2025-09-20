import React, { useContext, useState } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
	const { user, logout } = useContext(AuthContext);
	const [isOpen, setIsOpen] = useState(false);

	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	return (
		<header className='bg-gray-700 text-white p-4 shadow-xl'>
			<div className='container mx-auto flex justify-between items-center'>
				<NavLink to='/champions' className='text-2xl font-bold'>
					Web POC
				</NavLink>

				<button
					className='xl:hidden focus:outline-none'
					onClick={toggleMenu}
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
							d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
						/>
					</svg>
				</button>
				<div
					className={`${
						isOpen ? "block" : "hidden"
					} xl:flex xl:items-center xl:gap-4 absolute xl:static top-16 left-0 w-full xl:w-auto bg-gray-700 xl:bg-transparent z-10`}
				>
					<nav className='flex flex-col xl:flex-row xl:items-center p-4 xl:p-0'>
						<NavLink
							to='/champions'
							className={({ isActive }) =>
								`py-2 xl:py-0 xl:mr-4 hover:underline ${
									isActive ? "underline font-bold" : ""
								}`
							}
							onClick={() => setIsOpen(false)}
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
							onClick={() => setIsOpen(false)}
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
							onClick={() => setIsOpen(false)}
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
							onClick={() => setIsOpen(false)}
						>
							Vật Phẩm
						</NavLink>
						<NavLink
							to='/builds'
							className={({ isActive }) =>
								`py-2 xl:py-0 xl:mr-4 hover:underline ${
									isActive ? "underline font-bold" : ""
								}`
							}
							onClick={() => setIsOpen(false)}
						>
							Builds
						</NavLink>
						<NavLink
							to='/comments'
							className={({ isActive }) =>
								`py-2 xl:py-0 xl:mr-4 hover:underline ${
									isActive ? "underline font-bold" : ""
								}`
							}
							onClick={() => setIsOpen(false)}
						>
							Bình Luận
						</NavLink>
					</nav>
					{user ? (
						<div className='flex flex-col xl:flex-row xl:items-center gap-2 p-4 xl:p-0'>
							<span className='text-sm'>Xin chào, {user.username}</span>
							<button
								onClick={() => {
									logout();
									setIsOpen(false);
								}}
								className='bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700'
							>
								Đăng Xuất
							</button>
						</div>
					) : (
						<div className='flex flex-col xl:flex-row xl:items-center gap-2 p-4 xl:p-0'>
							<NavLink
								to='/login'
								className={({ isActive }) =>
									`py-2 xl:py-0 xl:mr-2 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsOpen(false)}
							>
								Đăng Nhập
							</NavLink>
							<NavLink
								to='/register'
								className={({ isActive }) =>
									`py-2 xl:py-0 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
								onClick={() => setIsOpen(false)}
							>
								Đăng Ký
							</NavLink>
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

export default Navbar;
