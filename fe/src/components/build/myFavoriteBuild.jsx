// src/components/build/myFavoriteBuild.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { removeAccents } from "../../utils/vietnameseUtils";

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
	// Lưu count
	const [favoriteCounts, setFavoriteCounts] = useState({});

	const apiUrl = import.meta.env.VITE_API_URL;

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
			if (cached) {
				setFavoriteBuilds(cached);
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`${apiUrl}/api/builds/favorites`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!response.ok) throw new Error("Failed to load favorites");
				const data = await response.json();
				setFavoriteBuilds(data);
				if (setCache) setCache(cacheKey, data);
			} catch (err) {
				console.error(err);
				setError("Lỗi tải danh sách yêu thích");
			} finally {
				setIsLoading(false);
			}
		};
		fetchFavoriteBuilds();
	}, [refreshKey, token, apiUrl, getCache, setCache]);

	// [MỚI] Batch Fetch Count chỉ khi có danh sách favorite
	useEffect(() => {
		if (favoriteBuilds.length === 0) return;
		const ids = favoriteBuilds.map(b => b.id).join(",");

		fetch(`${apiUrl}/api/builds/favorites/count/batch?ids=${ids}`)
			.then(res => res.json())
			.then(data => setFavoriteCounts(data))
			.catch(console.error);
	}, [favoriteBuilds, apiUrl]);

	const filteredBuilds = useMemo(() => {
		let result = [...favoriteBuilds];

		// [CẬP NHẬT] Tìm kiếm không dấu
		if (searchTerm) {
			const q = removeAccents(searchTerm.toLowerCase());
			result = result.filter(build => {
				const champ = removeAccents(build.championName.toLowerCase());
				const creator = removeAccents(
					build.creatorName?.toLowerCase() || build.creator?.toLowerCase()
				);
				const relicSet = removeAccents(
					(build.relicSet || []).join(" ").toLowerCase()
				);
				const powers = removeAccents(
					(build.powers || []).join(" ").toLowerCase()
				);
				const rune = removeAccents((build.rune || []).join(" ")).toLowerCase();

				return (
					champ.includes(q) ||
					creator.includes(q) ||
					relicSet.includes(q) ||
					powers.includes(q) ||
					rune.includes(q)
				);
			});
		}

		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.star || 0))
			);
		}

		if (selectedRegions.length > 0) {
			result = result.filter(build => {
				const championRegions =
					championNameToRegionsMap.get(build.championName) || [];
				return selectedRegions.some(region => championRegions.includes(region));
			});
		}

		result.sort((a, b) => {
			switch (sortBy) {
				case "newest":
					return (
						new Date(b.createdAt || b.updatedAt) -
						new Date(a.createdAt || a.updatedAt)
					);
				case "oldest":
					return (
						new Date(a.createdAt || a.updatedAt) -
						new Date(b.createdAt || b.updatedAt)
					);
				case "champion_asc":
					return (a.championName || "").localeCompare(b.championName || "");
				case "champion_desc":
					return (b.championName || "").localeCompare(a.championName || "");
				case "likes_desc":
					return (b.like || 0) - (a.like || 0);
				case "likes_asc":
					return (a.like || 0) - (b.like || 0);
				default:
					return 0;
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
	]);

	const handleBuildUpdated = updatedBuild => {
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
					build={build}
					// Trong tab My Favorite thì hiển nhiên là true
					initialIsFavorited={true}
					// Lấy count từ map batch
					initialLikeCount={favoriteCounts[build.id] || 0}
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

export default MyFavorite;
