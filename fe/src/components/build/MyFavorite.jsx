// src/components/build/MyFavorite.jsx

import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BuildSummary from "./BuildSummary";

// Component này nhận props từ cha để lọc và hiển thị dữ liệu
const MyFavorite = ({
	searchTerm,
	selectedStarLevel,
	selectedRegion,
	championsList,
	relicsList,
	powersList,
	runesList,
	refreshKey, // Nhận refreshKey để fetch lại dữ liệu khi cần
	onFavoriteToggle, // Nhận hàm xử lý toggle favorite
}) => {
	const { user, token } = useContext(AuthContext);
	const [favoriteBuilds, setFavoriteBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

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
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				if (!response.ok) {
					throw new Error(
						"Không thể tải danh sách build yêu thích. Vui lòng thử lại."
					);
				}

				const data = await response.json();
				// Sắp xếp các build mới nhất lên đầu
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
	}, [token, refreshKey]); // Thêm refreshKey vào dependency array

	// Dữ liệu được tính toán trước để tối ưu hóa việc lọc
	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.id, p.name])),
		[powersList]
	);

	// SỬA LỖI Ở ĐÂY: Dùng 'regions' thay vì 'region_refs'
	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		// Thêm kiểm tra 'championsList' tồn tại để tránh lỗi
		if (championsList) {
			championsList.forEach(champion =>
				map.set(champion.name, champion.regions)
			);
		}
		return map;
	}, [championsList]);

	// Lọc danh sách build dựa trên các tiêu chí tìm kiếm và bộ lọc
	const filteredBuilds = useMemo(() => {
		// Thêm kiểm tra 'favoriteBuilds' tồn tại
		if (!favoriteBuilds) return [];

		return favoriteBuilds.filter(build => {
			// Lọc theo cấp sao
			if (selectedStarLevel && build.star !== parseInt(selectedStarLevel)) {
				return false;
			}

			// Lọc theo khu vực
			if (selectedRegion) {
				const buildRegions =
					championNameToRegionsMap.get(build.championName) || []; // Dùng tên map đã sửa
				if (!buildRegions.includes(selectedRegion)) {
					return false;
				}
			}

			// Lọc theo từ khóa tìm kiếm
			if (searchTerm) {
				const lowercasedTerm = searchTerm.toLowerCase();
				const searchString = [
					build.championName,
					build.creator,
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
		championNameToRegionsMap, // Dùng tên map đã sửa
	]);

	// Render
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
		<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6'>
			{filteredBuilds.map(build => (
				<BuildSummary
					key={build.id}
					build={build}
					championsList={championsList}
					relicsList={relicsList}
					powersList={powersList}
					runesList={runesList}
					onFavoriteToggle={onFavoriteToggle} // Truyền hàm xuống
				/>
			))}
		</div>
	);
};

export default MyFavorite;
