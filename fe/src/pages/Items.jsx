import { memo, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ItemRarityFilter from "../components/item/ItemRarityFilter";
import ItemSortFilter from "../components/item/ItemSortFilter";
import ItemFilter from "../components/item/ItemFilter";
import itemsData from "../assets/data/items-vi_vn.json";

function Items() {
	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("itemsSearchTerm") || ""
	);
	const [selectedRarity, setSelectedRarity] = useState(
		() => localStorage.getItem("itemsSelectedRarity") || ""
	);
	const [sortOrder, setSortOrder] = useState(
		() => localStorage.getItem("itemsSortOrder") || "asc"
	);

	const uniqueRarities = useMemo(() => {
		const rarities = [...new Set(itemsData.map(item => item.rarity))];
		return rarities.sort();
	}, []);

	const rarityOrder = useMemo(
		() => ({
			THƯỜNG: 0,
			HIẾM: 1,
			"SỬ THI": 2,
			"ĐẶC BIỆT": 3,
		}),
		[]
	);

	const filteredItems = useMemo(() => {
		return itemsData.filter(item => {
			const matchesSearch = (item.name || "")
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesRarity = !selectedRarity || item.rarity === selectedRarity;
			return matchesSearch && matchesRarity;
		});
	}, [searchTerm, selectedRarity]);

	const sortedItems = useMemo(() => {
		return [...filteredItems].sort((a, b) => {
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
	}, [filteredItems, sortOrder, rarityOrder]);

	return (
		<div className='relative mx-auto max-w-[1200px] p-4 sm:p-6 bg-gray-900 rounded-lg mt-10 text-white'>
			<h1 className='text-2xl sm:text-4xl font-bold mb-6 text-center'>
				Danh sách vật phẩm
			</h1>
			<div className='mt-6 p-4 sm:p-6'>
				{/* Bộ lọc và tìm kiếm */}
				<div className='mb-6 flex flex-col gap-4 bg-gray-800 p-4 rounded-lg'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<ItemFilter onSearchChange={setSearchTerm} />
						<ItemRarityFilter
							uniqueRarities={uniqueRarities}
							onRarityChange={setSelectedRarity}
						/>
						<ItemSortFilter onSortChange={setSortOrder} />
					</div>
				</div>

				{/* Danh sách vật phẩm */}
				<div className='pt-4 flex flex-wrap rounded-lg bg-gray-800 items-center justify-center'>
					<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 gap-4 w-full'>
						{sortedItems.map((item, index) => (
							<Link
								key={index}
								to={`/item/${encodeURIComponent(item.itemCode)}`}
								className='p-1 bg-gray-800 rounded-lg hover:bg-gray-700 transition'
							>
								<img
									src={item.assetFullAbsolutePath || "/images/placeholder.png"}
									alt={item.name || "Unknown Item"}
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

export default memo(Items);
