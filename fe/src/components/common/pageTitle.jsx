// src/components/common/PageTitle.jsx
import { Helmet } from "react-helmet-async";

/**
 * PageTitle - Component quản lý tiêu đề trang và meta tags (SEO + Social Sharing)
 *
 * @param {Object} props
 * @param {string} [props.title] - Tiêu đề chính của trang (không cần thêm "| PoC Wiki")
 *                              Ví dụ: "Danh Sách Tướng", "Heimerdinger"
 * @param {string} [props.description] - Mô tả ngắn cho SEO và chia sẻ
 * @param {string} [props.image] - URL ảnh đại diện (OG Image, Twitter Card)
 * @param {boolean} [props.noIndex=false] - Nếu true: chặn Google index trang (dùng cho admin, auth)
 *
 * @example
 * <PageTitle
 *   title="Danh Sách Tướng"
 *   description="Xem tất cả tướng trong Path of Champions"
 *   image="https://example.com/og-image.jpg"
 *   noIndex={false}
 * />
 */
export default function PageTitle({
	title,
	description,
	image,
	noIndex = false,
}) {
	// Tên website cố định
	const siteName = "GUIDE POC";

	// Tạo tiêu đề đầy đủ: "Tiêu đề | GUIDE POC" hoặc "GUIDE POC" nếu không có title
	const fullTitle = title ? `${title} | ${siteName}` : siteName;

	return (
		<Helmet>
			{/* ==================== TIÊU ĐỀ TRANG ==================== */}
			<title>{fullTitle}</title>

			{/* ==================== SEO META ==================== */}
			{description && <meta name='description' content={description} />}

			{/* Chặn index nếu là trang riêng tư (admin, login, v.v.) */}
			{noIndex && <meta name='robots' content='noindex, nofollow' />}

			{/* ==================== OPEN GRAPH (Facebook, Discord, v.v.) ==================== */}
			<meta property='og:title' content={title || siteName} />
			<meta
				property='og:description'
				content={
					description ||
					"Wiki Path of Champions: tướng, cổ vật, build, chiến thuật."
				}
			/>
			<meta property='og:type' content='website' />
			<meta property='og:url' content={window.location.href} />
			{image && <meta property='og:image' content={image} />}
			{image && <meta property='og:image:alt' content={title || siteName} />}

			{/* ==================== TWITTER CARD ==================== */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={title || siteName} />
			{description && <meta name='twitter:description' content={description} />}
			{image && <meta name='twitter:image' content={image} />}

			{/* ==================== CANONICAL URL (tránh trùng lặp nội dung) ==================== */}
			<link rel='canonical' href={window.location.href} />
		</Helmet>
	);
}
