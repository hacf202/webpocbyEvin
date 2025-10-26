// src/components/build/MyBuilds.jsx

import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BuildSummary from "./BuildSummary";

const MyBuilds = ({
	searchTerm,
	selectedStarLevel,
	selectedRegion,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	// ADDED: Nhận các hàm xử lý từ component cha (Builds.jsx)
	onEditSuccess,
	onDeleteSuccess,
}) => {
	const { user, token } = useContext(AuthContext);
	const [myBuilds, setMyBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Dữ liệu được tính toán trước không thay đổi
	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.id, p.name])),
		[powersList]
	);
	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		championsList.forEach(champion => map.set(champion.name, champion.regions));
		return map;
	}, [championsList]);

	// Effect để fetch dữ liệu không thay đổi
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
					`${import.meta.env.VITE_API_URL}/api/my-builds`,
					{
						headers: {
							"Content-Type": "application/json",
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (!response.ok)
					throw new Error(`Tải dữ liệu thất bại (${response.status})`);
				const data = await response.json();
				const sortedData = data.items.sort(
					(a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
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

	// ADDED: Hàm xử lý khi một build con được SỬA
	const handleBuildUpdated = updatedBuild => {
		// 1. Cập nhật UI ngay lập tức
		setMyBuilds(currentBuilds =>
			currentBuilds.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
		);
		// 2. Thông báo cho component cha để có thể trigger các hiệu ứng khác nếu cần
		if (onEditSuccess) {
			onEditSuccess();
		}
	};

	// ADDED: Hàm xử lý khi một build con bị XÓA
	const handleBuildDeleted = deletedBuildId => {
		// 1. Cập nhật UI ngay lập tức
		setMyBuilds(currentBuilds =>
			currentBuilds.filter(b => b.id !== deletedBuildId)
		);
		// 2. Thông báo cho component cha để trigger refresh toàn cục
		if (onDeleteSuccess) {
			onDeleteSuccess();
		}
	};

	// Logic lọc không thay đổi
	const filteredBuilds = useMemo(() => {
		let tempFiltered = [...myBuilds];
		// ... logic lọc giữ nguyên ...
		if (selectedStarLevel) {
			tempFiltered = tempFiltered.filter(
				build => build.star === parseInt(selectedStarLevel)
			);
		}
		if (selectedRegion) {
			tempFiltered = tempFiltered.filter(build => {
				const championRegions = championNameToRegionsMap.get(
					build.championName
				);
				return championRegions
					? championRegions.includes(selectedRegion)
					: false;
			});
		}
		if (searchTerm) {
			const lowercasedTerm = searchTerm.toLowerCase();
			tempFiltered = tempFiltered.filter(build => {
				const searchString = [
					build.championName,
					build.description,
					...(build.powers || []).map(p => powerMap.get(p) || ""),
				]
					.join(" ")
					.toLowerCase();
				return searchString.includes(lowercasedTerm);
			});
		}
		return tempFiltered;
	}, [
		myBuilds,
		searchTerm,
		selectedStarLevel,
		selectedRegion,
		powerMap,
		championNameToRegionsMap,
	]);

	// Render không thay đổi
	if (isLoading) return <p className='text-center mt-8'>Đang tải dữ liệu...</p>;
	if (error)
		return (
			<p className='text-[var(--color-danger)] text-center mt-8'>{error}</p>
		);
	if (myBuilds.length === 0) {
		return (
			<p className='text-center mt-8 text-gray-500'>Bạn chưa tạo build nào.</p>
		);
	}
	if (filteredBuilds.length === 0) {
		return (
			<p className='text-center mt-8 text-gray-500'>
				Không tìm thấy build nào phù hợp với tiêu chí của bạn.
			</p>
		);
	}

	return (
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6'>
			{filteredBuilds.map(build => (
				<BuildSummary
					key={build.id}
					build={build}
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					// ✨ Đây là phần kết nối quan trọng ✨
					onBuildUpdate={handleBuildUpdated}
					onBuildDelete={handleBuildDeleted}
				/>
			))}
		</div>
	);
};

export default MyBuilds;
