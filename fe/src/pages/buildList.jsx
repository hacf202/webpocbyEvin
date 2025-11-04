// src/pages/Builds.jsx (ĐÃ ĐỒNG BỘ)

import React, { useState, useEffect, useMemo, useContext } from "react";
import BuildCreation from "../components/build/buildCreation";
import MyBuilds from "../components/build/myBuilds";
import MyFavorite from "../components/build/myFavoriteBuild";
import CommunityBuilds from "../components/build/CommunityBuilds";
import { AuthContext } from "../context/AuthContext.jsx";
import {
	PlusCircle,
	Globe,
	Shield,
	Heart,
	Search,
	XCircle,
	RotateCw,
} from "lucide-react";
import Button from "../components/common/button";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import InputField from "../components/common/inputField";

import iconRegionsData from "../assets/data/iconRegions.json";

const Builds = () => {
	const { user } = useContext(AuthContext);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [activeTab, setActiveTab] = useState("community");
	const [refreshKey, setRefreshKey] = useState(0);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStarLevels, setSelectedStarLevels] = useState([]);
	const [selectedRegions, setSelectedRegions] = useState([]);

	// === STATE CHO DỮ LIỆU API ===
	const [championsList, setChampionsList] = useState([]);
	const [relicsList, setRelicsList] = useState([]);
	const [powersList, setPowersList] = useState([]);
	const [runesList, setRunesList] = useState([]);
	const [iconRegions, setIconRegions] = useState([]);
	const [loadingData, setLoadingData] = useState(true);
	const [errorData, setErrorData] = useState(null);

	// === FETCH TẤT CẢ DỮ LIỆU TỪ API ===
	useEffect(() => {
		const fetchAllData = async () => {
			setLoadingData(true);
			setErrorData(null);
			try {
				const apiUrl = import.meta.env.VITE_API_URL;

				const [champRes, relicRes, powerRes, runeRes, iconRes] =
					await Promise.all([
						fetch(`${apiUrl}/api/champions`),
						fetch(`${apiUrl}/api/relics`),
						fetch(`${apiUrl}/api/generalPowers`),
						fetch(`${apiUrl}/api/runes`),
					]);

				if (!champRes.ok || !relicRes.ok || !powerRes.ok || !runeRes.ok) {
					throw new Error("Không thể tải dữ liệu từ server");
				}

				const [champions, relics, powers, runes] = await Promise.all([
					champRes.json(),
					relicRes.json(),
					powerRes.json(),
					runeRes.json(),
				]);

				setChampionsList(champions || []);
				setRelicsList(relics || []);
				setPowersList(powers || []);
				setRunesList(runes || []);
				setIconRegions(iconRegionsData);
			} catch (err) {
				console.error("Lỗi tải dữ liệu:", err);
				setErrorData(err.message);
			} finally {
				setLoadingData(false);
			}
		};

		fetchAllData();
	}, []);

	// === TẠO MAP SAU KHI CÓ DỮ LIỆU ===
	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.id, p.name])),
		[powersList]
	);

	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		if (championsList && Array.isArray(championsList)) {
			championsList.forEach(champion => {
				if (champion.name && Array.isArray(champion.regions)) {
					map.set(champion.name, champion.regions);
				}
			});
		}
		return map;
	}, [championsList]);

	const regionOptions = useMemo(() => {
		// Lấy tất cả vùng từ champions
		const allRegions = championsList.flatMap(c => c.regions || []);
		const uniqueRegions = [...new Set(allRegions)].sort();

		// Map với icon từ iconRegionsData
		return uniqueRegions.map(regionName => {
			const regionData = iconRegions.find(r => r.name === regionName);
			return {
				value: regionName,
				label: regionName,
				iconUrl: regionData?.iconAbsolutePath || null,
			};
		});
	}, [championsList, iconRegions]);

	const starLevelOptions = useMemo(
		() => [
			{ value: "1", label: "", isStar: true },
			{ value: "2", label: "", isStar: true },
			{ value: "3", label: "", isStar: true },
			{ value: "4", label: "", isStar: true },
			{ value: "5", label: "", isStar: true },
			{ value: "6", label: "", isStar: true },
			{ value: "7", label: "", isStar: true },
		],
		[]
	);

	// --- CÁC HÀM XỬ LÝ SỰ KIỆN ---
	const handleSearch = () => setSearchTerm(searchInput);
	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
	};
	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedStarLevels([]);
		setSelectedRegions([]);
	};
	const triggerRefresh = () => setRefreshKey(prevKey => prevKey + 1);
	const handleCreateSuccess = () => {
		setShowCreateModal(false);
		triggerRefresh();
		setActiveTab("my-builds");
	};
	const handleEditSuccess = () => triggerRefresh();
	const handleDeleteSuccess = () => triggerRefresh();
	const handleFavoriteToggle = () => triggerRefresh();

	// === RENDER NỘI DUNG ===
	const renderContent = () => {
		if (loadingData) {
			return (
				<p className='text-center mt-8 text-text-secondary'>
					Đang tải dữ liệu...
				</p>
			);
		}

		if (errorData) {
			return (
				<p className='text-danger-text-dark text-center mt-8'>{errorData}</p>
			);
		}

		const commonProps = {
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
			onEditSuccess: handleEditSuccess,
			onDeleteSuccess: handleDeleteSuccess,
			onFavoriteToggle: handleFavoriteToggle,
		};

		switch (activeTab) {
			case "community":
				return <CommunityBuilds {...commonProps} />;
			case "my-builds":
				return <MyBuilds {...commonProps} />;
			case "my-favorites":
				return <MyFavorite {...commonProps} />;
			default:
				return null;
		}
	};

	// === GIAO DIỆN ===
	return (
		<div className='container mx-auto p-4 text-text-primary font-secondary'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold text-primary-500 font-primary'>
					Danh Sách Builds
				</h1>
				{user && (
					<Button
						variant='primary'
						onClick={() => setShowCreateModal(true)}
						iconLeft={<PlusCircle size={20} />}
					>
						Tạo Build Mới
					</Button>
				)}
			</div>

			<div className='flex flex-wrap items-center space-x-2 border-b border-border mb-6'>
				<Button
					variant={activeTab === "community" ? "primary" : "ghost"}
					onClick={() => setActiveTab("community")}
					iconLeft={<Globe size={18} />}
				>
					Cộng Đồng
				</Button>
				{user && (
					<>
						<Button
							variant={activeTab === "my-builds" ? "primary" : "ghost"}
							onClick={() => setActiveTab("my-builds")}
							iconLeft={<Shield size={18} />}
						>
							Build Của Tôi
						</Button>
						<Button
							variant={activeTab === "my-favorites" ? "primary" : "ghost"}
							onClick={() => setActiveTab("my-favorites")}
							iconLeft={<Heart size={18} />}
						>
							Yêu Thích
						</Button>
					</>
				)}
			</div>

			<div className='flex flex-col lg:flex-row gap-8'>
				<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
					<div className='p-4 rounded-lg border border-border bg-surface-bg space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-1 text-text-secondary'>
								Tìm kiếm build
							</label>
							<div className='relative'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyPress={e => e.key === "Enter" && handleSearch()}
									placeholder='Tìm theo từ khóa (mô tả, tướng, người tạo...)'
								/>
								{searchInput && (
									<button
										onClick={handleClearSearch}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
									>
										<XCircle size={18} />
									</button>
								)}
							</div>
							<Button onClick={handleSearch} className='w-full mt-2'>
								<Search size={16} className='mr-2' />
								Tìm kiếm
							</Button>
						</div>
						<MultiSelectFilter
							label='Cấp sao'
							options={starLevelOptions}
							selectedValues={selectedStarLevels}
							onChange={setSelectedStarLevels}
							placeholder='Tất cả cấp sao'
						/>
						<MultiSelectFilter
							label='Khu vực'
							options={regionOptions}
							selectedValues={selectedRegions}
							onChange={setSelectedRegions}
							placeholder='Tất cả khu vực'
						/>
						<div className='pt-2'>
							<Button
								variant='outline'
								onClick={handleResetFilters}
								iconLeft={<RotateCw size={16} />}
								className='w-full'
							>
								Đặt lại bộ lọc
							</Button>
						</div>
					</div>
				</aside>

				<div className='lg:w-4/5 w-full lg:order-first'>
					<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6'>
						{renderContent()}
					</div>
				</div>
			</div>

			{showCreateModal && (
				<BuildCreation
					onConfirm={handleCreateSuccess}
					onClose={() => setShowCreateModal(false)}
				/>
			)}
		</div>
	);
};

export default Builds;
