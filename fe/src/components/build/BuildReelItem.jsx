// // src/components/builds/BuildReelItem.jsx
// import React, { useState, useEffect } from "react";
// import { Heart, Eye, User, Star } from "lucide-react";

// const BuildReelItem = ({ build, isActive }) => {
// 	const {
// 		championName,
// 		creatorName = "Vô Danh",
// 		description = "",
// 		artifacts = [],
// 		powers = [],
// 		rune = [],
// 		star = 0,
// 		like = 0,
// 		views = 0,
// 	} = build;

// 	const [championArt, setChampionArt] = useState(null);
// 	const [loadingArt, setLoadingArt] = useState(true);

// 	// Lấy fullAbsolutePath từ API champions
// 	useEffect(() => {
// 		if (!championName || !isActive) return;

// 		const fetchArt = async () => {
// 			try {
// 				setLoadingArt(true);
// 				const res = await fetch(
// 					`${
// 						import.meta.env.VITE_API_URL
// 					}/api/champions/search?name=${encodeURIComponent(championName)}`
// 				);
// 				if (!res.ok) throw new Error();

// 				const data = await res.json();
// 				const artUrl = data.items?.[0]?.assets?.[0]?.M?.fullAbsolutePath?.S;

// 				if (artUrl) {
// 					setChampionArt(artUrl);
// 				} else {
// 					throw new Error();
// 				}
// 			} catch {
// 				const cleanName = championName.replace(/[^a-zA-Z]/g, "");
// 				setChampionArt(
// 					`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${cleanName}_0.jpg`
// 				);
// 			} finally {
// 				setLoadingArt(false);
// 			}
// 		};

// 		fetchArt();
// 	}, [championName, isActive]);

// 	return (
// 		<div className='relative w-full h-screen bg-black flex items-center justify-center snap-start'>
// 			{/* Reel container chuẩn 9:16 (max 500px) */}
// 			<div className='relative w-full max-w-[500px] h-full bg-black overflow-hidden shadow-2xl'>
// 				{/* Background art chính xác từ fullAbsolutePath */}
// 				{championArt && (
// 					<div
// 						className='absolute inset-0 bg-cover bg-center bg-no-repeat'
// 						style={{
// 							backgroundImage: `url(${championArt})`,
// 							filter: "brightness(0.35) blur(6px)",
// 						}}
// 					/>
// 				)}

// 				{/* Gradient overlay + glassmorphism từ theme.css */}
// 				<div className='absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40' />
// 				<div
// 					className='absolute inset-0'
// 					style={{ background: "var(--color-bg-overlay)" }}
// 				/>

// 				{/* Nội dung chính */}
// 				<div className='relative h-full flex flex-col justify-end px-6 pb-24'>
// 					{/* Tên tướng + ngôi sao */}
// 					<div className='text-center mb-8'>
// 						<h1 className='text-6xl md:text-7xl font-black text-white drop-shadow-2xl tracking-tight'>
// 							{championName}
// 						</h1>
// 						<div className='flex justify-center gap-3 mt-4'>
// 							{[...Array(6)].map((_, i) => (
// 								<Star
// 									key={i}
// 									size={44}
// 									className={`drop-shadow-2xl transition-all duration-300 ${
// 										i < star
// 											? "fill-var(--color-star) text-var(--color-star) scale-110"
// 											: "text-gray-700 opacity-40"
// 									}`}
// 									style={{ color: i < star ? "var(--color-star)" : undefined }}
// 								/>
// 							))}
// 						</div>
// 					</div>

// 					{/* Nội dung từ trên xuống dưới */}
// 					<div className='space-y-6 text-white'>
// 						{artifacts.length > 0 && (
// 							<div>
// 								<h3
// 									className='text-xl font-bold mb-3'
// 									style={{ color: "var(--color-role-combo)" }}
// 								>
// 									Artifacts
// 								</h3>
// 								<div className='flex flex-wrap gap-3'>
// 									{artifacts.map((a, i) => (
// 										<span
// 											key={i}
// 											className='px-5 py-3 rounded-full font-semibold shadow-lg'
// 											style={{
// 												background:
// 													"linear-gradient(135deg, var(--color-primary-500), var(--color-role-control))",
// 												color: "var(--color-white)",
// 											}}
// 										>
// 											{a}
// 										</span>
// 									))}
// 								</div>
// 							</div>
// 						)}

