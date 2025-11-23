// src/pages/GuideDetail.jsx
import { Link } from "react-router-dom";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";
import { Clock, Calendar, Eye } from "lucide-react";

export default function GuideDetail() {
	// Thay đổi dữ liệu này theo bài viết thực tế
	const guide = {
		title: "Hướng Dẫn Chế Độ Chơi Con Đường Anh Hùng (Path Of Champions)",
		publishedDate: "23 Tháng 11, 2025",
		views: "242",
		author: "Admin POC Guide",
		thumbnail: "/image/thumbcdah.png",
		updateDate: "cập nhật này 23 Tháng 11, 2025",
	};

	return (
		<>
			<PageTitle
				title={guide.title}
				description='Hướng Dẫn Chế Độ Chơi Con Đường Anh Hùng Huyền Thoại Runeterra (Path Of Champions Legends of Runeterra) '
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
							alt={guide.title}
							className='w-full h-auto object-cover'
							fallback='/fallback-guide.jpg'
						/>
					</div>

					{/* ==================== NỘI DUNG CHÍNH ==================== */}
					<div className='prose prose-invert max-w-none prose-lg'>
						{/* Giới thiệu */}
						<section className='mb-12 rounded-2xl'>
							<h2 className='text-3xl font-bold text-[var(--color-primary-500)] mb-4'>
								Giới thiệu
							</h2>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg'>
								<strong>Con Đường Anh Hùng (Path of Champions hay PoC)</strong>{" "}
								là một chế độ chơi PvE thú vị, nơi người chơi sẽ đồng hành cùng
								các anh hùng mạnh mẽ để phiêu lưu vào thế giới{" "}
								<strong>Runeterra</strong>. Mỗi cuộc phiêu lưu là một trải
								nghiệm <strong>độc nhất</strong> (không có cuộc phiêu lưu nào
								giống nhau). Tại đây, người chơi sẽ đối mặt với các bản đồ khó
								khăn và những con trùm mạnh mẽ ở những bản đồ đầy tính thử
								thách. Bạn sẽ được xây dựng bộ bài mạnh mẽ bằng cách tổ hợp các
								lá bài và sử dụng vật phẩm sức mạnh đa dạng tìm được trong
								chuyến hành trình.
							</p>
							<br />
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg'>
								Bạn có thể trải nghiệm thử bằng cách tải game Huyền Thoại
								Runeterra (Legends of Runeterra) vào game ấn vào nút chơi ngay
								chọn mục Con Đường Anh Hùng và ấn chơi để bắt đầu phiêu lưu.
							</p>
						</section>

						{/* Hình ảnh minh họa trong bài */}
						<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
							<SafeImage
								src='/image/cdah.png'
								alt='Giao diện Con Đường Anh Hùng'
								className='w-full'
							/>
						</div>

						{/* Heading cấp 2 */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-white mb-6 flex items-center gap-3'>
								<span className='text-[var(--color-text-primary)]'>
									01 Hướng Dẫn Chơi Con Đường Anh Hùng (Path Of Champions)
								</span>
							</h2>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								The Path of Champions là chế độ PvE (đánh máy) nơi bạn chọn một{" "}
								<strong>Tướng</strong> để bắt đầu phiêu lưu, thu thập các sức
								mạnh, vật phẩm đặt biệt để trở nên mạnh mẽ hơn và thách đấu các
								boss mạnh dần của các khu vực trong bản đồ Runeterra.
							</p>
							<ul className='list-disc list-inside space-y-3 text-[var(--color-text-secondary)] ml-4'>
								<li>Thu thập mảnh và nâng cấp vị tướng yêu thích</li>
								<li>
									Hệ thống cổ vật đa dạng, độc đáo tạo ra các tổ hợp mạnh mẽ
								</li>
								<li>
									Xây dựng bộ bài, lựa chọn vật phẩm, sức mạnh tối ưu cho tướng
								</li>
								<li>Chinh phục các thử thách boss khó nhằn tại đấu khu vực</li>
							</ul>
							{/* Hình ảnh minh họa trong bài */}
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/hdcdah.png'
									alt='Hướng Dẫn Chơi Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
						</section>

						{/* Các phần tiếp theo */}
						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-white mb-6 flex items-center gap-3'>
								<span className='text-[var(--color-primary-500)]'>
									02 Mở Khóa và Nâng Cấp Tướng
								</span>
							</h2>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Để có thể bắt đầu phiêu lưu với một tướng bạn cần mở khóa tướng
								đó với 30 mảnh. Mỗi tướng đều có lối chơi riêng và có sự chênh
								lệnh cấp độ sao được hiển thị bên dưới phần tên.
							</p>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Khi mở khóa bạn có thể bắt đầu cuộc phiêu lưu với tướng đó, sau
								khi hoàn thành phiêu lưu bạn sẽ nhận được kinh nghiệm giúp tướng
								thăng cấp và mở khóa sức mạnh mới cho các lá bài trong bộ bài
								của bạn, các ô cổ vật trang bị cho tướng, tăng giới hạn máu nhà
								chính, tăng tỉ lệ nhặt được các vật phẩm mạnh mẽ trong lúc phiêu
								lưu,...
							</p>
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/unlockchampion.png'
									alt='Mở khóa tướng trong Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Để nâng sao cho tướng bạn cần có đủ số lượng yêu cầu của mảnh
								tướng đó để có thể nâng cấp hoặc có thể dùng tinh hoa cam để bù
								vào số lượng còn thiếu.
							</p>
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/upgradestar.png'
									alt='Nâng sao cho tướng trong Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
						</section>

						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-white mb-6 flex items-center gap-3'>
								<span className='text-[var(--color-primary-500)]'>
									03 Hệ Thống Cổ Vật Dành Cho Tướng
								</span>
							</h2>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Các cổ vật (Relics) là một phần hết sức quan trọng để tạo nên sự
								đa dạng cho các tướng, tướng có thể giống nhau nhưng lối xây
								dựng cổ vật của người chơi có thể khác nhau, từ đó tạo nên các
								tổ hợp, các lối chơi đa dạng.
							</p>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Mỗi tướng sẽ có 3 ô cổ vật mở khóa và nâng cấp dần theo cấp độ.
								Bạn có thể kết hợp các cổ vật với những tác dụng riêng biệt để
								tạo ra một bộ cổ vật mạnh mẽ.
							</p>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Cổ vật trong game được chia thành 3 bậc độ hiếm:{" "}
								<strong>Thường, Hiếm, Sử Thi</strong> người chơi chỉ mang được
								các cổ vật tương ứng với độ hiếm của ô cổ vật hiện tại trên
								tướng, bạn cần thăng cấp cho tướng để nâng các ô lên độ hiếm{" "}
								<strong>Thường</strong> lên thành độ hiếm <strong>Hiếm</strong>{" "}
								hoặc sử dụng <strong>Tôi Luyên Linh Hồn (Tiêu Thụ)</strong> để
								nâng từ độ hiếm <strong>Hiếm</strong> lên độ hiếm{" "}
								<strong>Sử Thi</strong>.
							</p>
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/relic.png'
									alt='hệ thống cổ vật trong Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Bạn có thể thu thập cổ vật thông qua việc mở các rương thánh
								tích, các rương này nhận được bằng cách hoàn thành các thử thách
								trong chuyến phiêu lưu, các nhiệm vụ của game, trong{" "}
								<strong>Cửa Hiệu</strong> hoặc trong{" "}
								<strong>Cửa Hàng Vinh Danh</strong>.
							</p>
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/relicshop.png'
									alt='thu thập cổ vật trong Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
						</section>

						<section className='mb-12'>
							<h2 className='text-3xl font-bold text-white mb-6 flex items-center gap-3'>
								<span className='text-[var(--color-primary-500)]'>
									04 Bản Đồ Phiêu Lưu
								</span>
							</h2>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Các bản đồ trong Con Đường Anh Hùng cực kì đa dạng trải dài từ
								dễ đến khó, mỗi bản đồ là một cuộc phiêu lưu thử thách dành cho
								người chơi. Hoàn thành cuộc phiêu lưu theo yêu cầu sẽ cho bạn
								các phần thưởng để nâng cấp sức mạnh cho tướng và mở khóa các
								cuộc phiêu lưu với độ khó cao hơn.
							</p>
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/map.png'
									alt='bản đồ phiêu lưu trong Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Mỗi sáng thứ 2 mỗi tuần sẽ có các chuyến phiêu lưu hàng tuần
								thường và ác mộng với các cuộc phiêu lưu ngẫu nhiên, kèm theo
								các phần thưởng cực kì giá trị.
							</p>
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/map7.png'
									alt='bản đồ phiêu lưu hàng tuần trong Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
							<p className='text-[var(--color-text-secondary)] leading-relaxed text-lg mb-4'>
								Bản đồ sự kiện sẽ mở theo giai đoạn trong một khoản thời gian
								nhất định, mang đến những cơ chế mới lại, những thử thách mới
								với những con boss mạnh mẽ, kèm theo đó là các phần thưởng xứng
								đáng cho những người chơi nhiêu lưu thành công.
							</p>
							<div className='my-12 rounded-2xl overflow-hidden shadow-xl border border-[var(--color-border)]'>
								<SafeImage
									src='/image/eventmap.png'
									alt='hệ thống cổ vật trong Con Đường Anh Hùng'
									className='w-full'
								/>
							</div>
						</section>

						{/* Kết luận + CTA */}
						<section className='mt-16  rounded-3xl p-10 text-center border border-[var(--color-border)]'>
							<h2 className='text-4xl font-bold text-[var(--color-primary-500)] mb-4 '>
								Bắt đầu chơi Con Đường Anh Hùng ngay hôm nay!
							</h2>
							<p className='text-xl text-[var(--color-text-secondary)] mb-8 max-w-2xl mx-auto'>
								Một chế độ chơi thú vị mang đến cho người chơi những trải nghiệm
								độc đáo đầy mới lại của game the bài kết hợp với roguelike cày
								cuốc.
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
									to='/guide/sample'
									className='group block bg-[var(--color-surface-bg)] rounded-xl overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-primary-500)] transition-all'
								>
									<div className='h-48 bg-gray-700'>{/* Ảnh thumbnail */}</div>
									<div className='p-5'>
										<h4 className='font-bold text-[var(--color-primary-500)] group-hover:text-[var(--color-primary-500)] transition-colors line-clamp-2'>
											Hướng dẫn poc
										</h4>
										<p className='text-sm text-[var(--color-text-secondary)] mt-2'>
											23/11/2025 • 48.2K lượt xem
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
