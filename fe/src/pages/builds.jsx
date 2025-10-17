// src/pages/Builds.jsx

import React, { useEffect, useState, useMemo, useContext } from "react";
import championsData from "../assets/data/champions.json";
import relicsData from "../assets/data/relics-vi_vn.json";
import powersData from "../assets/data/powers-vi_vn.json";
import runesData from "../assets/data/runes-vi_vn.json";
import BuildSummary from "../components/build/BuildSummary";
import BuildCreation from "../components/build/BuildCreation";
import MyBuilds from "../components/build/MyBuilds"; // <-- IMPORT COMPONENT MỚI
import { AuthContext } from "../context/AuthContext";
import {
	PlusCircle,
	Globe,
	Shield,
	Search,
	XCircle,
	RotateCw,
} from "lucide-react";
import Button from "../components/common/Button";
import DropdownFilter from "../components/common/DropdownFilter";
import InputField from "../components/common/InputField";

const Builds = () => {
	const { user, token } = useContext(AuthContext);
	const [communityBuilds, setCommunityBuilds] = useState([]); // <-- Đổi tên state
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [activeTab, setActiveTab] = useState("community");
	const [refreshKey, setRefreshKey] = useState(0); // <-- State để trigger refresh

	// State cho các bộ lọc và tìm kiếm (dùng chung cho cả 2 tab)
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStarLevel, setSelectedStarLevel] = useState("");
	const [selectedRegion, setSelectedRegion] = useState("");

	// Dữ liệu gốc từ các tệp JSON
	const championsList = useMemo(() => championsData, []);
	const relicsList = useMemo(() => relicsData, []);
	const powersList = useMemo(() => powersData, []);
	const runesList = useMemo(() => runesData || [], []);

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

	// Tùy chọn cho các bộ lọc dropdown
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
			{ value: "1", label: "1 Sao" },
			{ value: "2", label: "2 Sao" },
			{ value: "3", label: "3 Sao" },
			{ value: "4", label: "4 Sao" },
			{ value: "5", label: "5 Sao" },
		],
		[]
	);

	// Tìm nạp dữ liệu builds CỘNG ĐỒNG
	useEffect(() => {
		// Chỉ fetch khi tab cộng đồng được chọn
		if (activeTab !== "community") return;

		const fetchCommunityBuilds = async () => {
			setIsLoading(true);
			setError(null);
			setCommunityBuilds([]);
			const url = `${import.meta.env.VITE_API_URL}/api/builds`;
			try {
				const response = await fetch(url);
				if (!response.ok)
					throw new Error(`Tải dữ liệu thất bại (${response.status})`);
				const data = await response.json();
				setCommunityBuilds(data.items);
			} catch (err) {
				setError(err.message);
			} finally {
				setIsLoading(false);
			}
		};
		fetchCommunityBuilds();
	}, [activeTab, refreshKey]); // Fetch lại khi đổi tab hoặc khi có build mới được tạo

	// Logic lọc cho build CỘNG ĐỒNG
	const filteredCommunityBuilds = useMemo(() => {
		const toLowerSafe = val => String(val || "").toLowerCase();
		let tempFiltered = [...communityBuilds];

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
		communityBuilds,
		searchTerm,
		selectedStarLevel,
		selectedRegion,
		powerMap,
		championNameToRegionsMap,
	]);

	// Các hàm xử lý sự kiện
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

	const handleCreateBuild = () => {
		// Sau khi tạo thành công, đóng modal và trigger refresh cho tab hiện tại
		setShowCreateModal(false);
		setRefreshKey(prevKey => prevKey + 1);
		// Chuyển người dùng về tab "My Builds" để họ thấy build vừa tạo
		setActiveTab("my-builds");
	};

	// Hàm render nội dung chính dựa trên tab
	const renderContent = () => {
		if (activeTab === "community") {
			if (isLoading)
				return <p className='text-center mt-8'>Đang tải dữ liệu...</p>;
			if (error)
				return (
					<p className='text-[var(--color-danger)] text-center mt-8'>{error}</p>
				);
			return (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6'>
					{filteredCommunityBuilds.map(build => (
						<div key={build.id}>
							<BuildSummary
								build={build}
								championsList={championsList}
								relicsList={relicsList}
								powersList={powersList}
								runesList={runesList}
							/>
							{/* Component cộng đồng không có nút Sửa/Xóa */}
						</div>
					))}
				</div>
			);
		}
		// Render component MyBuilds cho tab "Build Của Tôi"
		return (
			<MyBuilds
				key={refreshKey} // <-- Dùng key để re-mount và fetch lại dữ liệu khi cần
				searchTerm={searchTerm}
				selectedStarLevel={selectedStarLevel}
				selectedRegion={selectedRegion}
				championsList={championsList}
				relicsList={relicsList}
				powersList={powersList}
				runesList={runesList}
			/>
		);
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

			<div className='flex space-x-2 border-b border-[var(--color-border)] mb-6'>
				<Button
					variant={activeTab === "community" ? "primary" : "ghost"}
					onClick={() => setActiveTab("community")}
					iconLeft={<Globe size={18} />}
				>
					Cộng Đồng
				</Button>
				{user && (
					<Button
						variant={activeTab === "my-builds" ? "primary" : "ghost"}
						onClick={() => setActiveTab("my-builds")}
						iconLeft={<Shield size={18} />}
					>
						Build Của Tôi
					</Button>
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
					onConfirm={handleCreateBuild}
					onClose={() => setShowCreateModal(false)}
				/>
			)}

			{renderContent()}
		</div>
	);
};

export default Builds;
