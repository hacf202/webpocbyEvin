// src/components/build/myFavoriteBuild.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { removeAccents } from "../../utils/vietnameseUtils";
import { useBatchFavoriteData } from "../../hooks/useBatchFavoriteData";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Import icon

const ITEMS_PER_PAGE = 24;

const MyFavorite = ({
	searchTerm,
	selectedStarLevels,
	selectedRegions,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	championNameToRegionsMap,
	onFavoriteToggle,
	onDeleteSuccess,
	getCache,
	sortBy,
}) => {
	const { user, token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [creatorNames, setCreatorNames] = useState({});

	// [THÊM] State phân trang
	const [currentPage, setCurrentPage] = useState(1);

	const apiUrl = import.meta.env.VITE_API_URL;

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

	// [THÊM] Reset về trang 1
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, selectedStarLevels, selectedRegions, sortBy]);

	const filteredBuilds = useMemo(() => {
		let result = favoriteBuilds;

		// --- TÌM KIẾM ---
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

		// --- LỌC SAO ---
		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.star))
			);
		}

		// --- LỌC KHU VỰC ---
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
		favoriteBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		championNameToRegionsMap,
		sortBy,
		creatorNames,
	]);

	// [THÊM] Logic phân trang
	const totalPages = Math.ceil(filteredBuilds.length / ITEMS_PER_PAGE);
	const currentBuilds = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredBuilds.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredBuilds, currentPage]);

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
		<>
			<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
				{currentBuilds.map(build => (
					<BuildSummary
						key={build.id}
						build={{
							...build,
							creatorName: creatorNames[build.creator],
						}}
						initialIsFavorited={true}
						championsList={championsList}
						relicsList={relicsList}
						powersList={powersList}
						runesList={runesList}
						onBuildUpdate={handleBuildUpdated}
						onBuildDelete={handleBuildDeleted}
						onFavoriteToggle={onFavoriteToggle}
						initialLikeCount={favoriteCounts[build.id] || 0}
						isFavoritePage={true}
					/>
				))}
			</div>
			{/* [THÊM] UI Phân trang */}
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

export default MyFavorite;
