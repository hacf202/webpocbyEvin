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
								Cổ vật là những trang bị đặc biệt dành cho tướng trong chế độ{" "}
								<strong>Con Đường Anh Hùng (The Path of Champions)</strong>. Bạn
								có thể trang bị cổ vật cho tướng trước khi phiêu lưu, phối kết
								hợp các cổ vật để tối ưu sức mạnh cho tướng của bạn.
							</p>
							<p className='text-lg leading-relaxed text-[var(--color-text-secondary)] mt-4'>
								Mỗi tướng được mang tối đa <strong>3 cổ vật</strong>. Sự kết hợp
								cổ vật đúng cách giúp tướng có thể phát huy tối đa sức mạnh, với
								các tổ hợp cổ vật khác nhau sẽ mang đến các lối chơi khác nhau
								dù cho cùng một tướng.
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
							<h2 className='text-3xl font-bold text-[var(--color-primary-500)] mb-6'>
								01. Phân loại độ hiếm & ô Cổ Vật
							</h2>

							<p className='text-lg leading-relaxed text-[var(--color-text-secondary)]'>
								Cổ vật được chia làm 3 độ hiếm tăng dần là: Thường, Hiếm, Sử
								Thi.
							</p>
							<p className='text-lg leading-relaxed text-[var(--color-text-secondary)] mt-4'>
								Chỉ trang bị được cổ vật có độ hiếm bằng hoặc thấp hơn. Ví dụ Ô
								Hiếm thì có thể trang bị được cổ vật Hiếm và Thường, Ô thường
								thì chỉ trang bị được cổ vật Thường.
							</p>
							<p className='text-lg leading-relaxed text-[var(--color-text-secondary)] mt-4'>
								Độ hiếm của ô sẽ tăng dần dựa theo cấp tướng hoặc được nâng cấp
								nhờ vật phẩm. Cụ thể:
							</p>
							<ul className='list-disc list-inside space-y-3 text-[var(--color-text-secondary)] ml-4 mt-4 text-lg'>
								<li>
									<strong>Cấp 1 - 7:</strong> 1 ô cổ vật Thường
								</li>
								<li>
									<strong>Cấp 8 - 12:</strong> 1 ô cổ vật Hiếm
								</li>
								<li>
									<strong>Cấp 13 - 18:</strong> 1 ô cổ vật Thường và 1 ô cổ vật
									Hiếm
								</li>
								<li>
									<strong>Cấp 19 - 24:</strong> 2 ô cổ vật Hiếm
								</li>
								<li>
									<strong>Cấp 19 - 24:</strong> 2 ô cổ vật Hiếm
								</li>
								<li>
									<strong>Cấp 25 - 29:</strong> 1 ô cổ vật Thường và 2 ô cổ vật
									Hiếm
								</li>
								<li>
									<strong>Cấp 30 trở lên:</strong> 3 ô cổ vật Hiếm
								</li>
								<li>
									Để nâng cấp 1 ô cổ vật từ <strong>Hiếm lên Sử Thi</strong> cần
									sử dụng <strong>Tôi Luyện Linh Hồn</strong> lắp vào ô cổ vật
									và hoàn thành 1 chuyến phiêu lưu 3 sao trở lên.
								</li>
								<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
									<SafeImage
										src='/image/relicforge.png'
										alt='3 ô cổ vật trên tướng'
										className='w-full'
									/>
								</div>
							</ul>
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
										<strong>Cửa Hàng Vinh Danh</strong> (dùng xu Vinh Danh đổi)
									</div>
								</li>
								<li className='flex items-start gap-3'>
									<Zap className='w-6 h-6 text-yellow-500 mt-1 flex-shrink-0' />
									<div>
										<strong>Sự kiện đặc biệt bản đồ đặc biệt</strong>
									</div>
								</li>
								<li className='flex items-start gap-3'>
									<Zap className='w-6 h-6 text-yellow-500 mt-1 flex-shrink-0' />
									<div>
										<strong>Các gói ưu đãi giới hạn </strong>(bundle)
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

						{/* Top cổ vật mạnh nhất */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-[var(--color-primary-500)] mb-8'>
								03. Top các cổ vật mạnh nhất hiện tại (2025)
							</h2>
							<div className='grid sm:grid-cols-2 lg:grid-cols-3 gap-6 '>
								{[
									{
										name: "Găng Tinh Vân Sư #1",
										rarity: "Sử Thi",
										desc: "Sức mạnh: Bắt Đầu Trận Đấu: Nếu ta đang ở trong bộ bài hoặc trên tay và Khổng Lồ, +1 cho Năng Lượng Khởi Điểm. Ngươi có thể tìm thấy Anh Hùng Cấp 2 khi Hiệu Triệu hoặc Hình Thành.",
									},
									{
										name: "Đội Quân Quạ Của Swain",
										rarity: "Sử Thi",
										desc: "Sức Mạnh: Bắt Đầu Trận Đấu: Hấp Thụ 5 máu từ Nhà Chính của đối thủ.Xuất Trận: Nếu ta là Swain, hồi đầy năng lượng bài phép.",
									},
									{
										name: "Lõi Công Nghệ Hoàn Hảo",
										rarity: "Sử Thi",
										desc: "Sức mạnh: Bắt Đầu Vòng Đấu: Tạo trên tay 1 lá Nâng Cấp Lõi Công Nghệ. Lá Nâng Cấp Lõi Công Nghệ có Đồng Hồ Ngưng Đọng và thể nâng cấp bất kỳ đồng minh nào.",
									},
									{
										name: "Lời Thề Hộ Vệ",
										rarity: "Sử Thi",
										desc: "Xuất Trận: Tráo 5 anh hùng cấp 2 vào bộ bài và tăng gấp đôi chỉ số của họ, rồi rút 1 trong các lá đó.",
									},
									{
										name: "Linh Hồn Vang Vọng",
										rarity: "Sử Thi",
										desc: "Bắt Đầu Trận Đấu: Tạo 7 bản sao của ta trong bộ bài. Giảm 1 tiêu hao cho Bài Phép Anh Hùng.",
									},
									{
										name: "Quái Thú Bên Trong",
										rarity: "Sử Thi",
										desc: "Sức Mạnh: Đồng minh nhận Áp Đảo, và nếu có nhóm phụ, nhận thêm +1|+1.",
									},
									{
										name: "Kéo Cắt Ma Quái",
										rarity: "Sử Thi",
										desc: "+2|+0Hỗ Trợ: Nếu đồng minh được ta hỗ trợ là tùy tùng, ban Cảm Tử cho nó và triệu hồi bản sao y hệt của đồng minh đó ở vị trí tấn công.",
									},
									{
										name: "Đệ Tử Bóng Đêm",
										rarity: "Sử Thi",
										desc: "Ta được giảm 1 tiêu hao với mỗi đồng minh trên bàn.Xuất Trận: Gây 3 sát thương lên tất cả đồng minh khác.",
									},
									{
										name: "Máy Sao Chép Hóa Kỹ",
										rarity: "Hiếm",
										desc: "Khi ngươi sử dụng 1 bài phép, nếu ngươi có 6+ ngọc năng lượng, sao chép hiệu ứng bài phép đó lên cùng mục tiêu.",
									},
									{
										name: "Di Sản Crownguard",
										rarity: "Hiếm",
										desc: "Khi ta thăng cấp, Tiến Công.",
									},
									{
										name: "Bộ Bài Đầy Ắp",
										rarity: "Sử Thi",
										desc: "+200 Vàng Khởi Điểm.Sức Mạnh: Đồng minh nhận +1|+1 với mỗi 12 lá bài vượt quá lá thứ 18 trong bộ bài của ngươi khi bắt đầu trận đấu.",
									},
									{
										name: "Thuốc Nổ Nén Chặt",
										rarity: "Sử Thi",
										desc: "Cưỡng Đoạt: Ta được giảm 2 tiêu hao.Ta nhận +1|+1 với mỗi vòng đấu ngươi đã gây sát thương lên Nhà Chính của đối thủ.",
									},
								].map((relic, i) => (
									<div
										key={i}
										className=' border border-gray-700 rounded-xl p-5 hover:border-purple-500 transition-all'
									>
										<div className='flex items-center justify-between mb-2'>
											<h4 className='font-bold text-primary-500 text-xl'>
												{relic.name}
											</h4>
											<span
												className={`text-xs px-2 py-1 rounded text-nowrap ${
													relic.rarity === "Sử Thi"
														? "bg-purple-900 text-purple-300"
														: "bg-blue-900 text-blue-300"
												}`}
											>
												{relic.rarity}
											</span>
										</div>
										<p className='text-md text-gray-400'>{relic.desc}</p>
									</div>
								))}
							</div>
						</section>

						{/* Kết luận */}
						<section className='mt-16 rounded-3xl p-10 text-center border border-[var(--color-border)] '>
							<h2 className='text-4xl font-bold text-[var(--color-primary-500)] mb-6'>
								Hãy thử nghiệm và tìm ra combo cổ vật của riêng bạn!
							</h2>
							<p className='text-xl text-[var(--color-text-secondary)] max-w-3xl mx-auto'>
								Cổ vật chính là yếu tố tạo nên sự khác biệt giữa một người chơi
								bình thường và một người chơi kỳ cựu của Con Đường Anh Hùng.
								Đừng ngại thử nghiệm những combo mới lạ đôi khi chúng lại là
								chìa khóa để mở khóa tối đa sức mạnh của tướng.
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
