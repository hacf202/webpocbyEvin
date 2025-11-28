// src/components/build/myFavoriteBuild.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { removeAccents } from "../../utils/vietnameseUtils";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";

const MyFavorite = ({
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
	onFavoriteToggle,
	onDeleteSuccess,
	getCache,
	setCache,
	sortBy,
}) => {
	const { user, token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [creatorNames, setCreatorNames] = useState({});

	const apiUrl = import.meta.env.VITE_API_URL;

	// Vẫn dùng hook này để lấy COUNT (số lượng người thích)
	const { favoriteCounts } = useBatchFavoriteData(favoriteBuilds, token);

	const fetchCreatorNames = async builds => {
		const userIds = [...new Set(builds.map(b => b.creator).filter(Boolean))];
		const idsToFetch = userIds.filter(id => !creatorNames[id]);
		if (idsToFetch.length === 0) return;

		try {
			const res = await fetch(`${apiUrl}/api/users/batch`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ userIds: idsToFetch }),
			});
			if (res.ok) {
				const newNames = await res.json();
				setCreatorNames(prev => ({ ...prev, ...newNames }));
			}
		} catch (err) {
			console.error(err);
		}
	};

	useEffect(() => {
		const fetchFavoriteBuilds = async () => {
			if (!token) {
				setFavoriteBuilds([]);
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			const cacheKey = "my-favorites";
			const cached = getCache?.(cacheKey);

			const processData = items => {
				setFavoriteBuilds(items);
				setIsLoading(false);
				fetchCreatorNames(items);
			};

			if (cached) {
				processData(cached);
				return;
			}

			try {
				const response = await fetch(`${apiUrl}/api/builds/favorites`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!response.ok) throw new Error("Failed to load favorites");
				const data = await response.json();
				const items = Array.isArray(data) ? data : data.items || [];

				processData(items);
			} catch (err) {
				setError(err.message);
				setIsLoading(false);
			}
		};
		fetchFavoriteBuilds();
	}, [token, refreshKey, getCache, apiUrl]);

	const filteredBuilds = useMemo(() => {
		let result = favoriteBuilds;

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
		favoriteBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		championNameToRegionsMap,
		sortBy,
		championsList,
	]);

	const handleBuildUpdated = updatedBuild => {
		// Ở trang Favorite, nếu isFavorited = false, ta loại bỏ nó khỏi list
		if (!updatedBuild.isFavorited) {
			setFavoriteBuilds(current =>
				current.filter(b => b.id !== updatedBuild.id)
			);
		}
		if (onFavoriteToggle) onFavoriteToggle();
	};

	const handleBuildDeleted = deletedBuildId => {
		setFavoriteBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	if (isLoading)
		return <p className='text-center mt-8 text-text-secondary'>Đang tải...</p>;
	if (error)
		return <p className='text-danger-text-dark text-center mt-8'>{error}</p>;
	if (filteredBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Không tìm thấy build nào.
			</p>
		);

	return (
		<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
			{filteredBuilds.map(build => (
				<BuildSummary
					key={build.id}
					build={{
						...build,
						creatorName: creatorNames[build.creator],
					}}
					initialIsFavorited={true} // Luôn luôn true ở trang này
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					onBuildUpdate={handleBuildUpdated}
					onBuildDelete={handleBuildDeleted}
					onFavoriteToggle={onFavoriteToggle}
					// Truyền count từ hook
					initialLikeCount={favoriteCounts[build.id] || 0}
					// [QUAN TRỌNG] Bật chế độ Favorite Page để kích hoạt tính năng xóa khỏi list khi bỏ tim
					isFavoritePage={true}
				/>
			))}
		</div>
	);
};

export default MyFavorite;
