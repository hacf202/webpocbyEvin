import React from "react";

// Component này sẽ render một icon SVG dựa trên tên độ hiếm
const RarityIcon = ({ rarity, size = 16 }) => {
	const config = {
		THƯỜNG: {
			shape: "M 8 1 L 1 15 L 15 15 Z", // Tam giác
			color: "fill-green-500",
		},
		HIẾM: {
			shape: "M 8 1 L 15 8 L 8 15 L 1 8 Z", // Hình thoi
			color: "fill-blue-500",
		},
		"SỬ THI": {
			shape: "M 8 1 L 15.6 6.5 L 12.8 15 L 3.2 15 L 0.4 6.5 Z", // Ngũ giác
			color: "fill-purple-500",
		},
		"HUYỀN THOẠI": {
			shape: "M 12 1 L 4 1 L 0 8 L 4 15 L 12 15 L 16 8 Z", // Lục giác
			color: "fill-yellow-500",
		},
	};

	const icon = config[rarity] || {
		shape: "M 8 8 m -7, 0 a 7,7 0 1,0 14,0 a 7,7 0 1,0 -14,0", // Hình tròn mặc định
		color: "fill-gray-400",
	};

	return (
		<svg
			width={size}
			height={size}
			viewBox='0 0 16 16'
			xmlns='http://www.w3.org/2000/svg'
			className={icon.color}
		>
			<path d={icon.shape} />
		</svg>
	);
};

export default RarityIcon;
