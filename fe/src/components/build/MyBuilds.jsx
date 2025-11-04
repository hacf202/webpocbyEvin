// src/components/build/MyBuilds.jsx (ĐÃ ĐỒNG BỘ)

import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/authContext";
import BuildSummary from "./buildSummary";
import { filterBuilds } from "../../utils/filterBuilds";

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
}) => {
	const { user, token } = useContext(AuthContext);
	const [myBuilds, setMyBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// FETCH BUILD CỦA USER
	useEffect(() => {
		const fetchMyBuilds = async () => {
			if (!user || !token) {
				setError("Bạn cần đăng nhập để xem các build của mình.");
				setIsLoading(false);
				return;
			}
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/builds/my-builds`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (!response.ok) {
					throw new Error(`Tải dữ liệu thất bại (${response.status})`);
				}
				const data = await response.json();
				const sortedData = (data.items || []).sort(
					(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
				);
				setMyBuilds(sortedData);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchMyBuilds();
	}, [user, token, refreshKey]);

	// XỬ LÝ CẬP NHẬT BUILD
	const handleBuildUpdated = updatedBuild => {
		setMyBuilds(currentBuilds =>
			currentBuilds.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
		);
		if (onEditSuccess) onEditSuccess();
	};

	// XỬ LÝ XÓA BUILD
	const handleBuildDeleted = deletedBuildId => {
		setMyBuilds(currentBuilds =>
			currentBuilds.filter(b => b.id !== deletedBuildId)
		);
		if (onDeleteSuccess) onDeleteSuccess();
	};

	const filteredMyBuilds = useMemo(() => {
		return filterBuilds(
			myBuilds,
			searchTerm,
			selectedStarLevels,
			selectedRegions,
			powerMap,
			championNameToRegionsMap
		);
	}, [
		myBuilds,
		searchTerm,
		selectedStarLevels,
		selectedRegions,
		powerMap,
		championNameToRegionsMap,
	]);

	// RENDER
	if (isLoading)
		return (
			<p className='text-center mt-8 text-text-secondary'>
				Đang tải dữ liệu...
			</p>
		);
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
				Không tìm thấy build nào phù hợp với tiêu chí của bạn.
			</p>
		);

	return (
		<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
			{filteredMyBuilds.map(build => (
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

export default MyBuilds;
