// src/components/build/communityBuilds.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { removeAccents } from "../../utils/vietnameseUtils";
import { AuthContext } from "../../context/AuthContext.jsx";

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
	// token, // Không nhận token từ props nữa
	sortBy,
}) => {
	// [QUAN TRỌNG] Lấy token trực tiếp từ Context
	const { token } = useContext(AuthContext);

	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [creatorNames, setCreatorNames] = useState({});

	const apiUrl = import.meta.env.VITE_API_URL;

	// [QUAN TRỌNG] Hook lấy trạng thái tim hàng loạt
	const { favoriteStatus, favoriteCounts } = useBatchFavoriteData(
		communityBuilds,
		token
	);

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
			console.error("Failed to fetch creator names:", err);
		}
	};

	useEffect(() => {
		const fetchCommunityBuilds = async () => {
			setIsLoading(true);
			const cacheKey = "community";
			const cached = getCache?.(cacheKey);

			const processData = items => {
				setCommunityBuilds(items);
				setIsLoading(false);
				fetchCreatorNames(items);
			};

			if (cached) {
				processData(cached);
				return;
			}

			try {
				const response = await fetch(`${apiUrl}/api/builds`);
				if (!response.ok) throw new Error("Failed to load");
				const data = await response.json();
				const sorted = (data.items || []).sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				);

				processData(sorted);
				if (setCache) setCache(cacheKey, sorted);
			} catch (err) {
				setError(err.message);
				setIsLoading(false);
			}
		};

		fetchCommunityBuilds();
	}, [refreshKey, apiUrl, getCache, setCache]);
	const filteredAndSortedBuilds = useMemo(() => {
		let result = communityBuilds;

		// --- 1. TÌM KIẾM (Giữ nguyên logic search đa năng) ---
		if (searchTerm) {
			const lowerTerm = removeAccents(searchTerm.toLowerCase());
			result = result.filter(build => {
				const buildName = removeAccents((build.name || "").toLowerCase());
				const championName = removeAccents(
					(build.championName || "").toLowerCase()
				);
				const creatorName = removeAccents(
					(creatorNames[build.creator] || "").toLowerCase()
				);
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

		// --- 2. LỌC SAO ---
		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.star))
			);
		}

		// --- 3. LỌC KHU VỰC (LOGIC MỚI) ---
		if (selectedRegions.length > 0) {
			result = result.filter(build => {
				// CÁCH 1: Dùng dữ liệu regions trực tiếp trong build (Ưu tiên)
				if (Array.isArray(build.regions) && build.regions.length > 0) {
					// Kiểm tra xem có bất kỳ region nào của build nằm trong danh sách đã chọn không
					return build.regions.some(r => selectedRegions.includes(r));
				}

				// CÁCH 2: Fallback cho build cũ chưa có regions (Dùng Map)
				if (championNameToRegionsMap) {
					const championName = build.championName || "";
					const region = championNameToRegionsMap[championName];
					return selectedRegions.includes(region);
				}

				return false;
			});
		}

		// --- 4. SẮP XẾP ---
		result = [...result].sort((a, b) => {
			const nameA = (a.championName || "").toString();
			const nameB = (b.championName || "").toString();

			switch (sortBy) {
				case "oldest":
					return new Date(a.createdAt) - new Date(b.createdAt);

				case "likes_desc": // Lượt thích cao nhất
					return (b.like || 0) - (a.like || 0);

				case "likes_asc": // Lượt thích thấp nhất
					return (a.like || 0) - (b.like || 0);

				case "champion_asc": // Tên tướng A-Z
					return nameA.localeCompare(nameB);

				case "champion_desc": // Tên tướng Z-A
					return nameB.localeCompare(nameA);

				case "newest":
				default:
					return new Date(b.createdAt) - new Date(a.createdAt);
			}
		});

		return result;
	}, [
		communityBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		championNameToRegionsMap,
		sortBy,
		creatorNames,
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
					build={{
						...build,
						creatorName: creatorNames[build.creator],
					}}
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					onBuildUpdate={handleBuildUpdated}
					onBuildDelete={handleBuildDeleted}
					onFavoriteToggle={onFavoriteToggle}
					// Truyền trạng thái và count từ hook
					initialIsFavorited={!!favoriteStatus[build.id]}
					initialLikeCount={favoriteCounts[build.id] || 0}
					// Mặc định false, không reload khi like/favorite
					isFavoritePage={false}
				/>
			))}
		</div>
	);
};

export default CommunityBuilds;
