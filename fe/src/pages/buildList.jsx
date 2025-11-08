// src/pages/buildList.jsx
import React, { useState, useEffect, useMemo, useContext } from "react";
import BuildCreation from "../components/build/buildCreation";
import MyBuilds from "../components/build/myBuilds";
import MyFavorite from "../components/build/myFavoriteBuild";
import CommunityBuilds from "../components/build/communityBuilds";
import { AuthContext } from "../context/AuthContext.jsx";
import {
	PlusCircle,
	Globe,
	Shield,
	Heart,
	Search,
	XCircle,
	RotateCw,
	ChevronDown,
	ChevronUp,
	Loader2,
} from "lucide-react";
import Button from "../components/common/button";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import InputField from "../components/common/inputField";
import PageTitle from "../components/common/pageTitle";
import SafeImage from "../components/common/SafeImage.jsx";
import iconRegionsData from "../assets/data/iconRegions.json";
import { NavLink } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";

const Builds = () => {
	const { user } = useContext(AuthContext);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [activeTab, setActiveTab] = usePersistentState(
		"buildsActiveTab",
		"community"
	);
	const [refreshKey, setRefreshKey] = useState(0);

	// === FILTER STATE (PERSISTENT) ===
	const [searchInput, setSearchInput] = usePersistentState(
		"buildsSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"buildsSearchTerm",
		""
	);
	const [selectedStarLevels, setSelectedStarLevels] = usePersistentState(
		"buildsSelectedStarLevels",
		[]
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"buildsSelectedRegions",
		[]
	);
	const [isFilterOpen, setIsFilterOpen] = usePersistentState(
		"buildsIsFilterOpen",
		false
	);

	// === DATA STATE ===
	const [championsList, setChampionsList] = useState([]);
	const [relicsList, setRelicsList] = useState([]);
	const [powersList, setPowersList] = useState([]);
	const [runesList, setRunesList] = useState([]);
	const [iconRegions, setIconRegions] = useState([]);
	const [loadingData, setLoadingData] = useState(true);
	const [errorData, setErrorData] = useState(null);

	// === FETCH DATA ===
	useEffect(() => {
		const fetchAllData = async () => {
			setLoadingData(true);
			setErrorData(null);
			try {
				const apiUrl = import.meta.env.VITE_API_URL;
				const [champRes, relicRes, powerRes, runeRes] = await Promise.all([
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

	// === MAPS & OPTIONS ===
	const powerMap = useMemo(
		() => new Map(powersList.map(p => [p.id, p.name])),
		[powersList]
	);

	const championNameToRegionsMap = useMemo(() => {
		const map = new Map();
		championsList.forEach(champion => {
			if (champion.name && Array.isArray(champion.regions)) {
				map.set(champion.name, champion.regions);
			}
		});
		return map;
	}, [championsList]);

	const regionOptions = useMemo(() => {
		const allRegions = championsList.flatMap(c => c.regions || []);
		const uniqueRegions = [...new Set(allRegions)].sort();
		return uniqueRegions.map(regionName => {
			const regionData = iconRegions.find(r => r.name === regionName);
			return {
				value: regionName,
				label: regionName,
				iconUrl: regionData?.iconAbsolutePath ?? "/fallback-image.svg",
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

	// === HANDLERS ===
	const handleSearch = () => {
		setSearchTerm(searchInput);
		if (window.innerWidth < 1024) {
			setIsFilterOpen(false); // TỰ ĐỘNG ĐÓNG FILTER TRÊN MOBILE
		}
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

	const triggerRefresh = () => setRefreshKey(prev => prev + 1);
	const handleCreateSuccess = () => {
		setShowCreateModal(false);
		triggerRefresh();
		setActiveTab("my-builds");
	};
	const handleEditSuccess = () => triggerRefresh();
	const handleDeleteSuccess = () => triggerRefresh();
	const handleFavoriteToggle = () => triggerRefresh();

	// === RENDER CONTENT ===
	const renderContent = () => {
		if (loadingData) {
			return (
				<div className='flex justify-center items-center h-64'>
					<Loader2 className='animate-spin text-primary-500' size={48} />
				</div>
			);
		}

		if (errorData) {
			return (
				<div className='text-center p-10 bg-danger-bg-light text-danger-text-dark rounded-lg'>
					<h2 className='text-xl font-bold mb-2'>Đã xảy ra lỗi</h2>
					<p className='mb-4'>{errorData}</p>
					<Button onClick={() => window.location.reload()} variant='danger'>
						Tải lại trang
					</Button>
				</div>
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
				return user ? (
					<MyBuilds {...commonProps} />
				) : (
					<p className='text-center'>Đăng nhập để xem bộ của bạn.</p>
				);
			case "my-favorites":
				return user ? (
					<MyFavorite {...commonProps} />
				) : (
					<p className='text-center'>Đăng nhập để xem yêu thích.</p>
				);
			default:
				return null;
		}
	};

	// === GIAO DIỆN ===
	return (
		<div>
			<PageTitle
				title='Danh sách bộ cổ vật'
				description='GUIDE POC: Danh sách bộ cổ vật.'
			/>
			<div className='container mx-auto p-2 sm:p-4 text-text-primary font-secondary'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4'>
					<h1 className='text-3xl font-bold text-primary-500 font-primary'>
						Danh Sách Bộ Cổ Vật
					</h1>
					{user ? (
						<Button
							variant='primary'
							onClick={() => setShowCreateModal(true)}
							iconLeft={<PlusCircle size={20} />}
						>
							Tạo Bộ Mới
						</Button>
					) : (
						<NavLink
							to='/auth'
							className='text-sm text-text-secondary hover:underline'
						>
							<strong>Đăng nhập</strong> để tạo bộ
						</NavLink>
					)}
				</div>

				{/* TABS */}
				<div className='flex flex-wrap gap-2 border-b border-border mb-6'>
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
							Của Tôi
						</Button>
					)}
					{user && (
						<Button
							variant={activeTab === "my-favorites" ? "primary" : "ghost"}
							onClick={() => setActiveTab("my-favorites")}
							iconLeft={<Heart size={18} />}
						>
							Yêu Thích
						</Button>
					)}
				</div>

				<div className='flex flex-col lg:flex-row gap-4 sm:gap-8'>
					{/* FILTER - MOBILE & DESKTOP */}
					<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
						{/* Mobile: Collapsible */}
						<div className='lg:hidden p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<div className='flex items-center gap-2'>
								<div className='flex-1 relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Tìm bộ cổ vật...'
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
								<Button onClick={handleSearch}>
									<Search size={16} />
								</Button>
								<Button
									variant='outline'
									onClick={() => setIsFilterOpen(!isFilterOpen)}
								>
									{isFilterOpen ? (
										<ChevronUp size={18} />
									) : (
										<ChevronDown size={18} />
									)}
								</Button>
							</div>

							<div
								className={`transition-all duration-300 ease-in-out overflow-visible ${
									isFilterOpen
										? "max-h-[1000px] opacity-100"
										: "max-h-0 opacity-0"
								}`}
							>
								<div className='pt-4 space-y-4 border-t border-border'>
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
											Đặt lại
										</Button>
									</div>
								</div>
							</div>
						</div>

						{/* Desktop: Full */}
						<div className='hidden lg:block p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
							<div>
								<label className='block text-sm font-medium mb-1 text-text-secondary'>
									Tìm kiếm
								</label>
								<div className='relative'>
									<InputField
										value={searchInput}
										onChange={e => setSearchInput(e.target.value)}
										onKeyPress={e => e.key === "Enter" && handleSearch()}
										placeholder='Tìm theo từ khóa...'
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
									<Search size={16} className='mr-2' /> Tìm kiếm
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
						<div className='bg-surface-bg rounded-lg border border-border p-2 sm:p-6'>
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
		</div>
	);
};

export default Builds;
