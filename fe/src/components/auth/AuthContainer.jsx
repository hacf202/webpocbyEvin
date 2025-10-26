import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

const AuthContainer = ({ onClose }) => {
	// isLoginView: true => Hiển thị Đăng nhập; false => Hiển thị Đăng ký
	const [isLoginView, setIsLoginView] = useState(true);
	const navigate = useNavigate();

	const handleLoginSuccess = () => {
		// Xử lý sau khi đăng nhập thành công: đóng container và điều hướng
		if (onClose) onClose();
		navigate("/builds");
	};

	const handleRegisterSuccessAndClose = () => {
		// Xử lý sau khi đăng ký VÀ xác minh OTP thành công
		if (onClose) onClose();
		// Nếu không đóng, có thể chuyển về màn hình đăng nhập
		// setIsLoginView(true);
	};

	const switchToRegister = () => setIsLoginView(false);
	const switchToLogin = () => setIsLoginView(true);

	return (
		<div className='auth-container flex justify-center items-center min-h-screen'>
			<div className='w-full max-w-md'>
				{isLoginView ? (
					<Login
						onSwitchToRegister={switchToRegister}
						onSuccess={handleLoginSuccess}
					/>
				) : (
					<Register
						onSwitchToLogin={switchToLogin}
						onClose={handleRegisterSuccessAndClose}
					/>
				)}
			</div>
		</div>
	);
};

export default AuthContainer;
