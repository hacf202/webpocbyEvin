// src/pages/TermsOfUse.jsx
import { memo } from "react";
import { Link } from "react-router-dom";

function TermsOfUse() {
	return (
		<main className='min-h-screen bg-[var(--color-page-bg)] py-12'>
			<div className='max-w-[900px] mx-auto px-4 sm:px-6'>
				{/* Tiêu đề */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4'>
						Điều Khoản Sử Dụng
					</h1>
					<p className='text-lg text-[var(--color-text-secondary)]'>
						Chào mừng bạn đến với <strong>Guide POC</strong>. Vui lòng đọc kỹ
						các điều khoản dưới đây trước khi sử dụng.
					</p>
				</div>

				{/* Nội dung chính */}
				<div className='prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-10 leading-relaxed'>
					{/* 1. Dự án do người hâm mộ phát triển */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							1. Dự án do người hâm mộ phát triển
						</h2>
						<p>
							<strong>Guide POC</strong> là một trang web{" "}
							<strong>độc lập</strong>, được xây dựng và vận hành hoàn toàn bởi{" "}
							<strong>người hâm mộ</strong> của <i>Legends of Runeterra</i>.
						</p>
						<p className='mt-3'>
							Chúng tôi{" "}
							<strong>không liên kết, được xác nhận, hoặc tài trợ</strong> bởi{" "}
							<strong>Riot Games</strong>, <strong>Riot Forge</strong>, hoặc bất
							kỳ công ty con nào liên quan.
						</p>
						<p className='mt-3'>
							Mọi tên gọi, hình ảnh, nhân vật, cơ chế trò chơi và tài sản trí
							tuệ trong <i>Path of Champions</i> đều thuộc quyền sở hữu hợp pháp
							của <strong>Riot Games</strong>.
						</p>
					</section>

					{/* 2. Sử dụng Nội dung */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							2. Sử dụng Nội dung
						</h2>
						<p>
							Tất cả nội dung gốc trên <strong>Guide POC</strong> — bao gồm
							hướng dẫn build, lộ trình farm, phân tích relic, hình ảnh minh họa
							— đều được tạo ra bởi cộng đồng{" "}
							<strong>
								chỉ nhằm mục đích chia sẻ thông tin và hỗ trợ người chơi
							</strong>
							.
						</p>

						<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
							<li>
								Bạn được <strong>tự do đọc, chia sẻ, hoặc liên kết</strong> đến
								nội dung của chúng tôi cho mục đích{" "}
								<strong>cá nhân hoặc phi thương mại</strong>.
							</li>
							<li>
								<strong>
									Vui lòng không sao chép, tải lại hoặc tái phân phối
								</strong>{" "}
								nội dung mà <strong>không ghi rõ nguồn</strong>.
							</li>
							<li>
								Nếu sử dụng lại (bản dịch, video, bài viết),{" "}
								<strong>bắt buộc phải ghi nguồn đầy đủ</strong> và{" "}
								<strong>liên kết trở lại trang gốc</strong>.
							</li>
						</ul>
					</section>

					{/* 3. Tính chính xác của Thông tin */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							3. Tính chính xác của Thông tin
						</h2>
						<p>
							Chúng tôi luôn nỗ lực cập nhật thông tin{" "}
							<strong>chính xác và mới nhất</strong> dựa trên datamine, thử
							nghiệm thực tế và bản vá chính thức.
						</p>
						<p className='mt-3'>
							Tuy nhiên, <strong>cơ chế trò chơi có thể thay đổi</strong> do cập
							nhật, hotfix hoặc thay đổi balance.{" "}
							<strong>Guide POC không đảm bảo 100% chính xác mọi lúc</strong>.
						</p>
						<p className='mt-3'>
							Hãy sử dụng hướng dẫn của chúng tôi như một{" "}
							<strong>gợi ý tham khảo</strong>, không phải quy tắc bắt buộc.
						</p>
					</section>

					{/* 4. Trách nhiệm của người dùng */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							4. Trách nhiệm của người dùng
						</h2>
						<p>
							Khi sử dụng <strong>Guide POC</strong>, bạn đồng ý:
						</p>
						<ul className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
							<li>
								Sử dụng nội dung cho{" "}
								<strong>mục đích hợp pháp và tôn trọng</strong>.
							</li>
							<li>
								<strong>Không cố ý phá hoại, tấn công, hoặc lạm dụng</strong>{" "}
								tài nguyên website (bao gồm spam, bot, DDoS).
							</li>
							<li>
								Chấp nhận rằng tất cả nội dung được cung cấp{" "}
								<strong>"nguyên trạng"</strong> —{" "}
								<strong>không có bảo hành</strong> về tính chính xác, đầy đủ
								hoặc khả dụng.
							</li>
						</ul>
					</section>

					{/* 5. Liên kết ngoài */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							5. Liên kết ngoài
						</h2>
						<p>
							Trang web có thể chứa liên kết đến{" "}
							<strong>trang web, video, hoặc tài nguyên bên thứ ba</strong>{" "}
							(YouTube, Discord, wiki, v.v.).
						</p>
						<p className='mt-3'>
							Chúng tôi <strong>không chịu trách nhiệm</strong> về nội dung,
							tính chính xác, hoặc chính sách bảo mật của các trang đó.
						</p>
					</section>

					{/* 6. Thay đổi Điều khoản */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							6. Thay đổi Điều khoản
						</h2>
						<p>
							Chúng tôi có quyền <strong>cập nhật hoặc sửa đổi</strong> các điều
							khoản này <strong>bất kỳ lúc nào mà không cần báo trước</strong>.
						</p>
						<p className='mt-3'>
							Việc bạn <strong>tiếp tục sử dụng trang web</strong> sau khi thay
							đổi đồng nghĩa với việc{" "}
							<strong>chấp nhận phiên bản mới nhất</strong>.
						</p>
					</section>

					{/* Cập nhật lần cuối */}
					<section className='text-center pt-8 border-t border-[var(--color-border)]'>
						<p className='text-sm text-[var(--color-text-secondary)]'>
							<strong>Cập nhật lần cuối:</strong> 04/11/2025
						</p>
						<Link
							to='/'
							className='inline-block mt-6 px-8 py-3 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium rounded-md hover:bg-[var(--color-btn-primary-hover-bg)] transition-colors'
						>
							Quay về Trang Chủ
						</Link>
					</section>
				</div>
			</div>
		</main>
	);
}

export default memo(TermsOfUse);
