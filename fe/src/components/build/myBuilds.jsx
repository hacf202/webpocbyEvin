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

		// --- TÌM KIẾM ---
		if (searchTerm) {
			const lowerTerm = removeAccents(searchTerm.toLowerCase());
			result = result.filter(build => {
				const buildName = removeAccents((build.name || "").toLowerCase());
				const championName = removeAccents(
					(build.championName || "").toLowerCase()
				);
				const creatorName = removeAccents((user?.name || "").toLowerCase());
				const description = removeAccents(
					(build.description || "").toLowerCase()
				);

				const hasRelic = (build.relicSet || []).some(r =>
					removeAccents(r.toLowerCase()).includes(lowerTerm)
				);
				const hasPower = (build.powers || []).some(p =>
					removeAccents(p.toLowerCase()).includes(lowerTerm)
				);

				return (
					buildName.includes(lowerTerm) ||
					championName.includes(lowerTerm) ||
					creatorName.includes(lowerTerm) ||
					description.includes(lowerTerm) ||
					hasRelic ||
					hasPower
				);
			});
		}

		// --- LỌC SAO ---
		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.star))
			);
		}

		// --- LỌC KHU VỰC (MỚI) ---
		if (selectedRegions.length > 0) {
			result = result.filter(build => {
				// Ưu tiên build.regions
				if (Array.isArray(build.regions) && build.regions.length > 0) {
					return build.regions.some(r => selectedRegions.includes(r));
				}
				// Fallback map
				if (championNameToRegionsMap) {
					const championName = build.championName || "";
					const region = championNameToRegionsMap[championName];
					return selectedRegions.includes(region);
				}
				return false;
			});
		}
		// --- SẮP XẾP ---
		result = [...result].sort((a, b) => {
			const nameA = (a.championName || "").toString();
			const nameB = (b.championName || "").toString();

			switch (sortBy) {
				case "oldest":
					return new Date(a.createdAt) - new Date(b.createdAt);

				case "likes_desc":
					return (b.like || 0) - (a.like || 0);

				case "likes_asc":
					return (a.like || 0) - (b.like || 0);

				case "champion_asc":
					return nameA.localeCompare(nameB);

				case "champion_desc":
					return nameB.localeCompare(nameA);

				case "newest":
				default:
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
		user,
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
