// src/pages/Home.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Flame, Rss, ChevronLeft, ChevronRight } from "lucide-react";

// Dữ liệu giả lập cho các bài viết
const featuredPosts = [
	{
		id: "builds",
		title: "Top những tướng mạnh nhất trong Path of Champions",
		category: "Path of Champions",
		imageUrl:
			"https://spellmana.com/wp-content/uploads/2024/05/GNvFb3eaAAAkxw7.webp",
		excerpt:
			"Khám phá những tướng có sức mạnh vượt trội giúp bạn chinh phục các thử thách trong Path of Champions.",
	},
	{
		id: "champion/Jinx",
		title: "Jinx 4 sao: Bùng nổ với Hỏa Lực Của Khẩu Pháo Nổi Loạn",
		category: "Builds",
		imageUrl:
			"https://wiki.leagueoflegends.com/en-us/images/01PZ040T1-full.png?3fc64",
		excerpt: "Tối ưu hóa sát thương của Jinx với trang bị và cổ vật phù hợp.",
	},
	{
		id: "relic/R0082",
		title: "Găng Tinh Vân Sư cổ vật mạnh nhất game",
		category: "Cổ vật",
		imageUrl:
			"https://dd.b.pvp.net/6_9_0/adventure/vi_vn/img/relics/R0082-full.png",
		excerpt:
			"Găng Tinh Vân Sư là cổ vật mạnh nhất trong game, cung cấp sức mạnh vượt trội cho tướng",
	},
	{
		id: "randomizer",
		title: "Trải Nghiệm Vòng Quay Path Of Champions",
		category: "Tool",
		imageUrl: "https://rerollcdn.com/GEN/lol/champion/Teemo.png",
		excerpt:
			"Tổng hợp các phương pháp giúp bạn đẩy nhanh tiến độ nâng cấp tướng.",
	},
];

const latestPosts = [
	{
		id: 2,
		title: "Phân tích meta game hiện tại: Những tướng đang thống trị",
		category: "Phân tích",
		imageUrl: "https://rerollcdn.com/GEN/lol/champion/Kindred.png",
	},
	{
		id: 3,
		title: "Top 5 thánh vật hiếm mạnh nhất bạn nên sở hữu",
		category: "Hướng dẫn",
		imageUrl:
			"https://cdn.sanity.io/images/g4s1d0u7/production/501a615af2181561025217a26f312c15143b86a0-64x64.png",
	},
	{
		id: 4,
		title: "Trải Nghiệm Thử Vòng Quay ",
		category: "Mẹo & Thủ thuật",
		imageUrl: "https://rerollcdn.com/GEN/lol/champion/Gwen.png",
	},
	{
		id: 5,
		title: "Cập nhật phiên bản 4.3: Những thay đổi đáng chú ý",
		category: "Tin tức",
		imageUrl: "https://rerollcdn.com/GEN/lol/champion/Volibear.png",
	},
	{
		id: 6,
		title: "Build đồ 'one shot' cho Jhin 4 sao",
		category: "Builds",
		imageUrl: "https://rerollcdn.com/GEN/lol/champion/Jhin.png",
	},
	{
		id: 7,
		title: "Đánh giá sức mạnh của Morgana mới ra mắt",
		category: "Đánh giá",
		imageUrl: "https://rerollcdn.com/GEN/lol/champion/Morgana.png",
	},
];

const popularPosts = [
	{ id: 1, title: "Hướng dẫn build đồ cho Yasuo 4 sao" },
	{ id: 2, title: "Làm thế nào để đánh bại Aurelion Sol?" },
	{ id: 3, title: "Top 3 tướng leo rank dễ nhất cho người mới" },
	{ id: 4, title: "Mẹo farm mảnh tướng hiệu quả" },
];

