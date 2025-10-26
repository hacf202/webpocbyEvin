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
	refreshKey,
	powerMap,
	championNameToRegionsMap,
	// ADDED: Nhận thêm các prop xử lý sự kiện từ component cha (Builds.jsx)
	onEditSuccess,
	onDeleteSuccess,
	onFavoriteToggle, // onFavoriteToggle vẫn hữu ích để trigger refresh toàn cục
}) => {
	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

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

	// ADDED: Hàm xử lý khi một build con được cập nhật (vd: like, favorite)
	const handleBuildUpdated = updatedBuild => {
		setCommunityBuilds(currentBuilds =>
			currentBuilds.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
		);
		// Có thể gọi onEditSuccess nếu cần trigger thêm hiệu ứng ở component cha
		if (onEditSuccess) {
			onEditSuccess();
		}
	};

	// ADDED: Hàm xử lý khi một build con bị xóa
	const handleBuildDeleted = deletedBuildId => {
		setCommunityBuilds(currentBuilds =>
			currentBuilds.filter(b => b.id !== deletedBuildId)
		);
		// Gọi onDeleteSuccess để component cha có thể trigger refresh toàn cục
		if (onDeleteSuccess) {
			onDeleteSuccess();
		}
	};

	const filteredCommunityBuilds = useMemo(() => {
		// ... logic lọc không thay đổi
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

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6'>
			{filteredCommunityBuilds.map(build => (
				<BuildSummary
					key={build.id}
					build={build}
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					// Truyền các hàm xử lý mới xuống cho BuildSummary
					onBuildUpdate={handleBuildUpdated}
					onBuildDelete={handleBuildDeleted}
				/>
			))}
		</div>
	);
};

export default CommunityBuilds;
