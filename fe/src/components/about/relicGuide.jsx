// src/pages/RelicGuide.jsx
import { Link } from "react-router-dom";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";
import { Calendar, Clock, Eye, Star, Package, Zap } from "lucide-react";

export default function RelicGuide() {
	const guide = {
		title:
			"Hướng Dẫn Toàn Diện Hệ Thống Cổ Vật (Relics) trong Con Đường Anh Hùng",
		publishedDate: "23 Tháng 11, 2025",
		updateDate: "cập nhật ngày 23 Tháng 11, 2025",
		views: "1.847",
		author: "Admin POC Guide",
		thumbnail: "/image/relics.png", // thay bằng ảnh thumbnail thật nếu có
	};

	return (
		<>
			<PageTitle
				title={guide.title}
				description='Tất tần tật về Cổ vật (Relics) trong The Path of Champions – Cách thu thập, phân loại, nâng cấp và build combo mạnh nhất'
				type='article'
			/>

			<article className='min-h-screen py-8'>
				<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'>
					{/* ==================== HEADER ==================== */}
					<header className='mb-10'>
						<h1 className='text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] leading-tight mb-6'>
							{guide.title}
						</h1>

						<div className='flex flex-wrap items-center gap-4 text-sm text-[var(--color-text-secondary)]'>
							<div className='flex items-center gap-2'>
								<Calendar className='w-4 h-4' />
								<span>Đăng ngày: {guide.publishedDate}</span>
							</div>
							<div className='hidden sm:block w-px h-5 bg-gray-600'></div>
							<div className='flex items-center gap-2'>
								<Clock className='w-4 h-4' />
								<span>{guide.updateDate}</span>
							</div>
							<div className='hidden sm:block w-px h-5 bg-gray-600'></div>
							<div className='flex items-center gap-2'>
								<Eye className='w-4 h-4' />
								<span>{guide.views} lượt xem</span>
							</div>
						</div>
					</header>

					{/* ==================== THUMBNAIL ==================== */}
					<div className='mb-10 rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]'>
						<SafeImage
							src={guide.thumbnail}
							alt='Hệ thống Cổ vật Path of Champions'
							className='w-full h-auto object-cover'
							fallback='/fallback-guide.jpg'
						/>
					</div>

					{/* ==================== NỘI DUNG CHÍNH ==================== */}
					<div className='prose prose-invert max-w-none prose-lg'>
						{/* Giới thiệu */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-[var(--color-primary-500)] mb-6'>
								Cổ vật (Relics) là gì?
							</h2>
							<p className='text-lg leading-relaxed text-[var(--color-text-secondary)]'>
								Cổ vật là những trang bị đặc biệt chỉ tồn tại trong chế độ{" "}
								<strong>Con Đường Anh Hùng (The Path of Champions)</strong>.
								Chúng mang lại hiệu ứng cực kỳ mạnh mẽ và đa dạng, giúp thay đổi
								hoàn toàn lối chơi của từng vị tướng.
							</p>
							<p className='text-lg leading-relaxed text-[var(--color-text-secondary)] mt-4'>
								Mỗi tướng tối đa được mang <strong>3 cổ vật</strong>. Sự kết hợp
								cổ vật đúng cách có thể biến một tướng 1-2 sao thành “quái vật”
								có thể clear cả bản đồ Ác Mộng và các event khó nhất.
							</p>
						</section>

						<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
							<SafeImage
								src='/image/relic.png'
								alt='3 ô cổ vật trên tướng'
								className='w-full'
							/>
						</div>

						{/* Độ hiếm & ô cổ vật */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-white mb-6'>
								01. Phân loại độ hiếm & ô Cổ Vật
							</h2>
							<div className='grid md:grid-cols-3 gap-6 my-8'>
								<div className='text-center p-6 bg-gray-800 rounded-xl border border-gray-700'>
									<div className='text-2xl font-bold text-gray-400 mb-2'>
										Thường (Common)
									</div>
									<Package className='w-12 h-12 mx-auto text-gray-500' />
									<p className='mt-3'>Ô đầu tiên luôn là Thường</p>
								</div>
								<div className='text-center p-6 bg-blue-950 rounded-xl border border-blue-800'>
									<div className='text-2xl font-bold text-blue-400 mb-2'>
										Hiếm (Rare)
									</div>
									<Package className='w-12 h-12 mx-auto text-blue-500' />
									<p className='mt-3'>Mở ở cấp tướng khoảng 15-20</p>
								</div>
								<div className='text-center p-6 bg-purple-950 rounded-xl border border-purple-700'>
									<div className='text-2xl font-bold text-purple-400 mb-2'>
										Sử Thi (Epic)
									</div>
									<Package className='w-12 h-12 mx-auto text-purple-500' />
									<p className='mt-3'>Chỉ có được bằng Tôi Luyện Linh Hồn</p>
								</div>
							</div>
						</section>

						{/* Cách thu thập */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-[var(--color-primary-500)] mb-6'>
								02. Cách thu thập Cổ vật
							</h2>
							<ul className='list-none space-y-4 text-lg'>
								<li className='flex items-start gap-3'>
									<Zap className='w-6 h-6 text-yellow-500 mt-1 flex-shrink-0' />
									<div>
										<strong>Rương Thánh Tích</strong> – phần thưởng chính từ các
										cuộc phiêu lưu
									</div>
								</li>
								<li className='flex items-start gap-3'>
									<Zap className='w-6 h-6 text-yellow-500 mt-1 flex-shrink-0' />
									<div>
										<strong>Nhiệm vụ hàng tuần / hàng tháng</strong>
									</div>
								</li>
								<li className='flex items-start gap-3'>
									<Zap className='w-6 h-6 text-yellow-500 mt-1 flex-shrink-0' />
									<div>
										<strong>Cửa Hàng Vinh Danh</strong> (dùng Vinh Danh đổi)
									</div>
								</li>
								<li className='flex items-start gap-3'>
									<Zap className='w-6 h-6 text-yellow-500 mt-1 flex-shrink-0' />
									<div>
										<strong>Sự kiện đặc biệt</strong> (thường có rương Sử Thi)
									</div>
								</li>
							</ul>
						</section>

						<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
							<SafeImage
								src='/image/relicshop.png'
								alt='Cửa hàng vinh danh bán cổ vật'
								className='w-full'
							/>
						</div>

						{/* Tôi luyện linh hồn */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-purple-400 mb-6'>
								03. Tôi Luyện Linh Hồn – Nâng cấp ô Hiếm → Sử Thi
							</h2>
							<p className='text-lg leading-relaxed text-[var(--color-text-secondary)]'>
								Khi tướng đạt cấp đủ cao, bạn sẽ mở tính năng{" "}
								<strong>Tôi Luyện Linh Hồn</strong> (Consume). Bạn hy sinh 1 cổ
								vật cùng loại (cùng tên) để biến ô Hiếm thành ô Sử Thi, cho phép
								trang bị cổ vật tím.
							</p>
							<p className='text-lg text-orange-400 font-bold mt-4'>
								Lưu ý: Chỉ nên tiêu thụ bản thừa, tuyệt đối không tiêu bản
								unique quý hiếm!
							</p>
						</section>

						{/* Top cổ vật mạnh nhất */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-[var(--color-primary-500)] mb-8'>
								04. Top 15 Cổ vật mạnh nhất hiện tại (cập nhật 2025)
							</h2>
							<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
								{[
									{
										name: "The Collector’s Might",
										rarity: "Sử Thi",
										desc: "+2/+2 cho mọi lá bài trong tay & bộ bài",
									},
									{
										name: "Archangel’s Staff",
										rarity: "Sử Thi",
										desc: "Mỗi round đầu +2 mana gem",
									},
									{
										name: "Garen’s Judgment",
										rarity: "Sử Thi",
										desc: "Khi đồng minh chết → triệu hồi Elite khác",
									},
									{
										name: "Targon’s Peak",
										rarity: "Sử Thi",
										desc: "Invoke lá bài 8 mana mỗi round",
									},
									{
										name: "Crownguard Inheritance",
										rarity: "Hiếm",
										desc: "Lá bài đắt nhất giảm 2 mana",
									},
									{
										name: "Ravenous Hydra",
										rarity: "Sử Thi",
										desc: "Khi tấn công → gây sát thương bằng Attack cho tất cả kẻ địch",
									},
									{
										name: "Warmog’s Armor",
										rarity: "Hiếm",
										desc: "+15 máu khởi đầu",
									},
									{
										name: "Banshee’s Veil",
										rarity: "Hiếm",
										desc: "Round đầu miễn nhiễm spell địch",
									},
									{
										name: "Zhonya’s Hourglass",
										rarity: "Sử Thi",
										desc: "Lần đầu sắp chết → bất tử 1 round",
									},
									{
										name: "Gatebreaker",
										rarity: "Hiếm",
										desc: "Round đầu +4/+4 cho unit mạnh nhất",
									},
									{
										name: "The Scargrounds",
										rarity: "Hiếm",
										desc: "Khi unit chết → +1/+1 cho tất cả đồng minh",
									},
									{
										name: "Lost Chapter",
										rarity: "Thường",
										desc: "Round đầu refill 1 mana",
									},
									{
										name: "Overwhelming Power",
										rarity: "Hiếm",
										desc: "Mỗi spell gây thêm 1 sát thương",
									},
									{
										name: "Guardian’s Orb",
										rarity: "Thường",
										desc: "Khởi đầu với SpellShield",
									},
									{
										name: "Titanic Strength",
										rarity: "Hiếm",
										desc: "Khi triệu hồi unit 5+ mana → +3/+3",
									},
								].map((relic, i) => (
									<div
										key={i}
										className='bg-gray-900 border border-gray-700 rounded-xl p-5 hover:border-purple-500 transition-all'
									>
										<div className='flex items-center justify-between mb-2'>
											<h4 className='font-bold text-white'>{relic.name}</h4>
											<span
												className={`text-xs px-2 py-1 rounded ${
													relic.rarity === "Sử Thi"
														? "bg-purple-900 text-purple-300"
														: "bg-blue-900 text-blue-300"
												}`}
											>
												{relic.rarity}
											</span>
										</div>
										<p className='text-sm text-gray-400'>{relic.desc}</p>
									</div>
								))}
							</div>
						</section>

						{/* Kết luận */}
						<section className='mt-16 rounded-3xl p-10 text-center border border-[var(--color-border)] bg-gradient-to-b from-purple-900/20 to-transparent'>
							<h2 className='text-4xl font-bold text-[var(--color-primary-500)] mb-6'>
								Hãy thử nghiệm và tìm ra combo cổ vật của riêng bạn!
							</h2>
							<p className='text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto'>
								Cổ vật chính là yếu tố tạo nên sự khác biệt giữa một người chơi
								bình thường và một cao thủ Path of Champions. Đừng ngại thử
								nghiệm những combo “điên rồ” – đôi khi chúng lại là chìa khóa để
								vượt qua Asol Ác Mộng hay các event mới nhất!
							</p>
						</section>
					</div>

					{/* ==================== BÀI VIẾT LIÊN QUAN ==================== */}
					<aside className='mt-20'>
						<h3 className='text-2xl font-bold text-[var(--color-primary-500)] mb-8'>
							Bài viết liên quan
						</h3>
						<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6'>
							{[1, 2, 3].map(i => (
								<Link
									key={i}
									to='/guide/path-of-champions-starter'
									className='group block bg-[var(--color-surface-bg)] rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary-500)] transition-all'
								>
									<div className='h-48 bg-gray-700'></div>
									<div className='p-5'>
										<h4 className='font-bold text-[var(--color-primary-500)] group-hover:text-[var(--color-primary-600)] line-clamp-2'>
											Hướng dẫn tổng quan Con Đường Anh Hùng
										</h4>
										<p className='text-sm text-[var(--color-text-secondary)] mt-2'>
											23/11/2025 • 68.5K lượt xem
										</p>
									</div>
								</Link>
							))}
						</div>
					</aside>
				</div>
			</article>
		</>
	);
}
