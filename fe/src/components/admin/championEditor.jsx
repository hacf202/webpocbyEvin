// src/pages/admin/ChampionEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/modal";
import ChampionCard from "../champion/championCard";
import Button from "../common/button";
import { removeAccents } from "../../utils/vietnameseUtils";
import iconRegions from "../../assets/data/iconRegions.json";
import ChampionEditorForm from "./championEditorForm";
import SidePanel from "../common/sidePanel";
import DropDragSidePanel from "./DropDragSidePanel";
import { Loader2 } from "lucide-react";

const NEW_CHAMPION_TEMPLATE = {
	championID: null,
	isNew: true,
	name: "Tướng Mới",
	cost: 1,
	maxStar: 3,
	description: "",
	regions: [],
	regionRefs: [],
	tag: [],
	powerStars: [],
	bonusStars: [],
	adventurePowers: [],
	defaultItems: [],
	defaultRelicsSet1: [],
	defaultRelicsSet2: [],
	defaultRelicsSet3: [],
	defaultRelicsSet4: [],
	defaultRelicsSet5: [],
	defaultRelicsSet6: [],
	rune: [],
	startingDeck: [],
	assets: [
		{
			M: {
				fullAbsolutePath: { S: "" },
				gameAbsolutePath: { S: "" },
				avatar: { S: "" },
			},
		},
	],
	videoLink: "",
	musicVideo: "",
};

const ITEMS_PER_PAGE = 20;

