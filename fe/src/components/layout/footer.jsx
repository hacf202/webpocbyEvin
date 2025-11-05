// src/components/Footer.jsx
import { memo } from "react";
import LogoBlack from "../../../public/ahriicon.png";
import { Youtube, Facebook } from "lucide-react";

function Footer() {
	return (
		<footer className=' bg-[var(--color-footer-bg)] text-[var(--color-footer-text)] pt-4 border-t border-[var(--color-border)] '>
			<div className=' mx-auto px-4 sm:px-6'>
				<div className='grid grid-cols-1 md:grid-cols-12 gap-8 mb-10'>
					{/* === CỘT 1: Logo & Mô tả === */}
					<div className='md:col-span-3'>
						<a href='/' className='inline-block mb-4'>
							<img
								src={LogoBlack}
								alt='Genshin Guide Logo'
								className='h-10 w-auto'
								loading='lazy'
							/>
						</a>
						<p className='text-sm leading-relaxed'>
							<b className='font-bold'>GUIDE POC (Path of champions)</b> là kho
							tài nguyên độc lập do cộng đồng người chơi chia sẻ.
						</p>
						<p className='text-sm leading-relaxed mt-2'>
							<i className='italic'>Path of champions</i> hay Con Đường Anh Hùng
							là tựa chế độ chơi PVE của Huyền Thoại Runeterra do Riot phát
							triển. Tất cả nội dung build, hướng dẫn, hình ảnh đều được tạo ra
							bởi fan và dành cho fan.
						</p>
					</div>

					{/* === CỘT 2: Hướng dẫn === */}
					<div className='md:col-span-2'>
						<h3 className='font-bold text-lg mb-4 text-[var(--color-footer-text)]'>
							Hướng dẫn
						</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<a
									href='/champions'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									Danh Sách Tướng
								</a>
							</li>
							<li>
								<a
									href='/builds'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									Hướng Dẫn Build Tướng
								</a>
							</li>
							<li>
								<a
									href='/powers'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									Danh sách sức mạnh
								</a>
							</li>
							<li>
								<a
									href='/relics'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									Danh sách cổ vật
								</a>
							</li>
						</ul>
					</div>

					{/* === CỘT 3: Giới thiệu === */}
					<div className='md:col-span-2'>
						<h3 className='font-bold text-lg mb-4 text-[var(--color-footer-text)]'>
							Giới thiệu về GUIDE POC
						</h3>
						<ul className='space-y-2 text-sm'>
							<li>
								<a
									href='/about-us'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									Về Chúng Tôi
								</a>
							</li>
							<li>
								<a
									href='/introduction'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									Giới Thiệu
								</a>
							</li>
							<li>
								<a
									href='/terms-of-use'
									className='hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									Điều Khoản Sử Dụng
								</a>
							</li>
						</ul>
					</div>

					{/* === CỘT 4: Theo dõi & Form === */}
					<div className='md:col-span-5'>
						<h3 className='font-bold text-lg mb-4 text-[var(--color-footer-text)]'>
							Theo dõi chúng tôi
						</h3>

						{/* Social Links */}
						<ul className='flex gap-4 mb-6'>
							<li>
								<a
									href='https://www.facebook.com/lkinh.djack/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-[var(--color-footer-link)] hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									<Facebook className='inline-block mr-1' />
									Facebook
								</a>
							</li>
							<li>
								<a
									href='https://www.youtube.com/@Evin0126'
									target='_blank'
									rel='noopener noreferrer'
									className='text-[var(--color-footer-link)] hover:text-[var(--color-footer-link-hover)] transition-colors'
								>
									<Youtube className='inline-block mr-1' />
									Youtube
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default memo(Footer);
