import { memo, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import championsData from "../assets/data/champions.json";
import iconRegions from "../assets/data/iconRegions.json";
import powers from "../assets/data/powers-vi_vn.json";
import items from "../assets/data/items-vi_vn.json";
import relics from "../assets/data/relics-vi_vn.json";
import runes from "../assets/data/runes-vi_vn.json"; // Giả định có tệp dữ liệu cho ngọc
import championVideoLinks from "../assets/data/linkChampionVideo.json";

// --- RenderItem Component (Cập nhật để hỗ trợ ngọc) ---
const RenderItem = ({ item }) => {
	if (!item) return null;

	// Hàm để xác định đường dẫn liên kết dựa trên loại của item
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
			return `/rune/${encodeURIComponent(item.runeCode)}`; // Thêm xử lý cho runeCode
		}
		// Thêm các trường hợp khác nếu cần
		return null;
	};

	const linkPath = getLinkPath(item);
	const imgSrc = item.image || "/images/placeholder.png";

	// Nội dung của item
	const content = (
		<div className='flex items-start gap-4 p-3 bg-[var(--color-background)] rounded-md border border-[var(--color-border)] h-full hover:bg-[var(--color-build-summary-shadow)] transition'>
			<img
				src={imgSrc}
				alt={item.name}
				className='w-30 h- rounded-md'
				onError={e => {
					e.target.src = "/images/placeholder.png";
				}}
				loading='lazy'
			/>
			<div>
				<h3 className='font-semibold text-[var(--color-text-primary)] text-lg'>
					{item.name}
				</h3>
				{item.description && (
					<p
						className='text-md text-[var(--color-text-secondary)] mt-1 '
						dangerouslySetInnerHTML={{ __html: item.description }}
					/>
				)}
			</div>
		</div>
	);

	// Nếu có đường dẫn, bọc nội dung trong thẻ Link
	return linkPath ? <Link to={linkPath}>{content}</Link> : content;
};

