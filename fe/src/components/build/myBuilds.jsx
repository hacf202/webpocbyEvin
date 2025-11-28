// src/components/build/myBuilds.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { removeAccents } from "../../utils/vietnameseUtils";

const MyBuilds = ({
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
	getCache,
	setCache,
	sortBy,
}) => {
	const { user, token } = useContext(AuthContext);
	const [myBuilds, setMyBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const apiUrl = import.meta.env.VITE_API_URL;

	// Hook lấy trạng thái tim hàng loạt
	const { favoriteStatus, favoriteCounts } = useBatchFavoriteData(
		myBuilds,
		token
	);

	useEffect(() => {
		const fetchMyBuilds = async () => {
			if (!token) {
				setError("Vui lòng đăng nhập");
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			const cacheKey = "my-builds";
			const cached = getCache?.(cacheKey);
			if (cached) {
				setMyBuilds(cached);
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`${apiUrl}/api/builds/my-builds`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!response.ok) throw new Error("Failed to load");
				const data = await response.json();
				const items = data.items || [];
				setMyBuilds(items);
				if (setCache) setCache(cacheKey, items);
				setIsLoading(false);
			} catch (err) {
				setError(err.message);
				setIsLoading(false);
			}
		};
		fetchMyBuilds();
	}, [token, refreshKey, getCache, apiUrl, setCache]);

	const filteredMyBuilds = useMemo(() => {
		let result = myBuilds;

		if (searchTerm) {
			const lowerTerm = removeAccents(searchTerm.toLowerCase());
			result = result.filter(build => {
				const championName =
					championsList.find(c => c.id === build.championId)?.name || "";
				return (
					removeAccents(championName.toLowerCase()).includes(lowerTerm) ||
					removeAccents((build.name || "").toLowerCase()).includes(lowerTerm)
				);
			});
		}

		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.starLevel))
			);
		}

		if (selectedRegions.length > 0) {
			result = result.filter(build => {
				const championName =
					championsList.find(c => c.id === build.championId)?.name || "";
				const region = championNameToRegionsMap[championName];
				return selectedRegions.includes(region);
			});
		}

		result = [...result].sort((a, b) => {
			if (sortBy === "oldest") {
				return new Date(a.createdAt) - new Date(b.createdAt);
			} else if (sortBy === "likes") {
				return (b.like || 0) - (a.like || 0);
			} else {
				return new Date(b.createdAt) - new Date(a.createdAt);
			}
		});

		return result;
	}, [
		myBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		championNameToRegionsMap,
		sortBy,
		championsList,
	]);

	const handleBuildUpdated = updatedBuild => {
		setMyBuilds(current =>
			current.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
		);
		if (onEditSuccess) onEditSuccess();
	};

	const handleBuildDeleted = deletedBuildId => {
		setMyBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	if (isLoading)
		return <p className='text-center mt-8 text-text-secondary'>Đang tải...</p>;
	if (error)
		return <p className='text-danger-text-dark text-center mt-8'>{error}</p>;
	if (myBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Bạn chưa tạo build nào.
			</p>
		);
	if (filteredMyBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Không tìm thấy build nào phù hợp.
			</p>
		);

	return (
		<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
			{filteredMyBuilds.map(build => (
				<BuildSummary
					key={build.id}
					build={{
						...build,
						creatorName: user?.name || "Tôi",
					}}
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					onBuildUpdate={handleBuildUpdated}
					onBuildDelete={handleBuildDeleted}
					// Truyền trạng thái và count
					initialIsFavorited={!!favoriteStatus[build.id]}
					initialLikeCount={favoriteCounts[build.id] || 0}
					// Mặc định false
					isFavoritePage={false}
				/>
			))}
		</div>
	);
};

export default MyBuilds;
