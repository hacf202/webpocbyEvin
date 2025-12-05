// src/components/build/communityBuilds.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import BuildSummary from "./buildSummary";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { removeAccents } from "../../utils/vietnameseUtils";
import { AuthContext } from "../../context/AuthContext.jsx";
import Button from "../common/button.jsx";

const ITEMS_PER_PAGE = 24; // Số lượng item mỗi trang

const CommunityBuilds = ({
	searchTerm,
	selectedStarLevels,
	selectedRegions,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	championNameToRegionsMap,
	onEditSuccess,
	onDeleteSuccess,
	onFavoriteToggle,
	getCache,
	setCache,
	sortBy,
}) => {
	const { token } = useContext(AuthContext);

	const [communityBuilds, setCommunityBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [creatorNames, setCreatorNames] = useState({});

	// [THÊM] State phân trang
	const [currentPage, setCurrentPage] = useState(1);

	const apiUrl = import.meta.env.VITE_API_URL;

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

	// [THÊM] Reset về trang 1 khi filter thay đổi
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	const filteredAndSortedBuilds = useMemo(() => {
		let result = communityBuilds;

		// --- 1. TÌM KIẾM ---
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

		// --- 3. LỌC KHU VỰC ---
		if (selectedRegions.length > 0) {
			result = result.filter(build => {
				if (Array.isArray(build.regions) && build.regions.length > 0) {
					return build.regions.some(r => selectedRegions.includes(r));
				}
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
		communityBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		championNameToRegionsMap,
		sortBy,
		creatorNames,
	]);

	// [THÊM] Logic cắt mảng để phân trang
	const totalPages = Math.ceil(filteredAndSortedBuilds.length / ITEMS_PER_PAGE);
	const currentBuilds = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredAndSortedBuilds.slice(
			startIndex,
			startIndex + ITEMS_PER_PAGE
		);
	}, [filteredAndSortedBuilds, currentPage]);

	const handlePageChange = newPage => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
			// Cuộn lên đầu lưới khi chuyển trang
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

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
		<>
			<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
				{currentBuilds.map(build => (
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
						initialIsFavorited={!!favoriteStatus[build.id]}
						initialLikeCount={favoriteCounts[build.id] || 0}
						isFavoritePage={false}
					/>
				))}
			</div>

			{/* [THÊM] Giao diện Phân trang */}
			{totalPages > 1 && (
				<div className='mt-4 flex justify-center items-center gap-2 md:gap-4'>
					<Button
						onClick={() => setCurrentPage(p => p - 1)}
						disabled={currentPage === 1}
						variant='outline'
					>
						Trang trước
					</Button>
					<span className='text-lg font-medium text-text-primary'>
						{currentPage} / {totalPages}
					</span>
					<Button
						onClick={() => setCurrentPage(p => p + 1)}
						disabled={currentPage === totalPages}
						variant='outline'
					>
						Trang sau
					</Button>
				</div>
			)}
		</>
	);
};

export default CommunityBuilds;
