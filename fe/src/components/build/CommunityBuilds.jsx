// src/components/build/CommunityBuilds.jsx

import React, { useEffect, useState, useMemo } from "react";
import BuildSummary from "./BuildSummary";

const CommunityBuilds = ({
	searchTerm,
	selectedStarLevel,
	selectedRegion,
	championsList,
	relicsList,
	powersList,
	runesList,
	onFavoriteToggle,
	refreshKey,
	powerMap,
	championNameToRegionsMap,
}) => {
	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Fetch builds cộng đồng
	useEffect(() => {
		const fetchCommunityBuilds = async () => {
			setIsLoading(true);
			setError(null);
			const url = `${import.meta.env.VITE_API_URL}/api/builds`;
			try {
				const response = await fetch(url);
				if (!response.ok)
					throw new Error(`Tải dữ liệu thất bại (${response.status})`);
				const data = await response.json();
				// Sắp xếp các build mới nhất lên đầu
				const sortedData = data.items.sort(
					(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
				);
				setCommunityBuilds(sortedData);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCommunityBuilds();
	}, [refreshKey]);

	// Logic lọc cho builds cộng đồng
	const filteredCommunityBuilds = useMemo(() => {
		let tempFiltered = [...communityBuilds];
		if (selectedStarLevel) {
			tempFiltered = tempFiltered.filter(
				build => build.star === parseInt(selectedStarLevel)
			);
		}
		if (selectedRegion) {
			tempFiltered = tempFiltered.filter(build => {
				const championRegions = championNameToRegionsMap.get(
					build.championName
				);
				return championRegions
					? championRegions.includes(selectedRegion)
					: false;
			});
		}
		if (searchTerm) {
			const lowercasedTerm = searchTerm.toLowerCase();
			tempFiltered = tempFiltered.filter(build => {
				const searchString = [
					build.championName,
					build.creator,
					build.description,
					...(build.powers || []).map(p => powerMap.get(p) || ""),
				]
					.join(" ")
					.toLowerCase();
				return searchString.includes(lowercasedTerm);
			});
		}
		return tempFiltered;
	}, [
		communityBuilds,
		searchTerm,
		selectedStarLevel,
		selectedRegion,
		powerMap,
		championNameToRegionsMap,
	]);

	if (isLoading) return <p className='text-center mt-8'>Đang tải dữ liệu...</p>;
	if (error)
		return (
			<p className='text-[var(--color-danger)] text-center mt-8'>{error}</p>
		);
	if (filteredCommunityBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-gray-500'>
				Không tìm thấy build nào.
			</p>
		);

	// Props cần truyền xuống BuildSummary
	const summaryProps = {
		championsList,
		relicsList,
		powersList,
		runesList,
		onFavoriteToggle,
	};

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6'>
			{filteredCommunityBuilds.map(build => (
				<BuildSummary key={build.id} build={build} {...summaryProps} />
			))}
		</div>
	);
};

export default CommunityBuilds;
