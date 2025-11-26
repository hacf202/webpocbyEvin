// src/components/build/communityBuilds.jsx
import React, { useEffect, useState, useMemo } from "react";
import BuildSummary from "./buildSummary";
import { useFavoriteStatus } from "../../hooks/useFavoriteStatus";

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
	getCache,
	setCache,
	token,
	sortBy, // <--- Nhận prop sắp xếp
}) => {
	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	// Lấy danh sách public builds
	useEffect(() => {
		const fetchCommunityBuilds = async () => {
			setIsLoading(true);
			const cacheKey = "community";
			const cached = getCache?.(cacheKey);
			if (cached) {
				setCommunityBuilds(cached);
				setIsLoading(false);
				return;
			}

			try {
				const response = await fetch(`${apiUrl}/api/builds`);
				if (!response.ok) throw new Error("Failed to load");
				const data = await response.json();
				// Sắp xếp mặc định là mới nhất khi fetch
				const sorted = (data.items || []).sort(
					(a, b) =>
						new Date(b.updatedAt || b.createdAt) -
						new Date(a.updatedAt || a.createdAt)
				);
				setCommunityBuilds(sorted);
				setCache?.(cacheKey, sorted);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCommunityBuilds();
	}, [refreshKey, getCache, setCache]);

	// Batch lấy trạng thái favorite
	const buildIds = communityBuilds.map(b => b.id);
	const { status: favoriteStatus } = useFavoriteStatus(buildIds, token);

	// Gắn isFavorited vào từng build
	const buildsWithStatus = communityBuilds.map(build => ({
		...build,
		isFavorited: !!favoriteStatus[build.id],
	}));

	// === XỬ LÝ LỌC & SẮP XẾP ===
	const filteredAndSortedBuilds = useMemo(() => {
		let result = [...buildsWithStatus];

		// 1. TÌM KIẾM (Mở rộng: Tên, Creator, RelicSet, Powers, Rune)
		if (searchTerm) {
			const q = searchTerm.toLowerCase();
			result = result.filter(build => {
				const champ = build.championName?.toLowerCase() || "";
				const creator =
					build.creatorName?.toLowerCase() ||
					build.creator?.toLowerCase() ||
					"";

				// Chuyển mảng thành chuỗi để tìm kiếm
				const relicSet = (build.relicSet || []).join(" ").toLowerCase();
				const powers = (build.powers || []).join(" ").toLowerCase();
				const rune = (build.rune || []).join(" ").toLowerCase();

				return (
					champ.includes(q) ||
					creator.includes(q) ||
					relicSet.includes(q) ||
					powers.includes(q) ||
					rune.includes(q)
				);
			});
		}

		// 2. LỌC CẤP SAO
		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.star || 0))
			);
		}

		// 3. LỌC KHU VỰC
		if (selectedRegions.length > 0) {
			result = result.filter(build => {
				const championRegions =
					championNameToRegionsMap.get(build.championName) || [];
				return selectedRegions.some(region => championRegions.includes(region));
			});
		}

		// 4. SẮP XẾP
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
		buildsWithStatus,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		championNameToRegionsMap,
		sortBy, // Thêm dependency
	]);

	const handleBuildUpdated = updatedBuild => {
		setCommunityBuilds(current =>
			current.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
		);
		if (onEditSuccess) onEditSuccess();
		if (onFavoriteToggle) onFavoriteToggle();
	};

	const handleBuildDeleted = deletedBuildId => {
		setCommunityBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	if (isLoading)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Đang tải dữ liệu...
			</p>
		);
	if (error)
		return <p className='text-danger-text-dark text-center mt-8'>{error}</p>;
	if (filteredAndSortedBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Không tìm thấy build nào.
			</p>
		);

	return (
		<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
			{filteredAndSortedBuilds.map(build => (
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
