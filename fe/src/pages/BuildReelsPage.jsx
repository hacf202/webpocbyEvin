// // src/pages/BuildReelsPage.jsx
// import React, { useState, useEffect, useRef } from "react";
// import BuildReelItem from "../components/build/BuildReelItem";
// import { ChevronUp, ChevronDown } from "lucide-react";

// const BuildReelsPage = () => {
// 	const [builds, setBuilds] = useState([]);
// 	const [currentIndex, setCurrentIndex] = useState(0);
// 	const [loading, setLoading] = useState(true);
// 	const containerRef = useRef(null);

// 	useEffect(() => {
// 		const fetchBuilds = async () => {
// 			try {
// 				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/builds`);
// 				const data = await res.json();
// 				const sorted = (data.items || [])
// 					.filter(b => b.display === true)
// 					.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
// 				setBuilds(sorted);
// 				setLoading(false);
// 			} catch (err) {
// 				console.error(err);
// 				setLoading(false);
// 			}
// 		};
// 		fetchBuilds();
// 	}, []);

// 	// Ẩn scrollbar toàn trang
// 	useEffect(() => {
// 		document.documentElement.style.overflow = "hidden";
// 		return () => (document.documentElement.style.overflow = "auto");
// 	}, []);

// 	// Cuộn mượt
// 	useEffect(() => {
// 		if (containerRef.current) {
// 			containerRef.current.scrollTo({
// 				top: currentIndex * window.innerHeight,
// 				behavior: "smooth",
// 			});
// 		}
// 	}, [currentIndex]);

// 	const goNext = () =>
// 		currentIndex < builds.length - 1 && setCurrentIndex(i => i + 1);
// 	const goPrev = () => currentIndex > 0 && setCurrentIndex(i => i - 1);

// 	if (loading)
// 		return (
// 			<div className='h-screen bg-black flex items-center justify-center text-white text-3xl'>
// 				Đang tải...
// 			</div>
// 		);
// 	if (builds.length === 0)
// 		return (
// 			<div className='h-screen bg-black flex items-center justify-center text-white text-3xl'>
// 				Chưa có build nào
// 			</div>
// 		);

// 	return (
// 		<div
// 			ref={containerRef}
// 			className='h-screen overflow-hidden snap-y snap-mandatory'
// 		>
// 			{builds.map((build, i) => (
// 				<BuildReelItem
// 					key={build.id}
// 					build={build}
// 					isActive={i === currentIndex}
// 				/>
// 			))}

// 			{/* Nút lên/xuống cố định bên phải, cùng trục Y */}
// 			<div className='fixed right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50'>
// 				<button
// 					onClick={goPrev}
// 					className={`p-4 rounded-full shadow-2xl transition-all ${
// 						currentIndex === 0 ? "opacity-40" : "hover:scale-110"
// 					}`}
// 					style={{
// 						background: "rgba(255,255,255,0.25)",
// 						backdropFilter: "blur(12px)",
// 					}}
// 					disabled={currentIndex === 0}
// 				>
// 					<ChevronUp size={36} className='text-white' />
// 				</button>

// 				<button
// 					onClick={goNext}
// 					className={`p-4 rounded-full shadow-2xl transition-all ${
// 						currentIndex === builds.length - 1
// 							? "opacity-40"
// 							: "hover:scale-110"
// 					}`}
// 					style={{
// 						background: "rgba(255,255,255,0.25)",
// 						backdropFilter: "blur(12px)",
// 					}}
// 					disabled={currentIndex === builds.length - 1}
// 				>
// 					<ChevronDown size={36} className='text-white' />
// 				</button>
// 			</div>

// 			{/* Chỉ số */}
// 			<div className='fixed top-8 right-8 bg-black/60 px-4 py-2 rounded-full text-white font-bold z-50'>
// 				{currentIndex + 1} / {builds.length}
// 			</div>
// 		</div>
// 	);
// };

// export default BuildReelsPage;
