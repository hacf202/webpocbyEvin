import React from "react";

/**
 * Component Button chung, hỗ trợ nhiều kiểu dáng và icon.
 *
 * @param {('primary'|'secondary'|'danger'|'warning'|'ghost'|'outline')} [variant='primary'] - Kiểu dáng của nút.
 * @param {string} [type='button'] - Loại của nút, mặc định là 'button' để tránh gửi form ngoài ý muốn.
 * @param {React.ReactNode} children - Nội dung văn bản của nút.
 * @param {React.ReactNode} [iconLeft] - Icon hiển thị bên trái văn bản.
 * @param {React.ReactNode} [iconRight] - Icon hiển thị bên phải văn bản.
 * @param {string} [className=''] - Các class Tailwind CSS bổ sung.
 * @param {boolean} [disabled=false] - Trạng thái vô hiệu hóa.
 * @param {...object} props - Các props khác của thẻ <button> (ví dụ: onClick).
 */
const Button = ({
	variant = "primary",
	type = "button",
	children,
	iconLeft,
	iconRight,
	className = "",
	disabled = false,
	...props
}) => {
	// --- STYLES ---
	const baseStyles =
		"inline-flex items-center justify-center px-4 py-2 rounded-md font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

	const getVariantStyles = variant => {
		switch (variant) {
			// Dành cho các hành động chính: Tạo, Cập nhật, Xác nhận, ...
			case "primary":
				return "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer focus:ring-[var(--color-primary)]";
			case "secondary":
				return "bg-[var(--color-surface-secondary)] text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] cursor-pointer focus:ring-[var(--color-text-secondary)]";
			// Dành cho hành động nguy hiểm: Xóa, Đăng xuất
			case "danger":
				return "bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)] cursor-pointer focus:ring-[var(--color-danger)]";
			// Dành cho hành động cảnh báo: Sửa
			case "warning":
				return "bg-[var(--color-warning)] text-white hover:brightness-90 cursor-pointer focus:ring-[var(--color-warning)]";
			// Dành cho hành động Hủy bỏ
			case "ghost":
				return "bg-transparent text-[var(--color-text-secondary)] hover:bg-black/5 cursor-pointer focus:ring-[var(--color-primary)]";
			// Một lựa chọn khác cho Hủy hoặc các nút ít quan trọng hơn
			case "outline":
				return "bg-transparent border border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-black/5 cursor-pointer focus:ring-[var(--color-primary)]";
			default:
				return "bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] cursor-pointer focus:ring-[var(--color-primary)]";
		}
	};

	const variantStyles = getVariantStyles(variant);

	return (
		<button
			type={type}
			className={`${baseStyles} ${variantStyles} ${className}`}
			disabled={disabled}
			{...props}
		>
			{iconLeft && <span className='mr-2'>{iconLeft}</span>}
			{children}
			{iconRight && <span className='ml-2'>{iconRight}</span>}
		</button>
	);
};

export default Button;
