// src/pages/championDetail.jsx
import { memo, useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import iconRegions from "../../assets/data/iconRegions.json";
import { ChevronLeft } from "lucide-react";
import Button from "../common/button";
import { Loader2 } from "lucide-react";
import PageTitle from "../common/pageTitle";
import SafeImage from "../common/SafeImage";

const RenderItem = ({ item }) => {
	if (!item) return null;

	const getLinkPath = item => {
		if (item.powerCode) return `/power/${encodeURIComponent(item.powerCode)}`;
		if (item.relicCode) return `/relic/${encodeURIComponent(item.relicCode)}`;
		if (item.itemCode) return `/item/${encodeURIComponent(item.itemCode)}`;
		if (item.runeCode) return `/rune/${encodeURIComponent(item.runeCode)}`;
		return null;
	};

	const linkPath = getLinkPath(item);
	const imgSrc = item.image || "/fallback-image.svg";

	const content = (
		<div className='flex items-start gap-4 p-3 bg-surface-hover rounded-md border border-border h-full hover:border-primary-500 transition-colors'>
			<SafeImage
				src={imgSrc}
				alt={item.name}
				className='w-16 h-16 rounded-md'
				onError={e => {
					e.target.src = "/fallback-image.svg";
				}}
				loading='lazy'
			/>
			<div>
				<h3 className='font-semibold text-text-primary text-lg'>{item.name}</h3>
				{item.description && (
					<p
						className='text-md text-text-secondary mt-1'
						dangerouslySetInnerHTML={{ __html: item.description }}
					/>
				)}
			</div>
		</div>
	);

	return linkPath ? <Link to={linkPath}>{content}</Link> : content;
};

function ChampionDetail() {
	const { championID } = useParams(); // Đổi từ name → championID
	const navigate = useNavigate();

	const [champion, setChampion] = useState(null);
	const [powers, setPowers] = useState([]);
	const [items, setItems] = useState([]);
	const [relics, setRelics] = useState([]);
	const [runes, setRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const [champRes, powerRes, itemRes, relicRes, runeRes] =
					await Promise.all([
						fetch(`${apiUrl}/api/champions`),
						fetch(`${apiUrl}/api/powers`),
						fetch(`${apiUrl}/api/items`),
						fetch(`${apiUrl}/api/relics`),
						fetch(`${apiUrl}/api/runes`),
					]);

				if (
					![champRes, powerRes, itemRes, relicRes, runeRes].every(r => r.ok)
				) {
					throw new Error("Không thể tải dữ liệu từ server.");
				}

				const [championsJson, powersJson, itemsJson, relicsJson, runesJson] =
					await Promise.all([
						champRes.json(),
						powerRes.json(),
						itemRes.json(),
						relicRes.json(),
						runeRes.json(),
					]);

				// Tìm theo championID (String)
				const found = championsJson.find(c => c.championID === championID);
				if (!found) {
					setError(`Không tìm thấy tướng với ID: ${championID}`);
				} else {
					setChampion(found);
				}

				setPowers(powersJson);
				setItems(itemsJson);
				setRelics(relicsJson);
				setRunes(runesJson);
			} catch (err) {
				console.error("Lỗi tải dữ liệu:", err);
				setError(err.message || "Lỗi kết nối.");
			} finally {
				setLoading(false);
			}
		};

		if (championID) fetchData();
	}, [championID, apiUrl]);

	const findRegionIconLink = regionName => {
		const region = iconRegions.find(item => item.name === regionName);
		return region?.iconAbsolutePath || "/fallback-image.svg";
	};

	// === Xử lý dữ liệu mới (mảng string thường) ===
	const powerStarsFull = useMemo(() => {
		if (!champion?.powerStars || !Array.isArray(champion.powerStars)) return [];
		return (
			champion.powerStars
				.map(name => {
					const p = powers.find(x => x.name === name);
					return {
						name,
						image: p?.assetAbsolutePath || "/images/placeholder.png",
						description: p?.description || "",
						powerCode: p?.powerCode || null,
					};
				})
				// THÊM DÒNG NÀY: Lọc bỏ các item có tên rỗng hoặc null
				.filter(item => item.name && item.name.trim() !== "")
		);
	}, [champion, powers]);

	const adventurePowersFull = useMemo(() => {
		if (!champion?.adventurePowers || !Array.isArray(champion.adventurePowers))
			return [];
		return champion.adventurePowers
			.map(name => {
				const p = powers.find(x => x.name === name);
				return {
					name,
					image: p?.assetAbsolutePath || "/images/placeholder.png",
					description: p?.description || "",
					powerCode: p?.powerCode || null,
				};
			})
			.filter(item => item.name && item.name.trim() !== ""); // <--- Lọc rỗng
	}, [champion, powers]);

	// 2. Vật phẩm khuyên dùng (Items)
	const defaultItemsFull = useMemo(() => {
		if (!champion?.defaultItems || !Array.isArray(champion.defaultItems))
			return [];
		return champion.defaultItems
			.map(name => {
				const i = items.find(x => x.name === name);
				return {
					name,
					image: i?.assetAbsolutePath || "/images/placeholder.png",
					description: i?.description || "",
					itemCode: i?.itemCode || null,
				};
			})
			.filter(item => item.name && item.name.trim() !== ""); // <--- Lọc rỗng
	}, [champion, items]);

	// 3. Ngọc (Runes - Nếu có)
	const runesFull = useMemo(() => {
		if (!champion?.rune || !Array.isArray(champion.rune)) return [];
		return champion.rune
			.map(name => {
				const r = runes.find(x => x.name === name);
				return {
					name,
					image: r?.assetAbsolutePath || "/images/placeholder.png",
					description: r?.description || "",
					runeCode: r?.runeCode || null,
				};
			})
			.filter(item => item.name && item.name.trim() !== ""); // <--- Lọc rỗng
	}, [champion, runes]);

	// 4. Bộ cổ vật (Relics - Xử lý hơi khác vì nó lồng trong Set)
	const defaultRelicsSetsFull = useMemo(() => {
		if (!champion) return [];
		const sets = [];
		for (let i = 1; i <= 6; i++) {
			const key = `defaultRelicsSet${i}`;
			const arr = champion[key];
			if (Array.isArray(arr) && arr.length > 0) {
				const relicsInSet = arr
					.map(name => {
						const r = relics.find(x => x.name === name);
						return {
							name,
							image: r?.assetAbsolutePath || "/images/placeholder.png",
							description: r?.description || "",
							relicCode: r?.relicCode || null,
						};
					})
					// Thay đổi điều kiện filter ở đây chặt chẽ hơn
					.filter(r => r.name && r.name.trim() !== "");

				if (relicsInSet.length > 0) {
					sets.push({ setNumber: i, relics: relicsInSet });
				}
			}
		}
		return sets;
	}, [champion, relics]);

	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[600px] p-6 text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg'>Đang tải thông tin tướng...</p>
			</div>
		);
	}

	if (error || !champion) {
		return (
			<div className='p-6 text-center text-danger-text-dark'>
				<p className='text-xl font-semibold'>Không tìm thấy tướng</p>
				<p className='mt-2'>{error || `ID: ${championID}`}</p>
			</div>
		);
	}

	// Dùng trực tiếp videoLink trong dữ liệu tướng
	const videoLink =
		champion.videoLink || "https://www.youtube.com/embed/mZgnjMeTI5E";

	const isSpiritBlossom = champion.regions?.includes("Hoa Linh Lục Địa");

	return (
		<div>
			<PageTitle
				title={champion.name}
				description={`POC GUIDE: Build bộ cổ vật (Relic) tối ưu tier S/A cho ${champion.name} Path of Champions. Combo Epic/Rare/Common mạnh nhất, hiệu ứng chi tiết, cách farm & equip relic đánh boss dễ dàng!`}
				type='article'
			/>
			<div className='max-w-[1200px] mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button
					variant='outline'
					onClick={() => navigate(-1)}
					className='mb-3 sm:mb-4'
				>
					<ChevronLeft size={18} />
					Quay lại
				</Button>

				<div className='relative mx-auto max-w-[1200px] p-2 sm:p-6 rounded-lg bg-surface-bg text-text-primary font-secondary'>
					{/* Header */}
					<div className='flex flex-col md:flex-row border border-border gap-2 sm:gap-4 rounded-md bg-surface-hover p-2 sm:p-4'>
						<SafeImage
							className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
							src={
								champion.assets?.[0]?.gameAbsolutePath ||
								"/images/placeholder.png"
							}
							alt={champion.name}
							loading='lazy'
						/>
						<div className='flex-1 p-2'>
							<div className='flex flex-col sm:flex-row sm:justify-between rounded-lg p-2 m-1 gap-2'>
								<h1 className='text-2xl sm:text-4xl font-bold m-1 font-primary'>
									{champion.name}
								</h1>

								<div className='flex flex-wrap gap-2 mb-2 items-center'>
									<div className='flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-2 bg-yellow-500/20 border border-yellow-500 rounded-full shadow-sm'>
										<span className='text-sm sm:text-base font-bold text-yellow-900'>
											{champion.maxStar}
										</span>
										<svg
											className='w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 fill-current'
											viewBox='0 0 20 20'
										>
											<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
										</svg>
									</div>

									<div className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-600 border-2 border-white rounded-full shadow-md'>
										<span className='text-white text-xs sm:text-sm font-bold'>
											{champion.cost}
										</span>
									</div>

									{champion.regions?.map((region, index) => (
										<div
											key={index}
											className='flex items-center gap-1 px-2 py-1 rounded'
										>
											<SafeImage
												src={findRegionIconLink(region)}
												alt={region}
												className='w-10 h-10 sm:w-12 sm:h-12'
												loading='lazy'
											/>
										</div>
									))}
								</div>
							</div>

							{champion.description && (
								<div className='mt-3 sm:mt-4 mx-1'>
									<div
										className={`text-sm sm:text-xl rounded-lg p-3 sm:p-4 transition-all duration-300 border bg-surface-bg text-text-secondary ${
											!isDescriptionExpanded
												? "overflow-y-auto h-48 sm:h-60"
												: "h-auto"
										}`}
									>
										{/* XỬ LÝ CẢ \n THẬT VÀ \\n DO ESCAPE */}
										{champion.description
											.replace(/\\n/g, "\n") // chuyển \\n → xuống dòng thật
											.split(/\r?\n/) // tách theo xuống dòng
											.map((line, i) => (
												<p key={i} className={i > 0 ? "mt-3" : ""}>
													{line || (
														<span className='text-transparent'>empty</span>
													)}
												</p>
											))}
									</div>

									<button
										onClick={() =>
											setIsDescriptionExpanded(!isDescriptionExpanded)
										}
										className='text-xs sm:text-sm font-semibold mt-2 px-3 py-1 rounded text-primary-500 hover:bg-surface-hover transition'
									>
										{isDescriptionExpanded ? "Thu gọn" : "Hiển thị toàn bộ"}
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Video – dùng trực tiếp videoLink */}
					<h2 className='text-lg sm:text-3xl font-semibold mt-4 sm:mt-6 text-text-primary font-primary'>
						Video giới thiệu
					</h2>
					<div className='flex justify-center mb-4 sm:mb-6 p-2 sm:p-4 aspect-video bg-surface-hover rounded-lg'>
						<iframe
							width='100%'
							height='100%'
							src={videoLink}
							title='Champion Video'
							frameBorder='0'
							allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
							allowFullScreen
						></iframe>
					</div>

					{/* Các phần còn lại giữ nguyên 100% như cũ */}
					{defaultRelicsSetsFull.some(set => set.relics?.length > 0) && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold m-3 sm:m-5 text-text-primary font-primary'>
								Bộ cổ vật
							</h2>
							<div className='grid grid-cols-1 gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{defaultRelicsSetsFull.map(set => (
									<div
										className='rounded-lg m-1 w-full bg-surface-bg border border-border'
										key={set.setNumber}
									>
										<h3 className='text-sm sm:text-xl font-semibold p-2 sm:p-3 text-text-primary'>
											Bộ cổ vật {set.setNumber}
										</h3>
										<div className='grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-3 pt-0'>
											{set.relics.map((relic, index) => (
												<RenderItem key={index} item={relic} />
											))}
										</div>
									</div>
								))}
							</div>
						</>
					)}

					{powerStarsFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold pl-1 m-3 sm:m-5 text-text-primary font-primary'>
								Chòm sao
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{powerStarsFull.map((power, index) => (
									<RenderItem key={index} item={power} />
								))}
							</div>
						</>
					)}

					{isSpiritBlossom && runesFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold m-3 sm:m-5 text-text-primary font-primary'>
								Ngọc
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{runesFull.map((rune, index) => (
									<RenderItem key={index} item={rune} />
								))}
							</div>
						</>
					)}

					{adventurePowersFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold m-3 sm:m-5 text-text-primary font-primary'>
								Sức mạnh khuyên dùng
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{adventurePowersFull.map((power, index) => (
									<RenderItem key={index} item={power} />
								))}
							</div>
						</>
					)}

					{defaultItemsFull.length > 0 && (
						<>
							<h2 className='text-lg sm:text-3xl font-semibold m-3 sm:m-5 text-text-primary font-primary'>
								Vật phẩm khuyên dùng
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-4 rounded-md p-2 sm:p-4 bg-surface-hover'>
								{defaultItemsFull.map((item, index) => (
									<RenderItem key={index} item={item} />
								))}
							</div>
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionDetail);
