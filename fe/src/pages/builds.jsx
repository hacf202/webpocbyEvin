// src/pages/Builds.jsx

import React, { useState, useMemo, useContext } from "react";
import championsData from "../assets/data/champions.json";
import relicsData from "../assets/data/relics-vi_vn.json";
import powersData from "../assets/data/general_powers.json";
import runesData from "../assets/data/runes-vi_vn.json";
import iconRegions from "../assets/data/iconRegions.json";
import BuildCreation from "../components/build/BuildCreation";
import MyBuilds from "../components/build/MyBuilds";
import MyFavorite from "../components/build/MyFavorite";
import CommunityBuilds from "../components/build/CommunityBuilds";
import { AuthContext } from "../context/AuthContext";
import {
	PlusCircle,
	Globe,
	Shield,
	Heart,
	Search,
	XCircle,
	RotateCw,
} from "lucide-react";
import Button from "../components/common/Button";
import MultiSelectFilter from "../components/common/MultiSelectFilter";
import InputField from "../components/common/InputField";

const Builds = () => {
	const { user } = useContext(AuthContext);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [activeTab, setActiveTab] = useState("community");
	const [refreshKey, setRefreshKey] = useState(0);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStarLevels, setSelectedStarLevels] = useState([]);
	const [selectedRegions, setSelectedRegions] = useState([]);

	const championsList = useMemo(() => championsData, []);
	const relicsList = useMemo(() => relicsData, []);
	const powersList = useMemo(() => powersData, []);
	const runesList = useMemo(() => runesData || [], []);

	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.id, p.name])),
		[powersList]
	);
	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		championsList.forEach(champion => map.set(champion.name, champion.regions));
		return map;
	}, [championsList]);

	const regionOptions = useMemo(() => {
		const allRegions = championsList.flatMap(c => c.regions);
		const uniqueRegions = [...new Set(allRegions)];
		const sortedRegions = uniqueRegions.sort((a, b) => a.localeCompare(b));
		return sortedRegions.map(regionName => {
			const regionData = iconRegions.find(r => r.name === regionName);
			return {
				value: regionName,
				label: regionName,
				iconUrl: regionData ? regionData.iconAbsolutePath : null,
			};
		});
	}, [championsList]);

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

	const handleSearch = () => {
		setSearchTerm(searchInput);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
	};

	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedStarLevels([]);
		setSelectedRegions([]);
	};

	// ADDED: Hàm chung để trigger refresh
	const triggerRefresh = () => {
		setRefreshKey(prevKey => prevKey + 1);
	};

	// CHANGED: Xử lý khi TẠO build thành công
	const handleCreateSuccess = () => {
		setShowCreateModal(false); // Đóng modal
		triggerRefresh(); // Kích hoạt tải lại dữ liệu
		setActiveTab("my-builds"); // Chuyển sang tab "Build Của Tôi"
	};

	// ADDED: Xử lý khi SỬA build thành công
	const handleEditSuccess = () => {
		triggerRefresh();
		// Thường thì không cần đóng modal hay chuyển tab khi sửa
	};

	// ADDED: Xử lý khi XÓA build thành công
	const handleDeleteSuccess = () => {
		triggerRefresh();
	};

	// ADDED: Xử lý khi toggle favorite thành công
	const handleFavoriteToggle = () => {
		triggerRefresh();
	};

	const renderContent = () => {
		// CHANGED: Thêm các handler vào props chung
		const commonProps = {
			searchTerm,
			selectedStarLevels,
			selectedRegions,
			championsList,
			relicsList,
			powersList,
			runesList,
			refreshKey, // Truyền refreshKey để component con tự fetch lại khi cần
			onFavoriteToggle: handleFavoriteToggle,
			// ADDED: Truyền các hàm xử lý xuống component con
			onEditSuccess: handleEditSuccess,
			onDeleteSuccess: handleDeleteSuccess,
		};

		switch (activeTab) {
			case "community":
				return (
					<CommunityBuilds
						{...commonProps}
						powerMap={powerMap}
						championNameToRegionsMap={championNameToRegionsMap}
					/>
				);
			case "my-builds":
				// MyBuilds là nơi cần các hàm này nhất
				return <MyBuilds {...commonProps} />;
			case "my-favorites":
				return <MyFavorite {...commonProps} />;
			default:
				return null;
		}
	};

	return (
		<div className='container mx-auto p-4 text-[var(--color-text-primary)]'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-3xl font-bold text-[var(--color-primary)]'>
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

			<div className='flex flex-wrap items-center space-x-2 border-b border-[var(--color-border)] mb-6'>
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
					<div className='p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-1 text-[var(--color-text-secondary)]'>
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
										className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
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
					<div className='bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6'>
						{renderContent()}
					</div>
				</div>
			</div>

			{showCreateModal && (
				<BuildCreation
					// CHANGED: onConfirm bây giờ là onCreateSuccess
					onConfirm={handleCreateSuccess}
					onClose={() => setShowCreateModal(false)}
				/>
			)}
		</div>
	);
};

export default Builds;
