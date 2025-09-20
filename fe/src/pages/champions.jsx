import { memo, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import ChampionCard from "../components/champion/ChampionCard";
import ChampionFilter from "../components/feature/ChampionFilter";
import RegionFilter from "../components/feature/RegionFilter";
import CostFilter from "../components/feature/CostFilter";
import TagFilter from "../components/feature/TagFilter";
import StarFilter from "../components/feature/StarFilter";
import SortFilter from "../components/feature/Sort";
import championsData from "../assets/data/champions.json";

function ChampionList() {
	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("championsSearchTerm") || ""
	);
	const [selectedRegion, setSelectedRegion] = useState(
		() => localStorage.getItem("championsSelectedRegion") || ""
	);
	const [selectedCost, setSelectedCost] = useState(
		() => localStorage.getItem("championsSelectedCost") || ""
	);
	const [selectedTag, setSelectedTag] = useState(
		() => localStorage.getItem("championsSelectedTag") || ""
	);
	const [selectedStar, setSelectedStar] = useState(
		() => localStorage.getItem("championsSelectedStar") || ""
	);
	const [sortOrder, setSortOrder] = useState(
		() => localStorage.getItem("championsSortOrder") || "asc"
	);

	const uniqueRegions = useMemo(() => {
		return [
			...new Set(championsData.flatMap(champ => champ.regions || [])),
		].sort();
	}, []);

	const uniqueCosts = useMemo(() => {
		return [
			...new Set(
				championsData.map(champ => champ.cost).filter(cost => cost != null)
			),
		].sort((a, b) => a - b);
	}, []);

	const uniqueTags = useMemo(() => {
		return [...new Set(championsData.flatMap(champ => champ.tag || []))].sort();
	}, []);

	const uniqueStars = useMemo(() => {
		return [
			...new Set(
				championsData.map(champ => champ.maxStar).filter(star => star != null)
			),
		].sort((a, b) => a - b);
	}, []);

	const filteredChampions = useMemo(() => {
		return championsData.filter(champ => {
			const matchesSearch = (champ.name || "")
				.toLowerCase()
				.includes(searchTerm.toLowerCase());
			const matchesRegion =
				!selectedRegion ||
				(champ.regions && champ.regions.includes(selectedRegion));
			const matchesCost =
				!selectedCost || champ.cost?.toString() === selectedCost;
			const matchesTag =
				!selectedTag || (champ.tag && champ.tag.includes(selectedTag));
			const matchesStar =
				!selectedStar || champ.maxStar?.toString() === selectedStar;
			return (
				matchesSearch &&
				matchesRegion &&
				matchesCost &&
				matchesTag &&
				matchesStar
			);
		});
	}, [searchTerm, selectedRegion, selectedCost, selectedTag, selectedStar]);

	const sortedChampions = useMemo(() => {
		return [...filteredChampions].sort((a, b) => {
			const nameA = a.name || "";
			const nameB = b.name || "";
			return sortOrder === "asc"
				? nameA.localeCompare(nameB)
				: nameB.localeCompare(nameA);
		});
	}, [filteredChampions, sortOrder]);

	return (
		<div className='relative w-full max-w-[1200px] mx-auto bg-gray-900'>
			<div className='mt-6 p-4 sm:p-6'>
				{/* Bộ lọc và tìm kiếm */}
				<div className='mb-6 flex flex-col gap-4 bg-gray-800 p-4 rounded-lg'>
					<div className='flex flex-col sm:flex-row gap-4'>
						<ChampionFilter onSearchChange={setSearchTerm} />
						<RegionFilter
							uniqueRegions={uniqueRegions}
							onRegionChange={setSelectedRegion}
						/>
						<CostFilter
							uniqueCosts={uniqueCosts}
							onCostChange={setSelectedCost}
						/>
						<TagFilter uniqueTags={uniqueTags} onTagChange={setSelectedTag} />
						<StarFilter
							uniqueStars={uniqueStars}
							onStarChange={setSelectedStar}
						/>
						<SortFilter onSortChange={setSortOrder} />
					</div>
				</div>

				{/* Danh sách tướng */}
				<div className='pt-4 flex flex-wrap rounded-lg bg-gray-800 items-center justify-center'>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 w-full'>
						{sortedChampions.map(champion => (
							<Link
								key={champion.name}
								to={`/champion/${champion.name}`}
								className='w-full'
							>
								<ChampionCard champion={champion} />
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionList);