function ChampionDetail() {
	const { name } = useParams();
	const champion = championsData.find(champ => champ.name === name);

	// Helper function to find region icon
	const findRegionIconLink = regionName => {
		const region = iconRegions.find(item => item.name === regionName);
		return region?.iconAbsolutePath || "/images/default-icon.png";
	};

	// Sử dụng useMemo để xử lý và chuẩn bị dữ liệu một lần
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
	}, [champion]);

	const adventurePowersFull = useMemo(() => {
		if (!champion?.adventurePowers) return [];
		return champion.adventurePowers
			.filter(power => power.S) // Lọc ra các power có tên không rỗng
			.map(power => {
				const powerData = powers.find(p => p.name === power.S);
				return {
					name: power.S,
					image: powerData?.assetAbsolutePath || "/images/placeholder.png",
					description: powerData?.description || "",
					powerCode: powerData?.powerCode || null,
				};
			});
	}, [champion]);

	const defaultItemsFull = useMemo(() => {
		if (!champion?.defaultItems) return [];
		return champion.defaultItems
			.filter(item => item.S) // Lọc ra các item có tên không rỗng
			.map(item => {
				const itemData = items.find(i => i.name === item.S);
				return {
					name: item.S,
					image: itemData?.assetAbsolutePath || "/images/placeholder.png",
					description: itemData?.description || "",
					itemCode: itemData?.itemCode || null,
				};
			});
	}, [champion]);

	// Dữ liệu ngọc cho tướng Hoa Linh Lục Địa
	const runesFull = useMemo(() => {
		if (!champion?.rune) return [];
		return champion.rune
			.filter(rune => rune.S) // Lọc ra các rune có tên không rỗng
			.map(rune => {
				const runeData = runes.find(r => r.name === rune.S);
				return {
					name: rune.S,
					image: runeData?.assetAbsolutePath || "/images/placeholder.png",
					description: runeData?.description || "",
					runeCode: runeData?.runeCode || null, // Giả định rune có runeCode
				};
			});
	}, [champion]);

	const defaultRelicsSetsFull = useMemo(() => {
		if (!champion) return [];
		const sets = [];
		for (let i = 1; i <= 6; i++) {
			const setName = `defaultRelicsSet${i}`;
			if (champion[setName] && champion[setName].some(relic => relic.S)) {
				const relicsInSet = champion[setName]
					.filter(relic => relic.S) // Lọc ra các relic có tên không rỗng
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
	}, [champion]);

	if (!champion) {
		return (
			<div
				className='p-4 sm:p-6'
				style={{ color: "var(--color-text-primary)" }}
			>
				Không tìm thấy thông tin tướng. Name: {name}
			</div>
		);
	}

	const videoLink =
		championVideoLinks.find(video => video.name === name)?.link ||
		"https://www.youtube.com/embed/dQw4w9WgXcQ";

	const isSpiritBlossom = champion.regions.includes("Hoa Linh Lục Địa");

	return (
		<div
			className='relative mx-auto max-w-[1200px] p-4 sm:p-6 rounded-lg mt-10'
			style={{
				backgroundColor: "var(--color-surface)",
				color: "var(--color-text-primary)",
			}}
		>
			{/* Champion Header */}
			<div
				className='flex flex-col md:flex-row gap-4 rounded-md'
				style={{ backgroundColor: "var(--color-background)" }}
			>
				<img
					className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
					src={
						champion.assets[0]?.M.gameAbsolutePath.S ||
						"/images/placeholder.png"
					}
					alt={champion.name || "Unknown Champion"}
					loading='lazy'
				/>
				<div className='flex-1 p-2'>
					<div
						className='flex flex-col sm:flex-row sm:justify-between rounded-lg px-2'
						style={{ backgroundColor: "var(--color-background)" }}
					>
						<div className='flex flex-col sm:flex-row sm:items-center sm:gap-4'>
							<div
								className='text-2xl sm:text-4xl font-bold m-1'
								style={{ color: "var(--color-text-primary)" }}
							>
								{champion.name}
							</div>
						</div>
						<div className='flex flex-row items-center'>
							<div
								className='text-2xl sm:text-4xl font-bold m-1'
								style={{ color: "var(--color-text-secondary)" }}
							>
								MAX STAR: {champion.maxStar}
							</div>
							<div className='gap-2 flex'>
								{champion.regions &&
									champion.regions.map((region, index) => (
										<img
											className='w-8 sm:w-12'
											key={index}
											src={findRegionIconLink(region)}
											alt={region}
											loading='lazy'
										/>
									))}
							</div>
						</div>
					</div>
					{champion.description && (
						<p
							className='text-base sm:text-xl mt-4 mx-1 rounded-lg overflow-y-auto h-60 p-2'
							style={{
								backgroundColor: "var(--color-background)",
								color: "var(--color-text-secondary)",
								border: "1px solid var(--color-border)",
							}}
						>
							{champion.description}
						</p>
					)}
				</div>
			</div>

			{/* Video Section */}
			<h2
				className='text-xl sm:text-3xl font-semibold mt-6'
				style={{ color: "var(--color-text-primary)" }}
			>
				Video giới thiệu
			</h2>
			<div>
				<h3
					className='text-sm sm:text-lg font-semibold my-1'
					style={{ color: "var(--color-text-secondary)" }}
				>
					Đăng ký kênh Evin LoR tại:{" "}
					<a
						href='https://www.youtube.com/@Evin0126/'
						target='_blank'
						className='underline'
						style={{ color: "var(--color-text-link)" }}
						rel='noopener noreferrer'
					>
						https://www.youtube.com/@Evin0126/
					</a>
				</h3>
				<div
					className='flex justify-center mb-6 p-4 aspect-video'
					style={{ backgroundColor: "var(--color-background)" }}
				>
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

			{/* Power Stars Section */}
			<h2
				className='text-xl sm:text-3xl font-semibold pl-1 m-5'
				style={{ color: "var(--color-text-primary)" }}
			>
				Chòm sao
			</h2>
			{powerStarsFull.length > 0 && (
				<div
					className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4'
					style={{ backgroundColor: "var(--color-background)" }}
				>
					{powerStarsFull.map((power, index) => (
						<RenderItem key={index} item={power} />
					))}
				</div>
			)}

			{/* Rune Section - Hiển thị có điều kiện */}
			{isSpiritBlossom && runesFull.length > 0 && (
				<>
					<h2
						className='text-xl sm:text-3xl font-semibold m-5'
						style={{ color: "var(--color-text-primary)" }}
					>
						Ngọc
					</h2>
					<div
						className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4'
						style={{ backgroundColor: "var(--color-background)" }}
					>
						{runesFull.map((rune, index) => (
							<RenderItem key={index} item={rune} />
						))}
					</div>
				</>
			)}

			{/* Adventure Powers Section */}
			<h2
				className='text-xl sm:text-3xl font-semibold m-5'
				style={{ color: "var(--color-text-primary)" }}
			>
				Sức mạnh khuyên dùng
			</h2>
			{adventurePowersFull.length > 0 && (
				<div
					className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4'
					style={{ backgroundColor: "var(--color-background)" }}
				>
					{adventurePowersFull.map((power, index) => (
						<RenderItem key={index} item={power} />
					))}
				</div>
			)}

			{/* Default Items Section */}
			<h2
				className='text-xl sm:text-3xl font-semibold m-5'
				style={{ color: "var(--color-text-primary)" }}
			>
				Vật phẩm khuyên dùng
			</h2>
			{defaultItemsFull.length > 0 && (
				<div
					className='grid grid-cols-1 md:grid-cols-2 gap-4 rounded-md p-4'
					style={{ backgroundColor: "var(--color-background)" }}
				>
					{defaultItemsFull.map((item, index) => (
						<RenderItem key={index} item={item} />
					))}
				</div>
			)}

			{/* Relic Sets Section */}
			<h2
				className='text-xl sm:text-3xl font-semibold m-5'
				style={{ color: "var(--color-text-primary)" }}
			>
				Bộ cổ vật
			</h2>
			<div
				className='grid grid-cols-1 gap-4 rounded-md p-4'
				style={{ backgroundColor: "var(--color-background)" }}
			>
				{defaultRelicsSetsFull.map(set => (
					<div
						className='rounded-lg m-1 w-full'
						key={set.setNumber}
						style={{
							backgroundColor: "var(--color-surface)",
							border: "1px solid var(--color-border)",
						}}
					>
						<h3
							className='text-base sm:text-xl font-semibold p-3'
							style={{ color: "var(--color-text-primary)" }}
						>
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
	);
}

export default memo(ChampionDetail);
