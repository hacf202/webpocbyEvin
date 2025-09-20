import { memo, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import RelicRarityFilter from "../components/relic/RelicRarityFilter";
import RelicSortFilter from "../components/relic/RelicSortFilter";
import RelicFilter from "../components/relic/RelicFilter";
import relicsData from "../assets/data/relics-vi_vn.json";

function Relics() {
	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("relicsSearchTerm") || ""
	);
	const [selectedRarity, setSelectedRarity] = useState(
		() => localStorage.getItem("relicsSelectedRarity") || ""
	);
	const [sortOrder, setSortOrder] = useState(
		() => localStorage.getItem("relicsSortOrder") || "asc"
	);

	const uniqueRarities = useMemo(() => {
		const rarities = [...new Set(relicsData.map(relic => relic.rarity))];
		return rarities.sort();
	}, []);

	const rarityOrder = useMemo(
		() => ({
			THƯỜNG: 0,
			HIẾM: 1,
			"SỬ THI": 2,
		}),
		[]
	);

	const filteredRelics = useMemo(() => {
		return relicsData.filter(relic => {
			const matchesSearch = (relic.name || "")
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesRarity = !selectedRarity || relic.rarity === selectedRarity;
			return matchesSearch && matchesRarity;
		});
	}, [searchTerm, selectedRarity]);

	const sortedRelics = useMemo(() => {
		return [...filteredRelics].sort((a, b) => {
			const rarityA = rarityOrder[a.rarity] || 0;
			const rarityB = rarityOrder[b.rarity] || 0;
			if (sortOrder === "asc") {
				return (a.name || "").localeCompare(b.name || "");
			} else if (sortOrder === "desc") {
				return (b.name || "").localeCompare(a.name || "");
			} else if (sortOrder === "rarityAsc") {
				return rarityA - rarityB;
			} else if (sortOrder === "rarityDesc") {
				return rarityB - rarityA;
			}
			return 0;
		});
	}, [filteredRelics, sortOrder, rarityOrder]);

	return (
		<div className='relative mx-auto max-w-[1200px] p-4 sm:p-6 bg-gray-900 rounded-lg mt-10 text-white'>
			<h1 className='text-2xl sm:text-4xl font-bold mb-6 text-center'>
				Danh sách cổ vật
			</h1>
			<div className='mt-6 p-4 sm:p-6'>
				{/* Bộ lọc và tìm kiếm */}
				<div className='mb-6 flex flex-col gap-4 bg-gray-800 p-4 rounded-lg'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<RelicFilter onSearchChange={setSearchTerm} />
						<RelicRarityFilter
							uniqueRarities={uniqueRarities}
							onRarityChange={setSelectedRarity}
						/>
						<RelicSortFilter onSortChange={setSortOrder} />
					</div>
				</div>

				{/* Danh sách di vật */}
				<div className='pt-4 flex flex-wrap rounded-lg bg-gray-800 items-center justify-center'>
					<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 w-full'>
						{sortedRelics.map((relic, index) => (
							<Link
								key={index}
								to={`/relic/${encodeURIComponent(relic.relicCode)}`}
								className='p-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition'
							>
								<img
									src={relic.assetFullAbsolutePath || "/images/placeholder.png"}
									alt={relic.name || "Unknown Relic"}
									className='w-full h-auto object-cover rounded-md'
									loading='lazy'
								/>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(Relics);
