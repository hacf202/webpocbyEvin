// src/components/build/MyFavorite.jsx

import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BuildSummary from "./BuildSummary";

const MyFavorite = ({
	searchTerm,
	selectedStarLevel,
	selectedRegion,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey,
	// CHANGED: Đổi tên onFavoriteToggle thành một tên chung hơn onBuildUpdate
	// để xử lý tất cả các thay đổi, nhưng vẫn nhận onFavoriteToggle để báo lên cha
	onFavoriteToggle,
	onDeleteSuccess,
}) => {
	const { user, token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// Effect fetch dữ liệu không thay đổi
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

	// ADDED: Xử lý khi người dùng "Bỏ yêu thích"
	const handleBuildUpdated = updatedBuild => {
		// Kiểm tra xem người dùng hiện tại có còn trong danh sách yêu thích của build không
		const isStillFavorite = user && updatedBuild.favorite.includes(user.sub);

		if (!isStillFavorite) {
			// 1. Nếu không, xóa build này khỏi danh sách trên UI ngay lập tức
			setFavoriteBuilds(currentBuilds =>
				currentBuilds.filter(b => b.id !== updatedBuild.id)
			);
		} else {
			// (Trường hợp hiếm) Nếu có một cập nhật khác (như like), thì cập nhật build đó
			setFavoriteBuilds(currentBuilds =>
				currentBuilds.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
			);
		}

		// 2. Luôn thông báo cho component cha để trigger refresh toàn cục
		if (onFavoriteToggle) {
			onFavoriteToggle();
		}
	};
	const handleBuildDeleted = deletedBuildId => {
		// 1. Cập nhật UI ngay lập tức bằng cách xóa build khỏi state cục bộ
		setFavoriteBuilds(currentBuilds =>
			currentBuilds.filter(b => b.id !== deletedBuildId)
		);

		// 2. Thông báo cho component cha (Builds.jsx) để trigger refresh toàn cục,
		// đảm bảo các tab khác cũng được cập nhật.
		if (onDeleteSuccess) {
			onDeleteSuccess();
		}
	};

	// Dữ liệu tính toán trước và logic lọc không thay đổi
	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.id, p.name])),
		[powersList]
	);
	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		if (championsList) {
			championsList.forEach(champion =>
				map.set(champion.name, champion.regions)
			);
		}
		return map;
	}, [championsList]);

	const filteredBuilds = useMemo(() => {
		if (!favoriteBuilds) return [];
		return favoriteBuilds.filter(build => {
			if (selectedStarLevel && build.star !== parseInt(selectedStarLevel)) {
				return false;
			}
			if (selectedRegion) {
				const buildRegions =
					championNameToRegionsMap.get(build.championName) || [];
				if (!buildRegions.includes(selectedRegion)) {
					return false;
				}
			}
			if (searchTerm) {
				const lowercasedTerm = searchTerm.toLowerCase();
				const searchString = [
					build.championName,
					build.description,
					...(build.powers || []).map(p => powerMap.get(p) || ""),
				]
					.join(" ")
					.toLowerCase();
				if (!searchString.includes(lowercasedTerm)) {
					return false;
				}
			}
			return true;
		});
	}, [
		favoriteBuilds,
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
	if (favoriteBuilds.length === 0) {
		return (
			<p className='text-center mt-8 text-gray-500'>
				Bạn chưa có build yêu thích nào.
			</p>
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
		<div className='grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mt-6'>
			{filteredBuilds.map(build => (
				<BuildSummary
					key={build.id}
					build={build}
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					// ✨ Truyền hàm xử lý cập nhật xuống ✨
					// BuildSummary sẽ gọi hàm này khi like/favorite/v.v.
					onBuildUpdate={handleBuildUpdated}
					onBuildDelete={handleBuildDeleted}
				/>
			))}
		</div>
	);
};

export default MyFavorite;
