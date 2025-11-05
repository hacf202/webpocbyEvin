import { memo, useMemo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import iconRegions from "../../assets/data/iconRegions.json";
import championVideoLinks from "../../assets/data/linkChampionVideo.json";
import { ChevronLeft } from "lucide-react";
import Button from "../common/button";
import { Loader2 } from "lucide-react";
import PageTitle from "../common/pageTitle";

// --- RenderItem Component ---
const RenderItem = ({ item }) => {
	if (!item) return null;

	const getLinkPath = item => {
		if (item.powerCode) {
			return `/power/${encodeURIComponent(item.powerCode)}`;
		}
		if (item.relicCode) {
			return `/relic/${encodeURIComponent(item.relicCode)}`;
		}
		if (item.itemCode) {
			return `/item/${encodeURIComponent(item.itemCode)}`;
		}
		if (item.runeCode) {
			return `/rune/${encodeURIComponent(item.runeCode)}`;
		}
		return null;
	};

	const linkPath = getLinkPath(item);
	const imgSrc = item.image || "/images/placeholder.png";

	const content = (
		<div className='flex items-start gap-4 p-3 bg-surface-hover rounded-md border border-border h-full hover:border-primary-500 transition-colors'>
			<img
				src={imgSrc}
				alt={item.name}
				className='w-16 h-16 rounded-md' // Đã sửa w-30 (không tồn tại) thành w-16
				onError={e => {
					e.target.src = "/images/placeholder.png";
				}}
				loading='lazy'
			/>
			<div>
				<h3 className='font-semibold text-text-primary text-lg'>{item.name}</h3>
				{item.description && (
					<p
						className='text-md text-text-secondary mt-1 '
						dangerouslySetInnerHTML={{ __html: item.description }}
					/>
				)}
			</div>
		</div>
	);

	return linkPath ? <Link to={linkPath}>{content}</Link> : content;
};

function ChampionDetail() {
	const { name } = useParams();
	const navigate = useNavigate();

	const [champion, setChampion] = useState(null);
	const [championsData, setChampionsData] = useState([]);
	const [powers, setPowers] = useState([]);
	const [items, setItems] = useState([]);
	const [relics, setRelics] = useState([]);
	const [runes, setRunes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

	const apiUrl = import.meta.env.VITE_API_URL;

	// --- Gọi API thay thế import JSON ---
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const decodedName = decodeURIComponent(name);

				const [championsRes, powersRes, itemsRes, relicsRes, runesRes] =
					await Promise.all([
						fetch(`${apiUrl}/api/champions`),
						fetch(`${apiUrl}/api/powers`),
						fetch(`${apiUrl}/api/items`),
						fetch(`${apiUrl}/api/relics`),
						fetch(`${apiUrl}/api/runes`),
					]);

				if (
					![championsRes, powersRes, itemsRes, relicsRes, runesRes].every(
						r => r.ok
					)
				) {
					throw new Error("Không thể tải dữ liệu từ server.");
				}

				const [championsJson, powersJson, itemsJson, relicsJson, runesJson] =
					await Promise.all([
						championsRes.json(),
						powersRes.json(),
						itemsRes.json(),
						relicsRes.json(),
						runesRes.json(),
					]);

				const found = championsJson.find(ch => ch.name === decodedName);
				if (!found) {
					setError(`Không tìm thấy tướng: ${decodedName}`);
					setChampion(null);
				} else {
					setChampion(found);
				}

				setChampionsData(championsJson);
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

		if (name) fetchData();
	}, [name, apiUrl]);

	const findRegionIconLink = regionName => {
		const region = iconRegions.find(item => item.name === regionName);
		return region?.iconAbsolutePath || "/images/default-icon.png";
	};

	const powerStarsFull = useMemo(() => {
		if (!champion?.powerStars) return [];
		return champion.powerStars.map(power => {
			const powerData = powers.find(p => p.name === power.S);
			return {
				name: power.S,
				image: powerData?.assetAbsolutePath || "/images/placeholder.png",
				description: powerData?.description || "",
				powerCode: powerData?.powerCode || null,
			};
		});
	}, [champion, powers]);

	const adventurePowersFull = useMemo(() => {
		if (!champion?.adventurePowers) return [];
		return champion.adventurePowers
			.filter(power => power.S)
			.map(power => {
				const powerData = powers.find(p => p.name === power.S);
				return {
					name: power.S,
					image: powerData?.assetAbsolutePath || "/images/placeholder.png",
					description: powerData?.description || "",
					powerCode: powerData?.powerCode || null,
				};
			});
	}, [champion, powers]);

	const defaultItemsFull = useMemo(() => {
		if (!champion?.defaultItems) return [];
		return champion.defaultItems
			.filter(item => item.S)
			.map(item => {
				const itemData = items.find(i => i.name === item.S);
				return {
					name: item.S,
					image: itemData?.assetAbsolutePath || "/images/placeholder.png",
					description: itemData?.description || "",
					itemCode: itemData?.itemCode || null,
				};
			});
	}, [champion, items]);

	const runesFull = useMemo(() => {
		if (!champion?.rune) return [];
		return champion.rune
			.filter(rune => rune.S)
			.map(rune => {
				const runeData = runes.find(r => r.name === rune.S);
				return {
					name: rune.S,
					image: runeData?.assetAbsolutePath || "/images/placeholder.png",
					description: runeData?.description || "",
					runeCode: runeData?.runeCode || null,
				};
			});
	}, [champion, runes]);

	const defaultRelicsSetsFull = useMemo(() => {
		if (!champion) return [];
		const sets = [];
		for (let i = 1; i <= 6; i++) {
			const setName = `defaultRelicsSet${i}`;
			if (champion[setName] && champion[setName].some(relic => relic.S)) {
				const relicsInSet = champion[setName]
					.filter(relic => relic.S)
					.map(relic => {
						const relicData = relics.find(r => r.name === relic.S);
						return {
							name: relic.S,
							image: relicData?.assetAbsolutePath || "/images/placeholder.png",
							description: relicData?.description || "",
							relicCode: relicData?.relicCode || null,
						};
					});
				if (relicsInSet.length > 0) {
					sets.push({
						setNumber: i,
						relics: relicsInSet,
					});
				}
			}
		}
		return sets;
	}, [champion, relics]);

	// Loading (ĐÃ ĐỒNG BỘ)
	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[600px] p-6 text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg'>Đang tải thông tin tướng...</p>
			</div>
		);
	}

	// Error (ĐÃ ĐỒNG BỘ)
	if (error || !champion) {
		return (
			<div className='p-6 text-center text-danger-text-dark'>
				<p className='text-xl font-semibold'>Không tìm thấy tướng</p>
				<p className='mt-2'>{error || `Tên: ${decodeURIComponent(name)}`}</p>
			</div>
		);
	}

	const videoLink =
		championVideoLinks.find(video => video.name === champion.name)?.link ||
		"https://www.youtube.com/embed/dQw4w9WgXcQ";

	const isSpiritBlossom = champion.regions.includes("Hoa Linh Lục Địa");

	return (
		<div>
			<PageTitle
				title={champion.name}
				description={`GUIDE POC: chi tiết tướng ${champion.name}`}
			/>
			<div className='max-w-[1200px] mx-auto p-4 md:p-6 text-text-primary font-secondary'>
				{/* Back Button */}
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} />
					Quay lại
				</Button>
				<div className='relative mx-auto max-w-[1200px] p-4 sm:p-6 rounded-lg bg-surface-bg text-text-primary font-secondary'>
					{/* Champion Header */}
					<div className='flex flex-col md:flex-row border border-border gap-4 rounded-md bg-surface-hover p-4'>
						<img
							className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
							src={
								champion.assets?.[0]?.M?.gameAbsolutePath?.S ||
								"/images/placeholder.png"
							}
							alt={champion.name}
							loading='lazy'
						/>
						<div className='flex-1 p-2'>
							<div className='flex flex-col sm:flex-row sm:justify-between rounded-lg p-2 m-1'>
								<h1 className='text-2xl sm:text-4xl font-bold m-1 font-primary'>
									{champion.name}
								</h1>
								<div className='flex flex-wrap gap-2 mb-2'>
									{champion.regions.map((region, index) => (
										<div
											key={index}
											className='flex items-center gap-1 px-2 py-1 rounded'
										>
											<img
												src={findRegionIconLink(region)}
												alt={region}
												className='w-12 h-12'
												loading='lazy'
											/>
										</div>
									))}
								</div>
							</div>

							{/* Mô tả với nút mở rộng */}
							{champion.description && (
								<div className='mt-4 mx-1'>
									<p
										className={`text-base sm:text-xl rounded-lg p-4 transition-all duration-300 border bg-surface-bg text-text-secondary ${
											!isDescriptionExpanded ? "overflow-y-auto h-60" : "h-auto"
										}`}
										style={{ whiteSpace: "pre-line" }}
									>
										{champion.description}
									</p>
									<button
										onClick={() =>
											setIsDescriptionExpanded(!isDescriptionExpanded)
										}
										className='text-sm font-semibold mt-2 px-3 py-1 rounded text-primary-500 hover:bg-surface-hover transition'
									>
										{isDescriptionExpanded ? "Thu gọn" : "Hiển thị toàn bộ"}
									</button>
								</div>
							)}
						</div>
					</div>

					{/* Video Section */}
					<h2 className='text-xl sm:text-3xl font-semibold mt-6 text-text-primary font-primary'>
						Video giới thiệu
					</h2>
					<div>
						<h3 className='text-sm sm:text-lg font-semibold my-1 text-text-secondary'>
							Đăng ký kênh Evin LoR tại:{" "}
							<a
								href='https://www.youtube.com/@Evin0126/'
								target='_blank'
								className='underline text-primary-500'
								rel='noopener noreferrer'
							>
								https://www.youtube.com/@Evin0126/
							</a>
						</h3>
						<div className='flex justify-center mb-6 p-4 aspect-video bg-surface-hover rounded-lg'>
							<iframe
								width='100%'
								height='100%'
								src={videoLink}
								title='YouTube video player'
								frameBorder='0'
								allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
								referrerPolicy='strict-origin-when-cross-origin'
								allowFullScreen
							></iframe>
						</div>
					</div>

					{/* Power Stars */}
					<h2 className='text-xl sm:text-3xl font-semibold pl-1 m-5 text-text-primary font-primary'>
						Chòm sao
					</h2>
					{powerStarsFull.length > 0 && (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4 bg-surface-hover'>
							{powerStarsFull.map((power, index) => (
								<RenderItem key={index} item={power} />
							))}
						</div>
					)}

					{/* Rune - Chỉ Hoa Linh */}
					{isSpiritBlossom && runesFull.length > 0 && (
						<>
							<h2 className='text-xl sm:text-3xl font-semibold m-5 text-text-primary font-primary'>
								Ngọc
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4 bg-surface-hover'>
								{runesFull.map((rune, index) => (
									<RenderItem key={index} item={rune} />
								))}
							</div>
						</>
					)}

					{/* Adventure Powers */}
					<h2 className='text-xl sm:text-3xl font-semibold m-5 text-text-primary font-primary'>
						Sức mạnh khuyên dùng
					</h2>
					{adventurePowersFull.length > 0 && (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4 bg-surface-hover'>
							{adventurePowersFull.map((power, index) => (
								<RenderItem key={index} item={power} />
							))}
						</div>
					)}

					{/* Default Items */}
					<h2 className='text-xl sm:text-3xl font-semibold m-5 text-text-primary font-primary'>
						Vật phẩm khuyên dùng
					</h2>
					{defaultItemsFull.length > 0 && (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4 bg-surface-hover'>
							{defaultItemsFull.map((item, index) => (
								<RenderItem key={index} item={item} />
							))}
						</div>
					)}

					{/* Relic Sets */}
					<h2 className='text-xl sm:text-3xl font-semibold m-5 text-text-primary font-primary'>
						Bộ cổ vật
					</h2>
					<div className='grid grid-cols-1 gap-4 rounded-md p-4 bg-surface-hover'>
						{defaultRelicsSetsFull.map(set => (
							<div
								className='rounded-lg m-1 w-full bg-surface-bg border border-border'
								key={set.setNumber}
							>
								<h3 className='text-base sm:text-xl font-semibold p-3 text-text-primary'>
									Bộ cổ vật {set.setNumber}
								</h3>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4 p-3 pt-0'>
									{set.relics.map((relic, index) => (
										<RenderItem key={index} item={relic} />
									))}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionDetail);
