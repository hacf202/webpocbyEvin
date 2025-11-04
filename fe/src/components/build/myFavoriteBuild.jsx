// src/components/build/MyFavorite.jsx (ĐÃ ĐỒNG BỘ)

import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BuildSummary from "../build/buildSummary";
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
}) => {
	const { user, token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Effect fetch dữ liệu
	useEffect(() => {
		const fetchFavoriteBuilds = async () => {
			if (!token) {
				setFavoriteBuilds([]);
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/builds/favorites`,
					{
						headers: { Authorization: `Bearer ${token}` },
					}
				);
				if (!response.ok) {
					throw new Error(
						"Không thể tải danh sách build yêu thích. Vui lòng thử lại."
					);
				}
				const data = await response.json();
				const sortedData = data.sort(
					(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
				);
				setFavoriteBuilds(sortedData);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchFavoriteBuilds();
	}, [token, refreshKey]);

	// Xử lý khi người dùng "Bỏ yêu thích"
	const handleBuildUpdated = updatedBuild => {
		const isStillFavorite = user && updatedBuild.favorite.includes(user.sub);

		if (!isStillFavorite) {
			setFavoriteBuilds(currentBuilds =>
				currentBuilds.filter(b => b.id !== updatedBuild.id)
			);
		} else {
			setFavoriteBuilds(currentBuilds =>
				currentBuilds.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
			);
		}

		if (onFavoriteToggle) {
			onFavoriteToggle();
		}
	};
	const handleBuildDeleted = deletedBuildId => {
		setFavoriteBuilds(currentBuilds =>
			currentBuilds.filter(b => b.id !== deletedBuildId)
		);
		if (onDeleteSuccess) {
			onDeleteSuccess();
		}
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

	// Render
	if (isLoading)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Đang tải dữ liệu...
			</p>
		);
	if (error)
		return <p className='text-danger-text-dark text-center mt-8'>{error}</p>;
	if (favoriteBuilds.length === 0) {
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Bạn chưa có build yêu thích nào.
			</p>
		);
	}
	if (filteredBuilds.length === 0) {
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Không tìm thấy build nào phù hợp với tiêu chí của bạn.
			</p>
		);
	}

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
