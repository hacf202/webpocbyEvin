// src/components/common/PageTitle.jsx
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

/**
 * PageTitle - Component quản lý tiêu đề trang, SEO, OG, Twitter Card & JSON-LD
 *
 * @param {Object} props
 * @param {string} [props.title] - Tiêu đề chính (không cần thêm "| PoC Wiki")
 * @param {string} [props.description] - Mô tả ngắn cho SEO & chia sẻ
 * @param {string} [props.image] - URL ảnh đại diện (OG/Twitter)
 * @param {boolean} [props.noIndex=false] - Chặn index (admin, auth, dev)
 * @param {string} [props.locale='vi_VN'] - Ngôn ngữ trang (Open Graph)
 * @param {string} [props.type='website'] - Loại nội dung OG (website, article, ...)
 *
 * @example
 * <PageTitle
 *   title="Heimerdinger"
 *   description="Hướng dẫn build, cổ vật, relic tốt nhất cho Heimerdinger"
 *   image="/og/heimerdinger.jpg"
 *   type="article"
 * />
 */
export default function PageTitle({
	title = "",
	description = "",
	image = "",
	noIndex = false,
	locale = "vi_VN",
	type = "website",
}) {
	const location = useLocation();
	const siteName = "POC GUIDE";
	const baseUrl = window.location.origin;
	const canonicalUrl = `${baseUrl}${location.pathname}`;
	const fullTitle = title ? `${title} | ${siteName}` : siteName;

	// Fallback image nếu không có
	const defaultImage = `${baseUrl}/og-default.jpg`;
	const ogImage = image
		? image.startsWith("http")
			? image
			: `${baseUrl}${image}`
		: defaultImage;

	// Mô tả mặc định
	const defaultDescription =
		"Hướng dẫn con đường anh hùng: tướng, cổ vật, build, bộ cổ vật, hướng dẫn chi tiết.";
	const metaDescription = description || defaultDescription;

	// JSON-LD Schema.org (tăng khả năng hiển thị rich snippet)
	const jsonLd = {
		"@context": "https://schema.org",
		"@type": type === "article" ? "Article" : "WebPage",
		headline: title || siteName,
		description: metaDescription,
		url: canonicalUrl,
		image: ogImage,
		publisher: {
			"@type": "Organization",
			name: siteName,
			logo: {
				"@type": "ImageObject",
				url: `${baseUrl}/ahriicon.png`,
			},
		},
		inLanguage: locale.replace("_", "-"),
	};

	if (type === "article" && title) {
		jsonLd.name = title;
		jsonLd.author = { "@type": "Organization", name: siteName };
	}

	return (
		<Helmet>
			{/* ==================== TIÊU ĐỀ & NGÔN NGỮ ==================== */}
			<title>{fullTitle}</title>
			<html lang={locale.split("_")[0]} />
			<meta name='language' content={locale} />

			{/* ==================== SEO META ==================== */}
			<meta name='description' content={metaDescription} />
			{noIndex && <meta name='robots' content='noindex, nofollow' />}

			{/* ==================== CANONICAL & HREF LANG ==================== */}
			<link rel='canonical' href={canonicalUrl} />
			<link rel='alternate' hrefLang='vi' href={canonicalUrl} />
			<link rel='alternate' hrefLang='x-default' href={canonicalUrl} />

			{/* ==================== OPEN GRAPH ==================== */}
			<meta property='og:title' content={title || siteName} />
			<meta property='og:description' content={metaDescription} />
			<meta property='og:type' content={type} />
			<meta property='og:url' content={canonicalUrl} />
			<meta property='og:image' content={ogImage} />
			<meta property='og:image:alt' content={title || siteName} />
			<meta property='og:image:width' content='1200' />
			<meta property='og:image:height' content='630' />
			<meta property='og:locale' content={locale} />
			<meta property='og:site_name' content={siteName} />

			{/* ==================== TWITTER CARD ==================== */}
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={title || siteName} />
			<meta name='twitter:description' content={metaDescription} />
			<meta name='twitter:image' content={ogImage} />
			<meta name='twitter:image:alt' content={title || siteName} />
			<meta name='twitter:site' content='@pocguide' />
			<meta name='twitter:creator' content='@pocguide' />

			{/* ==================== JSON-LD STRUCTURED DATA ==================== */}
			<script type='application/ld+json'>
				{JSON.stringify(jsonLd, null, 2)}
			</script>

			{/* ==================== FAVICON & THEME COLOR ==================== */}
			<link rel='icon' href='/favicon.ico' />
			<meta name='theme-color' content='#1a1a2e' />
		</Helmet>
	);
}
