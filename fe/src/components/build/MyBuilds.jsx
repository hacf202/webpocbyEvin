// src/components/build/MyBuilds.jsx

import React, { useEffect, useState, useMemo, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import BuildSummary from "./BuildSummary";
import BuildEdit from "./BuildEdit";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import Button from "../common/Button";

// Component này nhận các props từ cha để lọc và hiển thị dữ liệu
const MyBuilds = ({
	searchTerm,
	selectedStarLevel,
	selectedRegion,
	championsList,
	relicsList,
	powersList,
	runesList,
}) => {
	const { user, token } = useContext(AuthContext);
	const [myBuilds, setMyBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);

	// State cho các modal chỉnh sửa và xóa
	const [showEditModal, setShowEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [editingBuild, setEditingBuild] = useState(null);
	const [buildToDelete, setBuildToDelete] = useState(null);

	// Dữ liệu được tính toán trước để tối ưu hóa việc lọc
	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.id, p.name])),
		[powersList]
	);
	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		championsList.forEach(champion => map.set(champion.name, champion.regions));
		return map;
	}, [championsList]);

	// Effect để fetch dữ liệu build của người dùng
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
				setMyBuilds(data.items);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchMyBuilds();
	}, [user, token]); // Chỉ fetch lại khi user hoặc token thay đổi

	// Logic lọc được áp dụng trên `myBuilds`
	const filteredBuilds = useMemo(() => {
		const toLowerSafe = val => String(val || "").toLowerCase();
		let tempFiltered = [...myBuilds];

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
			const lowercasedTerm = toLowerSafe(searchTerm);
			tempFiltered = tempFiltered.filter(build => {
				const descriptionMatch = toLowerSafe(build.description).includes(
					lowercasedTerm
				);
				const championMatch = toLowerSafe(build.championName).includes(
					lowercasedTerm
				);
				const creatorMatch = toLowerSafe(build.creator).includes(
					lowercasedTerm
				);
				const artifactMatch = build.artifacts?.some(artifact =>
					toLowerSafe(artifact).includes(lowercasedTerm)
				);
				const powerMatch = build.powers?.some(powerId =>
					toLowerSafe(powerMap.get(powerId)).includes(lowercasedTerm)
				);
				const runeMatch = build.rune?.some(runeName =>
					toLowerSafe(runeName).includes(lowercasedTerm)
				);
				return (
					descriptionMatch ||
					championMatch ||
					creatorMatch ||
					artifactMatch ||
					powerMatch ||
					runeMatch
				);
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

	// Các hàm xử lý sự kiện sửa, xóa
	const handleUpdateBuild = updatedBuild => {
		setMyBuilds(prev =>
			prev.map(b => (b.id === updatedBuild.id ? updatedBuild : b))
		);
		setShowEditModal(false);
		setEditingBuild(null);
	};

	const handleDeleteBuild = async buildId => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/builds/${buildId}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (!response.ok) throw new Error("Xóa không thành công");
			setMyBuilds(prev => prev.filter(b => b.id !== buildId));
		} catch (error) {
			setError("Không thể xóa build này.");
		} finally {
			setShowDeleteModal(false);
			setBuildToDelete(null);
		}
	};

	const handleEditBuild = build => {
		setEditingBuild(build);
		setShowEditModal(true);
	};

	const confirmDelete = buildId => {
		setBuildToDelete(buildId);
		setShowDeleteModal(true);
	};

	// Render
	if (isLoading) return <p className='text-center mt-8'>Đang tải dữ liệu...</p>;
	if (error)
		return (
			<p className='text-[var(--color-danger)] text-center mt-8'>{error}</p>
		);

	return (
		<>
			{showEditModal && editingBuild && (
				<BuildEdit
					build={editingBuild}
					onConfirm={handleUpdateBuild}
					onClose={() => setShowEditModal(false)}
				/>
			)}
			{showDeleteModal && (
				<ConfirmDeleteModal
					onClose={() => setShowDeleteModal(false)}
					onConfirm={() => handleDeleteBuild(buildToDelete)}
				/>
			)}

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6'>
				{filteredBuilds.map(build => (
					<div key={build.id} className='flex flex-col'>
						<BuildSummary
							build={build}
							championsList={championsList}
							relicsList={relicsList}
							powersList={powersList}
							runesList={runesList}
						/>
						{/* Nút Sửa và Xóa luôn hiển thị vì đây là tab "My Builds" */}
						<div className='flex gap-2 mt-2 self-end'>
							<Button
								variant='warning'
								size='sm'
								onClick={() => handleEditBuild(build)}
							>
								Sửa
							</Button>
							<Button
								variant='danger'
								size='sm'
								onClick={() => confirmDelete(build.id)}
							>
								Xóa
							</Button>
						</div>
					</div>
				))}
			</div>
		</>
	);
};

export default MyBuilds;
