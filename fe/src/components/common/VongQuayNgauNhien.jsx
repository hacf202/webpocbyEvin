import React, { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";

const getRandomRotation = (min, max) => {
	return Math.floor(Math.random() * (max - min)) + min;
};

// Loại bỏ prop 'isSmallScreen' không cần thiết
const VongQuayNgauNhien = ({ title, items }) => {
	const canvasRef = useRef(null);
	// THÊM MỚI: Ref cho container của vòng quay để đo kích thước thực tế
	const wheelContainerRef = useRef(null);

	const [rotation, setRotation] = useState(() => getRandomRotation(0, 360));
	const [isSpinning, setIsSpinning] = useState(false);
	const [fontSize, setFontSize] = useState(10);
	// Đổi tên state để phản ánh đúng chức năng: lưu kích thước hiện tại của vòng quay
	const [currentSize, setCurrentSize] = useState(300);
	const [hasSpun, setHasSpun] = useState(false);

	const colors = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"];

	// LOGIC 1: Xoay Chậm Khi Tải Trang - Giữ nguyên
	useEffect(() => {
		let animationFrameId;
		const rotationSpeed = 0.05;
		const animateIdle = () => {
			if (!isSpinning && !hasSpun) {
				setRotation(prevRotation => (prevRotation + rotationSpeed) % 360000);
				animationFrameId = requestAnimationFrame(animateIdle);
			}
		};
		if (!isSpinning && !hasSpun) {
			animationFrameId = requestAnimationFrame(animateIdle);
		}
		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [isSpinning, hasSpun]);

	// LOGIC 2: CẬP NHẬT - Đọc kích thước từ container và cập nhật canvas
	useEffect(() => {
		const wheelContainer = wheelContainerRef.current;
		if (!wheelContainer) return;

		// ResizeObserver chỉ dùng để đọc kích thước do Tailwind đặt ra
		const resizeObserver = new ResizeObserver(entries => {
			if (entries[0]) {
				const { width } = entries[0].contentRect;
				// Cập nhật state kích thước để canvas vẽ lại
				setCurrentSize(width);
			}
		});

		resizeObserver.observe(wheelContainer);
		return () => resizeObserver.unobserve(wheelContainer);
	}, []); // Chạy một lần duy nhất

	// LOGIC 3: Vẽ Canvas - Cập nhật để sử dụng 'currentSize'
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext("2d");
		// Sử dụng currentSize cho mọi tính toán
		const centerX = currentSize / 2;
		const centerY = currentSize / 2;
		const radius = currentSize / 2 - 15;

		const buttonKeepOutRadius = Math.min(90, currentSize * 0.2);

		const numSegments = items.length;
		const angleStep = (Math.PI * 2) / numSegments;

		const calculateFontSize = () => {
			const baseSize = 36;
			let calculatedSize = baseSize;
			if (numSegments > 3) {
				calculatedSize = Math.max(10, baseSize - (numSegments - 3) * 1.5);
			}
			// Tỉ lệ font theo kích thước vòng quay
			return Math.min(baseSize, (calculatedSize * currentSize) / 700);
		};
		const dynamicFontSize = calculateFontSize();
		setFontSize(dynamicFontSize);

		const truncateText = (text, maxWidth) => {
			let currentText = text;
			if (ctx.measureText(currentText).width <= maxWidth) return currentText;
			while (
				ctx.measureText(currentText + "...").width > maxWidth &&
				currentText.length > 0
			) {
				currentText = currentText.slice(0, -1);
			}
			return currentText + "...";
		};

		const drawWheel = () => {
			ctx.clearRect(0, 0, currentSize, currentSize);
			items.forEach((item, index) => {
				const startAngle = angleStep * index + (rotation * Math.PI) / 180;
				const endAngle = startAngle + angleStep;
				ctx.beginPath();
				ctx.moveTo(centerX, centerY);
				ctx.arc(centerX, centerY, radius, startAngle, endAngle);
				ctx.closePath();
				ctx.fillStyle = colors[index % colors.length];
				ctx.fill();
				ctx.strokeStyle = "#334155";
				ctx.lineWidth = 1;
				ctx.stroke();
				ctx.save();
				ctx.translate(centerX, centerY);
				ctx.rotate(startAngle + angleStep / 2);
				ctx.textAlign = "right";
				ctx.fillStyle = "#ffffff";
				ctx.font = `bold ${fontSize}px Arial`;
				ctx.textBaseline = "middle";
				const maxTextWidth = radius - buttonKeepOutRadius - 15;
				const textToDraw = truncateText(item.name, maxTextWidth);
				const textX = radius - 10;
				ctx.fillText(textToDraw, textX, 0);
				ctx.restore();
			});
			ctx.beginPath();
			ctx.arc(centerX, centerY, 35, 0, Math.PI * 2);
			ctx.fillStyle = "#1e293b";
			ctx.fill();
		};
		drawWheel();
	}, [rotation, currentSize, fontSize, items]);

	// LOGIC 4: Xử lý quay - Giữ nguyên
	const spinWheel = () => {
		if (isSpinning || items.length === 0) return;
		setIsSpinning(true);
		setHasSpun(true);
		const numSegments = items.length;
		const winnerIndex = Math.floor(Math.random() * numSegments);
		const angleStepDeg = 360 / numSegments;
		const initialRotation = rotation;
		const midSegmentAngle = winnerIndex * angleStepDeg + angleStepDeg / 2;
		const pointerAngle = 90;
		let currentRotationMod = initialRotation % 360;
		if (currentRotationMod < 0) currentRotationMod += 360;
		const angleToTarget = pointerAngle - midSegmentAngle;
		const offsetRotation = (360 - currentRotationMod) % 360;
		const deltaToLand = (angleToTarget + offsetRotation + 360) % 360;
		const duration = 8;
		const minSpins = 5;
		const maxSpins = 10;
		const spins =
			Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
		const fullTarget = spins * 360 + deltaToLand;
		const accelTime = 3;
		const decelTime = duration - accelTime;
		const v_max = (2 * fullTarget) / duration;
		const alpha_accel = v_max / accelTime;
		const alpha_decel = -v_max / decelTime;
		const startTime = performance.now();
		const animate = now => {
			const elapsed = (now - startTime) / 1000;
			if (elapsed < duration) {
				let deltaRotation;
				if (elapsed < accelTime) {
					deltaRotation = 0.5 * alpha_accel * elapsed * elapsed;
				} else {
					const t_decel = elapsed - accelTime;
					const theta_accel = 0.5 * v_max * accelTime;
					deltaRotation =
						theta_accel +
						v_max * t_decel +
						0.5 * alpha_decel * t_decel * t_decel;
				}
				setRotation(initialRotation + deltaRotation);
				requestAnimationFrame(animate);
			} else {
				setRotation(initialRotation + fullTarget);
				setIsSpinning(false);
				Swal.fire({
					title: "Kết quả!",
					html: `Bạn đã quay trúng: <br><b class="text-blue-400 text-2xl">${items[winnerIndex].name}</b>`,
					icon: "success",
					confirmButtonText: "Tuyệt vời!",
					background: "#1e293b",
					color: "#ffffff",
					confirmButtonColor: "#3B82F6",
				});
			}
		};
		requestAnimationFrame(animate);
	};

	if (!items || items.length === 0) {
		return (
			<div className='flex flex-col items-center justify-center text-center p-8'>
				<h2 className='text-3xl font-bold text-gray-100 mb-3 tracking-wide'>
					{title}
				</h2>
				<div className='relative flex items-center justify-center bg-slate-700/50 border-2 border-dashed border-slate-500 rounded-full w-80 h-80'>
					<p className='text-slate-400 text-lg max-w-[200px]'>
						Vui lòng chọn ít nhất một mục trong phần Tùy Chỉnh.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full h-full flex flex-col items-center justify-center'>
			<h2 className='text-3xl font-bold text-gray-100 mb-3 tracking-wide text-center'>
				{title}
			</h2>
			{/* CẬP NHẬT: Sử dụng Tailwind CSS cho kích thước responsive */}
			<div
				ref={wheelContainerRef}
				className='relative w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] lg:w-[700px] lg:h-[700px] xl:w-[850px] xl:h-[850px]'
			>
				<canvas
					ref={canvasRef}
					width={currentSize}
					height={currentSize}
					className='rounded-full -rotate-90'
				/>
				<div className='absolute top-1/2 right-0 -translate-y-1/2 z-20'>
					<div className='w-0 h-0 border-t-[20px] border-b-[20px] border-r-[40px] border-t-transparent border-b-transparent border-r-blue-500' />
				</div>
				<button
					onClick={spinWheel}
					disabled={isSpinning}
					className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 sm:w-40 sm:h-40 rounded-full bg-slate-900 text-blue-400 border-4 border-blue-400 text-2xl sm:text-3xl font-extrabold cursor-pointer z-10 transition-all duration-200 hover:scale-110 hover:shadow-2xl hover:shadow-blue-500/50 focus:outline-none focus:ring-4 focus:ring-blue-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed'
				>
					{isSpinning ? "..." : "SPIN"}
				</button>
			</div>
		</div>
	);
};

export default VongQuayNgauNhien;