const MainContent = memo(
	({
		viewMode,
		paginatedChampions,
		totalPages,
		currentPage,
		onPageChange,
		onSelectChampion,
		selectedChampion,
		onSaveChampion,
		onCancel,
		onDelete,
		isSaving,
		videoLinks,
		cachedData,
	}) => {
		return (
			<div className='bg-surface-bg rounded-lg'>
				{viewMode === "list" ? (
					<>
						{paginatedChampions.length > 0 ? (
							<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
								{paginatedChampions.map(champion => (
									<div
										key={champion.championID}
										className='hover:scale-105 transition-transform duration-200 cursor-pointer'
										onClick={() => onSelectChampion(champion.championID)}
									>
										<ChampionCard champion={champion} />
									</div>
								))}
							</div>
						) : (
							<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
								<div>
									<p className='font-semibold text-lg'>
										Không tìm thấy tướng nào phù hợp.
									</p>
									<p>Vui lòng thử lại với bộ lọc khác hoặc đặt lại bộ lọc.</p>
								</div>
							</div>
						)}

						{totalPages > 1 && (
							<div className='mt-8 flex justify-center items-center gap-2 md:gap-4'>
								<Button
									onClick={() => onPageChange(currentPage - 1)}
									disabled={currentPage === 1}
									variant='outline'
								>
									Trang trước
								</Button>
								<span className='text-lg font-medium text-text-primary'>
									{currentPage} / {totalPages}
								</span>
								<Button
									onClick={() => onPageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									variant='outline'
								>
									Trang sau
								</Button>
							</div>
						)}
					</>
				) : (
					<ChampionEditorForm
						champion={selectedChampion}
						videoLinks={videoLinks}
						cachedData={cachedData}
						onSave={onSaveChampion}
						onCancel={onCancel}
						onDelete={onDelete}
						isSaving={isSaving}
					/>
				)}
			</div>
		);
	}
);

function ChampionEditor() {
	const [champions, setChampions] = useState([]);
	const [videoLinks, setVideoLinks] = useState([]);
	const [runes, setRunes] = useState([]);
	const [relics, setRelics] = useState([]);
	const [powers, setPowers] = useState([]);
	const [items, setItems] = useState([]);

	const [selectedChampion, setSelectedChampion] = useState(null);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [selectedMaxStars, setSelectedMaxStars] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [viewMode, setViewMode] = useState("list");
	const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] = useState(false);
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
		useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});
	const [isBackNavigation, setIsBackNavigation] = useState(false);

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	// === FETCH ===
	const fetchChampions = useCallback(async () => {
		try {
			const response = await fetch(`${API_BASE_URL}/api/champions`);
			if (!response.ok) throw new Error(`Lỗi mạng: ${response.status}`);
			const data = await response.json();
			setChampions(
				data.map(champ => ({
					...champ,
					avatarUrl: champ.assets?.[0]?.M?.avatar?.S || "",
				}))
			);
		} catch (e) {
			setError("Không thể tải dữ liệu từ máy chủ.");
		}
	}, [API_BASE_URL]);

	const fetchVideoLinks = useCallback(async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/champion-videos`);
			if (!res.ok) throw new Error("Không tải được video");
			setVideoLinks(await res.json());
		} catch {
			setVideoLinks([]);
		}
	}, [API_BASE_URL]);

	const fetchRunes = useCallback(async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/runes`);
			if (!res.ok) throw new Error("Không tải được runes");
			setRunes(await res.json());
		} catch {
			setRunes([]);
		}
	}, [API_BASE_URL]);

	const fetchRelics = useCallback(async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/relics`);
			if (!res.ok) throw new Error("Không tải được relics");
			setRelics(await res.json());
		} catch {
			setRelics([]);
		}
	}, [API_BASE_URL]);

	const fetchPowers = useCallback(async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/powers`);
			if (!res.ok) throw new Error("Không tải được powers");
			setPowers(await res.json());
		} catch {
			setPowers([]);
		}
	}, [API_BASE_URL]);

	const fetchItems = useCallback(async () => {
		try {
			const res = await fetch(`${API_BASE_URL}/api/items`);
			if (!res.ok) throw new Error("Không tải được items");
			setItems(await res.json());
		} catch {
			setItems([]);
		}
	}, [API_BASE_URL]);

	// === LOAD ALL ===
	useEffect(() => {
		Promise.all([
			fetchChampions(),
			fetchVideoLinks(),
			fetchRunes(),
			fetchRelics(),
			fetchPowers(),
			fetchItems(),
		]).finally(() => setIsLoading(false));
	}, [
		fetchChampions,
		fetchVideoLinks,
		fetchRunes,
		fetchRelics,
		fetchPowers,
		fetchItems,
	]);

	// === CACHE ===
	const cachedData = useMemo(
		() => ({
			runes: runes.map(r => ({
				...r,
				value: r.name,
				label: `${r.name} (${r.rarity})`,
			})),
			relics: relics.map(r => ({
				...r,
				value: r.name,
				label: `${r.name} (${r.rarity})`,
			})),
			powers: powers.map(p => ({
				...p,
				value: p.name,
				label: `${p.name} (${p.rarity})`,
			})),
			items: items.map(i => ({
				...i,
				value: i.name,
				label: `${i.name} (${i.rarity})`,
			})),
		}),
		[runes, relics, powers, items]
	);

	// === FILTER & PAGINATION ===
	const filterOptions = useMemo(() => {
		if (champions.length === 0)
			return { regions: [], costs: [], maxStars: [], tags: [], sort: [] };
		const regions = [...new Set(champions.flatMap(c => c.regions))]
			.sort()
			.map(regionName => {
				const regionData = iconRegions.find(r => r.name === regionName);
				return {
					value: regionName,
					label: regionName,
					iconUrl: regionData?.iconAbsolutePath
						? `${import.meta.env.VITE_CDN_URL || ""}${
								regionData.iconAbsolutePath
						  }`
						: "/fallback-image.svg",
				};
			});
		const costs = [...new Set(champions.map(c => c.cost))]
			.sort((a, b) => a - b)
			.map(cost => ({ value: cost, isCost: true }));
		const maxStars = [...new Set(champions.map(c => c.maxStar))]
			.sort((a, b) => a - b)
			.map(star => ({ value: star, isStar: true }));
		const tags = [...new Set(champions.flatMap(c => c.tag || []))]
			.sort()
			.map(tag => ({ value: tag, label: tag, isTag: true }));
		const sort = [
			{ value: "name-asc", label: "Tên A-Z" },
			{ value: "name-desc", label: "Tên Z-A" },
			{ value: "cost-asc", label: "Năng lượng thấp-cao" },
			{ value: "cost-desc", label: "Năng lượng cao-thấp" },
		];
		return { regions, costs, maxStars, tags, sort };
	}, [champions]);

	const filteredChampions = useMemo(() => {
		let filtered = [...champions];
		if (searchTerm) {
			const normalized = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(c =>
				removeAccents(c.name.toLowerCase()).includes(normalized)
			);
		}
		if (selectedRegions.length > 0)
			filtered = filtered.filter(c =>
				c.regions.some(r => selectedRegions.includes(r))
			);
		if (selectedCosts.length > 0)
			filtered = filtered.filter(c => selectedCosts.includes(c.cost));
		if (selectedMaxStars.length > 0)
			filtered = filtered.filter(c => selectedMaxStars.includes(c.maxStar));
		if (selectedTags.length > 0)
			filtered = filtered.filter(c =>
				c.tag?.some(t => selectedTags.includes(t))
			);

		const [sortKey, sortDirection] = sortOrder.split("-");
		filtered.sort((a, b) => {
			const valA = a[sortKey],
				valB = b[sortKey];
			if (sortKey === "cost" || sortKey === "maxStar") {
				return sortDirection === "asc" ? valA - valB : valB - valA;
			}
			return sortDirection === "asc"
				? (valA || "").toString().localeCompare((valB || "").toString())
				: (valB || "").toString().localeCompare((valA || "").toString());
		});
		return filtered;
	}, [
		champions,
		searchTerm,
		selectedRegions,
		selectedCosts,
		selectedMaxStars,
		selectedTags,
		sortOrder,
	]);

	const totalPages = Math.ceil(filteredChampions.length / ITEMS_PER_PAGE);
	const paginatedChampions = filteredChampions.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	// === HANDLERS ===
	const handleSearch = () => {
		setSearchTerm(searchInput);
		setCurrentPage(1);
	};
	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
	};
	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};

	const handleAddNewChampion = () => {
		const newChamp = {
			...NEW_CHAMPION_TEMPLATE,
			championID: Date.now(),
			isNew: true,
		};
		setSelectedChampion(newChamp);
		setViewMode("edit");
	};

	const handleSelectChampion = id => {
		const champ = champions.find(c => c.championID === id);
		if (champ) {
			const videoData = videoLinks.find(v => v.name === champ.name);
			setSelectedChampion({
				...champ,
				isNew: false,
				videoLink: videoData?.link || "",
				musicVideo: videoData?.MusicVideo || "",
			});
			setViewMode("edit");
		}
	};

	const handleBackToList = () => {
		setSelectedChampion(null);
		setViewMode("list");
		setCurrentPage(1);
	};

	const handleSaveChampion = async updatedChampion => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			if (!token) throw new Error("Không tìm thấy token.");

			const champResponse = await fetch(`${API_BASE_URL}/api/champions`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updatedChampion),
			});

			if (!champResponse.ok) {
				const err = await champResponse.json();
				throw new Error(err.error || "Lưu tướng thất bại.");
			}

			const videoData = {
				name: updatedChampion.name,
				link: updatedChampion.videoLink || "",
				MusicVideo: updatedChampion.musicVideo || "",
			};

			if (videoData.link || videoData.MusicVideo) {
				const videoRes = await fetch(`${API_BASE_URL}/api/champion-videos`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(videoData),
				});
				if (!videoRes.ok) console.warn("Lưu video thất bại");
			}

			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: `Đã ${updatedChampion.isNew ? "tạo" : "cập nhật"} ${
					updatedChampion.name
				}!`,
			});

			await Promise.all([fetchChampions(), fetchVideoLinks()]);
			setViewMode("list");
		} catch (e) {
			setNotification({ isOpen: true, title: "Lỗi", message: e.message });
		} finally {
			setIsSaving(false);
		}
	};

	const handleAttemptClose = (isBack = false) => {
		setIsBackNavigation(isBack);
		setIsCloseConfirmModalOpen(true);
	};

	const handleConfirmClose = () => {
		setIsCloseConfirmModalOpen(false);
		handleBackToList();
		if (isBackNavigation) navigate(-1);
		setIsBackNavigation(false);
	};

	const handleAttemptDelete = () => {
		setIsDeleteConfirmModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!selectedChampion || selectedChampion.isNew) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			if (!token) throw new Error("Không tìm thấy token.");

			const response = await fetch(
				`${API_BASE_URL}/api/champions/${selectedChampion.championID}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);

			if (!response.ok) throw new Error("Xóa thất bại.");

			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: `Đã xóa tướng ${selectedChampion.name}.`,
			});
			await fetchChampions();
			setSelectedChampion(null);
			setViewMode("list");
		} catch (e) {
			setNotification({ isOpen: true, title: "Lỗi", message: e.message });
		} finally {
			setIsSaving(false);
			setIsDeleteConfirmModalOpen(false);
		}
	};

	const handlePageChange = page => setCurrentPage(page);

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-screen text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<div className='text-lg mt-4'>Đang tải trình chỉnh sửa tướng...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center text-lg p-10 text-danger-text-dark'>
				{error}
				<Button onClick={fetchChampions} variant='primary' className='mt-4'>
					Thử lại
				</Button>
			</div>
		);
	}

	const multiFilterConfigs = [
		{
			label: "Vùng",
			options: filterOptions.regions,
			selectedValues: selectedRegions,
			onChange: setSelectedRegions,
			placeholder: "Tất cả Vùng",
		},
		{
			label: "Năng lượng",
			options: filterOptions.costs,
			selectedValues: selectedCosts,
			onChange: setSelectedCosts,
			placeholder: "Tất cả Năng lượng",
		},
		{
			label: "Số sao tối đa",
			options: filterOptions.maxStars,
			selectedValues: selectedMaxStars,
			onChange: setSelectedMaxStars,
			placeholder: "Tất cả Sao",
		},
		{
			label: "Thẻ",
			options: filterOptions.tags,
			selectedValues: selectedTags,
			onChange: setSelectedTags,
			placeholder: "Tất cả Thẻ",
		},
	];

	return (
		<div className='font-secondary'>
			<div className='flex flex-col lg:flex-row gap-6'>
				<div className='lg:w-4/5'>
					<MainContent
						viewMode={viewMode}
						paginatedChampions={paginatedChampions}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={handlePageChange}
						onSelectChampion={handleSelectChampion}
						selectedChampion={selectedChampion}
						onSaveChampion={handleSaveChampion}
						onCancel={() => handleAttemptClose(false)}
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
						videoLinks={videoLinks}
						cachedData={cachedData}
					/>
				</div>

				{/* SIDE PANEL ĐỘNG */}
				<div className='lg:w-1/5'>
					{viewMode === "list" ? (
						<SidePanel
							searchPlaceholder='Nhập tên tướng...'
							addLabel='Thêm Tướng Mới'
							resetLabel='Đặt lại bộ lọc'
							searchInput={searchInput}
							onSearchInputChange={e => setSearchInput(e.target.value)}
							onSearch={handleSearch}
							onClearSearch={handleClearSearch}
							onAddNew={handleAddNewChampion}
							onResetFilters={handleResetFilters}
							multiFilterConfigs={multiFilterConfigs}
							sortOptions={filterOptions.sort}
							sortSelectedValue={sortOrder}
							onSortChange={setSortOrder}
						/>
					) : (
						<DropDragSidePanel
							cachedData={cachedData}
							onClose={handleBackToList}
						/>
					)}
				</div>
			</div>

			<Modal
				isOpen={isCloseConfirmModalOpen}
				onClose={() => setIsCloseConfirmModalOpen(false)}
				title='Xác nhận đóng'
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						Bạn có chắc muốn đóng mà không lưu các thay đổi không?
					</p>
					<div className='flex justify-end gap-3'>
						<Button
							onClick={() => setIsCloseConfirmModalOpen(false)}
							variant='ghost'
						>
							Hủy
						</Button>
						<Button onClick={handleConfirmClose} variant='primary'>
							Xác nhận
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={isDeleteConfirmModalOpen}
				onClose={() => setIsDeleteConfirmModalOpen(false)}
				title='Xác nhận Xóa Tướng'
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						Bạn có thực sự muốn xóa tướng{" "}
						<strong className='text-text-primary'>
							{selectedChampion?.name}
						</strong>
						? Hành động này không thể hoàn tác.
					</p>
					<div className='flex justify-end gap-3'>
						<Button
							onClick={() => setIsDeleteConfirmModalOpen(false)}
							variant='ghost'
						>
							Hủy
						</Button>
						<Button onClick={handleConfirmDelete} variant='danger'>
							Xác nhận Xóa
						</Button>
					</div>
				</div>
			</Modal>

			<Modal
				isOpen={notification.isOpen}
				onClose={() => setNotification(p => ({ ...p, isOpen: false }))}
				title={notification.title}
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>{notification.message}</p>
					<div className='flex justify-end'>
						<Button
							onClick={() => setNotification(p => ({ ...p, isOpen: false }))}
							variant='primary'
						>
							Đã hiểu
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default memo(ChampionEditor);
