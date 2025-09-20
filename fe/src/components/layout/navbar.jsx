import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
	const { user, logout } = useContext(AuthContext);

	return (
		<header className='bg-gray-700 text-white p-4 shadow-md'>
			<div className='container mx-auto flex justify-between items-center'>
				<NavLink to='/champions' className='text-2xl font-bold'>
					Web POC
				</NavLink>
				<div className='flex items-center gap-4'>
					<nav>
						<NavLink
							to='/champions'
							className={({ isActive }) =>
								`mr-4 hover:underline ${isActive ? "underline font-bold" : ""}`
							}
						>
							Tướng
						</NavLink>
						<NavLink
							to='/relics'
							className={({ isActive }) =>
								`mr-4 hover:underline ${isActive ? "underline font-bold" : ""}`
							}
						>
							Cổ Vật
						</NavLink>
						<NavLink
							to='/powers'
							className={({ isActive }) =>
								`mr-4 hover:underline ${isActive ? "underline font-bold" : ""}`
							}
						>
							Sức Mạnh
						</NavLink>
						<NavLink
							to='/items'
							className={({ isActive }) =>
								`mr-4 hover:underline ${isActive ? "underline font-bold" : ""}`
							}
						>
							Vật Phẩm
						</NavLink>
						<NavLink
							to='/builds'
							className={({ isActive }) =>
								`mr-4 hover:underline ${isActive ? "underline font-bold" : ""}`
							}
						>
							Builds
						</NavLink>
						<NavLink
							to='/comments'
							className={({ isActive }) =>
								`mr-4 hover:underline ${isActive ? "underline font-bold" : ""}`
							}
						>
							Bình Luận
						</NavLink>
					</nav>
					{user ? (
						<div className='flex items-center gap-2'>
							<span className='text-sm'>Xin chào, {user.username}</span>
							<button
								onClick={logout}
								className='bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700'
							>
								Đăng Xuất
							</button>
						</div>
					) : (
						<div className='flex items-center gap-2'>
							<NavLink
								to='/login'
								className={({ isActive }) =>
									`mr-2 hover:underline ${
										isActive ? "underline font-bold" : ""
									}`
								}
							>
								Đăng Nhập
							</NavLink>
							<NavLink
								to='/register'
								className={({ isActive }) =>
									`hover:underline ${isActive ? "underline font-bold" : ""}`
								}
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
