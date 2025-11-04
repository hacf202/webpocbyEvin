// src/pages/AboutUs.jsx
import { memo } from "react";
import { Link } from "react-router-dom";

function AboutUs() {
	return (
		<main className='min-h-screen bg-[var(--color-page-bg)] py-12'>
			<div className='max-w-[900px] mx-auto px-4 sm:px-6'>
				{/* Tiêu đề */}
				<div className='text-center mb-12'>
					<h1 className='text-4xl sm:text-5xl font-bold text-[var(--color-text-primary)] mb-4'>
						Về{" "}
						<span className='text-[var(--color-primary-500)]'>Guide POC</span>
					</h1>
					<p className='text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto'>
						Hướng dẫn hoàn chỉnh cho chế độ <strong>Path of Champions</strong> –
						từ tôi người phát triền trang web{" "}
					</p>
				</div>

				{/* Nội dung chính */}
				<div className='prose prose-lg max-w-none text-[var(--color-text-secondary)] space-y-10 leading-relaxed'>
					{/* Giới thiệu tổng quan */}
					<section>
						<p className='text-base'>
							<strong>Guide POC</strong> là một trang web độc lập do người hâm
							mộ tạo ra nhằm hỗ trợ người chơi <i>Legends of Runeterra</i> chinh
							phục chế độ <strong>Path of Champions</strong> với những tài
							nguyên đáng tin cậy và dễ sử dụng. Chúng tôi{" "}
							<u>không liên kết với Riot Games</u> hay bất kỳ công ty con nào
							của Riot.
						</p>
						<p className='mt-4'>
							Nền tảng này được xây dựng{" "}
							<strong>bởi người chơi, vì người chơi</strong> — xuất phát từ niềm
							đam mê thuần túy dành cho cơ chế roguelike độc đáo của PoC và cộng
							đồng xung quanh.
						</p>
					</section>

					{/* Chúng tôi là ai */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							Chúng tôi là ai
						</h2>
						<p>
							<strong>Guide POC</strong> là một dự án độc lập do một nhóm nhỏ
							(chỉ có mình tôi :v) game thủ đam mê tại Việt Nam xây dựng.
						</p>
						<p className='mt-3'>
							Tôi bắt đầu chơi và trải nghiệm chế độ{" "}
							<strong>Con Đường Anh Hùng</strong> từ ngày nó mới bắt đầu , khi
							chế độ <i>Path of Champions</i> vừa ra mắt. Tôi từ tân binh bắt
							đầu niềm đam mê của mình — khám phá trải nghiệm nhiều tướng, nhiều
							bản đồ, tìm ra nhiều chiến thuật mới và tôi muốn chia sẻ nó đến
							với cộng đồng.
						</p>
						<p className='mt-3'>
							Chúng tôi ghi chép lại mọi thứ:{" "}
							<em>
								lối chơi nào tốt, cổ vật nào mạnh phù hợp ra sao với tướng, sức
								mạnh nào nên chọn ở mỗi ngã rẽ, tướng nào có thể vượt qua những
								thử thách khó khăn.
							</em>{" "}
							— và cùng nhau hoàn thiện qua mỗi bản cập nhật.
						</p>
						<p className='mt-3'>
							Đến khoảng <strong>tháng 4 2025</strong>, tôi nhận ra rằng những
							kiến thức tích lũy qua hàng ngàn lượt chơi có thể giúp rất nhiều
							người chơi — đặc biệt là những ai đang bối rối trước độ khó tăng
							dần của con đường anh hùng. Đó là lúc <strong>Guide POC</strong>{" "}
							chính thức ra đời.
						</p>
						<p className='mt-3'>
							Trang web được <strong>tôi sáng lập</strong> duy trì và quản lý,
							cùng với <strong>đóng góp thường xuyên</strong> từ những người
							chơi có cùng tinh thần tò mò, kiên trì và hợp tác.
						</p>
					</section>

					{/* Chúng tôi làm gì */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							Chúng tôi làm gì
						</h2>
						<p>
							<strong>Guide POC</strong> tập trung vào:
						</p>
						<ol className='list-decimal pl-6 mt-4 space-y-2 font-medium'>
							<li>
								Đề xuất <strong>bộ cổ vật</strong> tối ưu cho từng tướng
							</li>
							<li>
								Gợi ý <strong>cổ vật, sức mạnh, vật phẩm</strong> nào hữu ích và
								nên ưu tiên
							</li>
							<li>
								Hướng dẫn <strong>xây dựng lối chơi</strong> và combo các tướng
								với hiệu quả cao
							</li>
							<li>
								<strong>Cập nhật lối chơi </strong>sau mỗi bản cập nhật và mang
								đến các chiến thuật mới
							</li>
						</ol>
						<p className='mt-4'>
							Chúng tôi mong muốn cung cấp nội dung{" "}
							<strong>rõ ràng, không rườm rà, luôn được cập nhật</strong> và dễ
							tiếp cận cho cả người chơi mới lẫn kỳ cựu đang muốn nâng cao kỹ
							năng hoặc chia sẻ kiến thức.
						</p>
					</section>

					{/* Tại sao chúng tôi làm điều đó */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							Tại sao chúng tôi làm điều đó
						</h2>
						<p>
							Bởi vì chúng tôi <strong>yêu thích</strong> chế độ chơi này và tôi
							muốn có một nơi để chia sẻ đam mê của bản thân.
						</p>
						<p className='mt-3'>
							Trang web này ra đời để <strong>chia sẻ đam mê</strong> — của tôi
							đến mọi người, và của cộng đồng dành cho nhau.
						</p>
						<p className='mt-3'>
							Cảm ơn bạn đã ghé thăm. Nếu bạn thấy nội dung hữu ích, hãy chia sẻ
							với bạn bè — và nếu bạn muốn{" "}
							<strong>đóng góp các bộ cổ vật hay feedback</strong>, chúng tôi
							rất mong nhận được từ bạn.
						</p>
					</section>

					{/* Tại sao là “Guide POC”? */}
					<section>
						<h2 className='text-2xl font-bold text-[var(--color-text-primary)] mb-4'>
							Tại sao là “Guide POC”?
						</h2>
						<p>
							Chúng tôi chọn tên <strong>"Guide POC"</strong> đơn giản đây là
							trang web hướng dẫn dành riêng cho chế độ dành riêng cho độ này nó
							ngắn gọn và dễ nhớ.
						</p>
						<p className='mt-3'>
							<strong>“POC”</strong> là viết tắt của <i>Path of Champions</i> —
							chế độ đã đưa chúng tôi đến với nhau, nơi mỗi quyết định đều có
							thể thay đổi toàn bộ hành trình.
						</p>
						<p className='mt-3'>
							<strong>“Guide”</strong> thể hiện sứ mệnh: cung cấp{" "}
							<strong>lộ trình đáng tin cậy</strong> cho người chơi. Dù bạn là
							một nhà phiêu lưu mới hay một kỳ cựu đang hoàn thành tất cả tướng,
							chúng tôi đều muốn bạn có một <em>hành trình suôn sẻ</em>.
						</p>
						<p className='mt-3'>
							Cảm ơn bạn đã đồng hành cùng chúng tôi trên{" "}
							<strong>Con Đường Anh Hùng</strong>!
						</p>
					</section>

					{/* Call to action */}
					<section className='text-center pt-8'>
						<Link
							to='/'
							className='inline-block px-8 py-3 bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] font-medium rounded-md hover:bg-[var(--color-btn-primary-hover-bg)] transition-colors'
						>
							Quay về Trang Chủ
						</Link>
					</section>
				</div>
			</div>
		</main>
	);
}

export default memo(AboutUs);
