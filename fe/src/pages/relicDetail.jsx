import { memo } from "react";
import { Link, useParams } from "react-router-dom";
import relicsData from "../assets/data/relics-vi_vn.json";
import championsData from "../assets/data/champions.json";

function RelicDetail() {
	const { relicCode } = useParams();
	const relic = relicsData.find(
		relic => relic.relicCode === decodeURIComponent(relicCode)
	);

	if (!relic) {
		return (
			<div
				className='p-4 sm:p-6'
				style={{ color: "var(--color-text-primary)" }}
			>
				Không tìm thấy thông tin cổ vật. Mã: {relicCode}
			</div>
		);
	}

	const compatibleChampions = championsData
		.filter(champion =>
			[1, 2, 3, 4, 5, 6].some(set =>
				champion[`defaultRelicsSet${set}`]?.some(r => r.S === relic.name)
			)
		)
		.map(champion => ({
			name: champion.name,
			image: champion.assets[0]?.M.avatar.S || "/images/placeholder.png",
		}));

	return (
		<div
			className='relative mx-auto max-w-[1200px] p-4 sm:p-6 rounded-lg mt-10'
			style={{
				backgroundColor: "var(--color-surface)",
				color: "var(--color-text-primary)",
			}}
		>
			<div
				className='flex flex-col md:flex-row gap-4 rounded-md p-2'
				style={{ backgroundColor: "var(--color-background)" }}
			>
				<img
					className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
					src={relic.assetAbsolutePath || "/images/placeholder.png"}
					alt={relic.name || "Unknown Relic"}
					loading='lazy'
				/>
				<div className='flex-1'>
					<div
						className='flex flex-col sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1'
						style={{ backgroundColor: "var(--color-background)" }}
					>
						<h1>{relic.name}</h1>
						<h1>ĐỘ HIẾM: {relic.rarity}</h1>
					</div>
					{relic.descriptionRaw && (
						<p
							className='text-base sm:text-xl mt-4 mx-1 rounded-lg overflow-y-auto h-60 p-2'
							style={{
								backgroundColor: "var(--color-surface)",
								border: "1px solid var(--color-border)",
								color: "var(--color-text-secondary)",
							}}
						>
							{relic.descriptionRaw}
						</p>
					)}
				</div>
			</div>

			<h2 className='text-xl sm:text-3xl font-semibold m-5'>
				Các tướng có thể dùng cổ vật
			</h2>
			{compatibleChampions.length > 0 ? (
				<div
					className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 rounded-md p-4'
					style={{ backgroundColor: "var(--color-background)" }}
				>
					{compatibleChampions.map((champion, index) => (
						<Link
							key={index}
							to={`/champion/${encodeURIComponent(champion.name)}`}
							className='rounded-lg p-4 transition'
							style={{
								backgroundColor: "var(--color-surface)",
								border: "1px solid var(--color-border)",
							}}
						>
							<img
								className='w-full max-w-[120px] h-auto mx-auto'
								src={champion.image}
								alt={champion.name}
								loading='lazy'
							/>
							<h3 className='text-base sm:text-lg font-semibold text-center mt-2'>
								{champion.name}
							</h3>
						</Link>
					))}
				</div>
			) : (
				<p
					className='text-base sm:text-lg rounded-md p-4'
					style={{ backgroundColor: "var(--color-background)" }}
				>
					Không có tướng nào sử dụng cổ vật này.
				</p>
			)}
		</div>
	);
}

export default memo(RelicDetail);
