// src/components/build/CommunityBuilds.jsx (ĐÃ ĐỒNG BỘ)

import React, { useEffect, useState, useMemo } from "react";
import BuildSummary from "./buildSummary";
import { filterBuilds } from "../../utils/filterBuilds";

const CommunityBuilds = ({
	searchTerm,
	selectedStarLevels,
	selectedRegions,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	powerMap,
	championNameToRegionsMap,
	onEditSuccess,
	onDeleteSuccess,
	onFavoriteToggle,
}) => {
	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// FETCH CÁC BUILD CÔNG KHAI
	useEffect(() => {
		const fetchCommunityBuilds = async () => {
			setIsLoading(true);
			setError(null);
			const url = `${import.meta.env.VITE_API_URL}/api/builds`;
			try {
				const response = await fetch(url);
				if (!response.ok) {
					throw new Error(`Tải dữ liệu thất bại (${response.status})`);
				}
				const data = await response.json();
				const sortedData = (data.items || []).sort(
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

	// XỬ LÝ CẬP NHẬT BUILD
	const handleBuildUpdated = updatedBuild => {
		setCommunityBuilds(currentBuilds =>
			currentBuilds.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
		);
		if (onEditSuccess) onEditSuccess();
	};

	// XỬ LÝ XÓA BUILD
	const handleBuildDeleted = deletedBuildId => {
		setCommunityBuilds(currentBuilds =>
			currentBuilds.filter(b => b.id !== deletedBuildId)
		);
		if (onDeleteSuccess) onDeleteSuccess();
	};

	// BỘ LỌC
	const filteredCommunityBuilds = useMemo(() => {
		return filterBuilds(
			communityBuilds,
			searchTerm,
			selectedStarLevels,
			selectedRegions,
			powerMap,
			championNameToRegionsMap
		);
	}, [
		communityBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		powerMap,
		championNameToRegionsMap,
	]);

	// RENDER
	if (isLoading)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Đang tải dữ liệu...
			</p>
		);
	if (error)
		return <p className='text-danger-text-dark text-center mt-8'>{error}</p>;
	if (filteredCommunityBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Không tìm thấy build nào.
			</p>
		);

	return (
		<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
			{filteredCommunityBuilds.map(build => (
				<BuildSummary
					key={build.id}
					build={build}
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					onBuildUpdate={handleBuildUpdated}
					onBuildDelete={handleBuildDeleted}
				/>
			))}
		</div>
	);
};

export default CommunityBuilds;