// 						{powers.length > 0 && (
// 							<div>
// 								<h3
// 									className='text-xl font-bold mb-3'
// 									style={{ color: "var(--color-icon-power)" }}
// 								>
// 									Powers
// 								</h3>
// 								<div className='flex flex-wrap gap-3'>
// 									{powers.map((p, i) => (
// 										<span
// 											key={i}
// 											className='px-4 py-2 rounded-lg backdrop-blur-sm border'
// 											style={{
// 												background: "rgba(255, 255, 255, 0.15)",
// 												borderColor: "var(--color-glass-border)",
// 												color: "var(--color-white)",
// 											}}
// 										>
// 											{p}
// 										</span>
// 									))}
// 								</div>
// 							</div>
// 						)}

// 						{rune.length > 0 && (
// 							<div>
// 								<h3
// 									className='text-xl font-bold mb-3'
// 									style={{ color: "var(--color-icon-gem)" }}
// 								>
// 									Rune
// 								</h3>
// 								<div className='flex flex-wrap gap-3'>
// 									{rune.map((r, i) => (
// 										<span
// 											key={i}
// 											className='px-4 py-2 rounded-lg border'
// 											style={{
// 												background: "rgba(236, 72, 153, 0.2)",
// 												borderColor: "var(--color-icon-gem)",
// 												color: "var(--color-white)",
// 											}}
// 										>
// 											{r}
// 										</span>
// 									))}
// 								</div>
// 							</div>
// 						)}

// 						{/* Mô tả cuối cùng */}
// 						{description && (
// 							<div
// 								className='mt-8 p-5 rounded-2xl border'
// 								style={{
// 									background: "var(--color-glass-bg)",
// 									borderColor: "var(--color-glass-border)",
// 									backdropFilter: "blur(12px)",
// 								}}
// 							>
// 								<p
// 									className='text-base md:text-lg leading-relaxed'
// 									style={{ color: "var(--color-white)" }}
// 								>
// 									{description}
// 								</p>
// 							</div>
// 						)}
// 					</div>
// 				</div>

// 				{/* Cột phải dọc: Tác giả + Like + View (chuẩn Reels) */}
// 				<div className='absolute right-4 bottom-20 md:bottom-24 flex flex-col items-center gap-6 text-white'>
// 					{/* Avatar tác giả */}
// 					<div className='flex flex-col items-center gap-3'>
// 						<div
// 							className='w-14 h-14 rounded-full flex items-center justify-center shadow-2xl border-4'
// 							style={{
// 								background:
// 									"linear-gradient(135deg, var(--color-primary-500), var(--color-role-control))",
// 								borderColor: "var(--color-white)",
// 							}}
// 						>
// 							<User size={32} />
// 						</div>
// 						<p className='font-bold text-sm drop-shadow-lg'>{creatorName}</p>
// 					</div>

// 					{/* Like */}
// 					<div className='flex flex-col items-center gap-2'>
// 						<button
// 							className='p-4 rounded-full shadow-xl transition-all hover:scale-110'
// 							style={{
// 								background: "rgba(255, 255, 255, 0.2)",
// 								backdropFilter: "blur(10px)",
// 							}}
// 						>
// 							<Heart
// 								size={32}
// 								fill='currentColor'
// 								style={{ color: "var(--color-danger-500)" }}
// 							/>
// 						</button>
// 						<span className='font-bold text-lg drop-shadow-lg'>
// 							{like.toLocaleString()}
// 						</span>
// 					</div>

// 					{/* View */}
// 					<div className='flex flex-col items-center gap-2'>
// 						<div
// 							className='p-4 rounded-full shadow-xl'
// 							style={{
// 								background: "rgba(255, 255, 255, 0.2)",
// 								backdropFilter: "blur(10px)",
// 							}}
// 						>
// 							<Eye size={32} style={{ color: "var(--color-white)" }} />
// 						</div>
// 						<span className='font-bold text-lg drop-shadow-lg'>
// 							{views.toLocaleString()}
// 						</span>
// 					</div>
// 				</div>

// 				{/* Loading */}
// 				{loadingArt && isActive && (
// 					<div className='absolute inset-0 bg-black/90 flex items-center justify-center z-50'>
// 						<div
// 							className='text-2xl font-bold animate-pulse'
// 							style={{ color: "var(--color-white)" }}
// 						>
// 							Đang tải nghệ thuật...
// 						</div>
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// };

// export default BuildReelItem;
