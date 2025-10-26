// src/pages/Builds.jsx

import React, { useState, useMemo, useContext } from "react";
import championsData from "../assets/data/champions.json";
import relicsData from "../assets/data/relics-vi_vn.json";
import powersData from "../assets/data/powers-vi_vn.json";
import runesData from "../assets/data/runes-vi_vn.json";
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
import DropdownFilter from "../components/common/DropdownFilter";
import InputField from "../components/common/InputField";

const Builds = () => {
	const { user } = useContext(AuthContext);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [activeTab, setActiveTab] = useState("community");
	const [refreshKey, setRefreshKey] = useState(0);

	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStarLevel, setSelectedStarLevel] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("");

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
		return [
			{ value: "", label: "Tất cả khu vực" },
			...sortedRegions.map(r => ({ value: r, label: r })),
		];
	}, [championsList]);

	const starLevelOptions = useMemo(
		() => [
			{ value: "", label: "Tất cả cấp sao" },
			{ value: "0", label: "0 Sao" },
			{ value: "1", label: "1 Sao" },
			{ value: "2", label: "2 Sao" },
			{ value: "3", label: "3 Sao" },
			{ value: "4", label: "4 Sao" },
			{ value: "5", label: "5 Sao" },
			{ value: "6", label: "6 Sao" },
			{ value: "7", label: "7 Sao" },
		],
		[]
	);

	// --- CÁC HÀM XỬ LÝ SỰ KIỆN ---

	const handleSearchSubmit = e => {
		e.preventDefault();
		setSearchTerm(searchInput);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
	};

	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedStarLevel("");
		setSelectedRegion("");
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
			selectedStarLevel,
			selectedRegion,
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

			<div className='mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]'>
				<form onSubmit={handleSearchSubmit} className='mb-4'>
					<div className='relative flex items-center gap-4'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							placeholder='Tìm theo từ khóa (mô tả, tướng, người tạo...)'
							className='flex-grow pr-10'
						/>
						{searchInput && (
							<button
								type='button'
								onClick={handleClearSearch}
								className='absolute right-[calc(6rem+1rem)] mr-2 text-gray-500 hover:text-gray-800'
								aria-label='Xóa tìm kiếm'
							>
								<XCircle size={20} />
							</button>
						)}
						<Button
							type='submit'
							variant='primary'
							iconLeft={<Search size={18} />}
						>
							Tìm
						</Button>
					</div>
				</form>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					<DropdownFilter
						options={starLevelOptions}
						selectedValue={selectedStarLevel}
						onChange={setSelectedStarLevel}
						placeholder='Lọc theo cấp sao'
					/>
					<DropdownFilter
						options={regionOptions}
						selectedValue={selectedRegion}
						onChange={setSelectedRegion}
						placeholder='Lọc theo khu vực'
					/>
					<Button
						variant='outline'
						onClick={handleResetFilters}
						iconLeft={<RotateCw size={16} />}
					>
						Đặt lại bộ lọc
					</Button>
				</div>
			</div>

			{showCreateModal && (
				<BuildCreation
					// CHANGED: onConfirm bây giờ là onCreateSuccess
					onConfirm={handleCreateSuccess}
					onClose={() => setShowCreateModal(false)}
				/>
			)}

			{renderContent()}
		</div>
	);
};

export default Builds;