// Component Banner Carousel mới
const BannerCarousel = ({ posts }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex(prevIndex =>
				prevIndex === posts.length - 1 ? 0 : prevIndex + 1
			);
		}, 7000); // Tự động chuyển sau mỗi 7 giây

		return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
	}, [posts.length]);

	const goToPrevious = () => {
		const isFirstSlide = currentIndex === 0;
		const newIndex = isFirstSlide ? posts.length - 1 : currentIndex - 1;
		setCurrentIndex(newIndex);
	};

	const goToNext = () => {
		const isLastSlide = currentIndex === posts.length - 1;
		const newIndex = isLastSlide ? 0 : currentIndex + 1;
		setCurrentIndex(newIndex);
	};

	const goToSlide = index => {
		setCurrentIndex(index);
	};

	return (
		<div className='relative w-full h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg group'>
			<div
				className='flex transition-transform duration-700 ease-in-out h-full'
				style={{ transform: `translateX(-${currentIndex * 100}%)` }}
			>
				{posts.map(post => (
					<Link
						to={`/${post.id}`}
						key={post.id}
						className='flex-shrink-0 w-full h-full'
					>
						<div
							className='w-full h-full bg-cover bg-center relative'
							style={{ backgroundImage: `url(${post.imageUrl})` }}
						>
							<div className='absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent'></div>
							<div className='absolute bottom-0 left-0 p-6 text-white'>
								<span className='text-sm bg-blue-500 px-2 py-1 rounded'>
									{post.category}
								</span>
								<h3 className='text-xl md:text-3xl font-bold mt-2'>
									{post.title}
								</h3>
							</div>
						</div>
					</Link>
				))}
			</div>

			{/* Nút chuyển trái */}
			<button
				onClick={goToPrevious}
				className='absolute top-1/2 left-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100'
				aria-label='Previous slide'
			>
				<ChevronLeft size={24} />
			</button>

			{/* Nút chuyển phải */}
			<button
				onClick={goToNext}
				className='absolute top-1/2 right-4 -translate-y-1/2 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100'
				aria-label='Next slide'
			>
				<ChevronRight size={24} />
			</button>

			{/* Chấm điều hướng */}
			<div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2'>
				{posts.map((_, index) => (
					<button
						key={index}
						onClick={() => goToSlide(index)}
						className={`w-3 h-3 rounded-full transition-colors ${
							currentIndex === index ? "bg-white" : "bg-white/50"
						}`}
						aria-label={`Go to slide ${index + 1}`}
					></button>
				))}
			</div>
		</div>
	);
};

// Component Card bài viết
const PostCard = ({ post }) => (
	<div className='bg-[var(--color-surface)] rounded-lg overflow-hidden shadow-[var(--color-shadow)] border border-[var(--color-border)] hover:shadow-lg transition-shadow duration-300 h-full'>
		<Link to={`/post/${post.id}`} className='block'>
			<img
				src={post.imageUrl}
				alt={post.title}
				className='w-full h-40 object-cover object-top'
			/>
			<div className='p-4'>
				<span className='text-sm text-blue-500 font-semibold'>
					{post.category}
				</span>
				<h3 className='font-bold mt-1 text-lg text-[var(--color-text-primary)]'>
					{post.title}
				</h3>
			</div>
		</Link>
	</div>
);

// Component Section
const Section = ({ title, icon, children }) => (
	<div className='mb-8'>
		<div className='flex items-center mb-4'>
			{icon}
			<h2 className='text-2xl font-bold text-[var(--color-text-primary)] ml-2'>
				{title}
			</h2>
		</div>
		{children}
	</div>
);

function Home() {
	return (
		<div className='container mx-auto p-4 max-w-7xl'>
			<div className='lg:flex lg:gap-8'>
				{/* Cột nội dung chính */}
				<main className='flex-1'>
					{/* Bài viết nổi bật - Banner Carousel */}
					<Section
						title='Nổi bật'
						icon={<Flame className='text-red-500' size={28} />}
					>
						<BannerCarousel posts={featuredPosts} />
					</Section>

					{/* Tin tức mới nhất */}
					<Section
						title='Tin mới nhất'
						icon={<Rss className='text-green-500' size={28} />}
					>
						<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
							{latestPosts.map(post => (
								<PostCard key={post.id} post={post} />
							))}
						</div>
					</Section>
				</main>

				{/* Sidebar */}
				<aside className='w-full lg:w-80 mt-8 lg:mt-0 flex-shrink-0'>
					<div className='sticky top-20'>
						<div className='bg-[var(--color-surface)] rounded-lg p-4 shadow-[var(--color-shadow)] border border-[var(--color-border)]'>
							<h3 className='text-xl font-bold mb-4 border-l-4 border-blue-500 pl-3 text-[var(--color-text-primary)]'>
								Xem nhiều
							</h3>
							<ul>
								{popularPosts.map((post, index) => (
									<li
										key={post.id}
										className='mb-3 pb-3 border-b border-[var(--color-border-secondary)] last:border-b-0 last:pb-0 last:mb-0'
									>
										<Link
											to={`/post/${post.id}`}
											className='flex items-start gap-3 group'
										>
											<span className='text-2xl font-bold text-gray-400 group-hover:text-blue-500 transition-colors'>
												{index + 1}
											</span>
											<span className='font-semibold text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-colors'>
												{post.title}
											</span>
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</aside>
			</div>
		</div>
	);
}

export default Home;
