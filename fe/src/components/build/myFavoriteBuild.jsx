// src/components/build/myFavoriteBuild.jsx
import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import BuildSummary from "./buildSummary";
import { filterBuilds } from "../../utils/filterBuilds";

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
}) => {
	const { user, token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchFavoriteBuilds = async () => {
			if (!token) {
				setFavoriteBuilds([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			setError(null);

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
				if (!response.ok) throw new Error("Không thể tải danh sách yêu thích");

				const data = await response.json();
				const sortedData = data.sort(
					(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
				);

				setFavoriteBuilds(sortedData);
				setCache?.(cacheKey, sortedData);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};

		fetchFavoriteBuilds();
	}, [token, refreshKey, getCache, setCache]);

	const handleBuildUpdated = updatedBuild => {
		const isStillFavorite = user && updatedBuild.favorite?.includes(user.sub);

		if (!isStillFavorite) {
			setFavoriteBuilds(current =>
				current.filter(b => b.id !== updatedBuild.id)
			);
		} else {
			setFavoriteBuilds(current =>
				current.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
			);
		}

		if (onFavoriteToggle) onFavoriteToggle();
	};

	const handleBuildDeleted = deletedBuildId => {
		setFavoriteBuilds(current => current.filter(b => b.id !== deletedBuildId));
		if (onDeleteSuccess) onDeleteSuccess();
	};

	const filteredBuilds = useMemo(() => {
		return filterBuilds(
			favoriteBuilds,
			searchTerm,
			selectedStarLevels,
			selectedRegions,
			powerMap,
			championNameToRegionsMap
		);
	}, [
		favoriteBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		powerMap,
		championNameToRegionsMap,
	]);

	if (isLoading)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Đang tải dữ liệu...
			</p>
		);
	if (error)
		return <p className='text-danger-text-dark text-center mt-8'>{error}</p>;
	if (favoriteBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Bạn chưa có build yêu thích nào.
			</p>
		);
	if (filteredBuilds.length === 0)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Không tìm thấy build nào phù hợp.
			</p>
		);

	return (
		<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
			{filteredBuilds.map(build => (
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

export default MyFavorite;
