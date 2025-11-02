// ChampionEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import ChampionCard from "../components/champion/ChampionCard";
import Button from "../components/common/Button";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/iconRegions.json";
import ChampionEditorForm from "../components/champion/ChampionEditorForm";
import SidePanel from "../components/common/SidePanel"; // <-- THAY ĐỔI: Import SidePanel chung

// Cấu trúc tướng mới mặc định (giữ nguyên)
const NEW_CHAMPION_TEMPLATE = {
	championID: Date.now(),
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
};

const ITEMS_PER_PAGE = 20;

// --- COMPONENT: MainContent (Grid list hoặc Form) ---
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
		onBackToList,
	}) => {
		return (
			<div className='bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6'>
				{viewMode === "list" ? (
					<>
						{paginatedChampions.length > 0 ? (
							<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
								{paginatedChampions.map(champion => (
									<div
										key={champion.championID || champion.name}
										className='hover:scale-105 transition-transform duration-200 cursor-pointer'
										onClick={() =>
											onSelectChampion(champion.championID || champion.name)
										}
									>
										<ChampionCard champion={champion} />
									</div>
								))}
							</div>
						) : (
							<div className='flex items-center justify-center h-full min-h-[300px] text-center text-gray-500 dark:text-gray-400'>
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
									className='hover:bg-[var(--color-primary-hover)] transition-colors'
								>
									Trang trước
								</Button>
								<span className='text-lg font-medium text-[var(--color-text-primary)]'>
									{currentPage} / {totalPages}
								</span>
								<Button
									onClick={() => onPageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									variant='outline'
									className='hover:bg-[var(--color-primary-hover)] transition-colors'
								>
									Trang sau
								</Button>
							</div>
						)}
					</>
				) : (
					<ChampionEditorForm
						champion={selectedChampion}
						onSave={onSaveChampion}
						onCancel={onCancel}
						onDelete={onDelete}
						isSaving={isSaving}
						onBackToList={onBackToList}
					/>
				)}
			</div>
		);
	}
);

// --- COMPONENT CHÍNH: ChampionEditor (giữ nguyên logic, nhưng render SidePanel và MainContent) ---
function ChampionEditor() {
	const [champions, setChampions] = useState([]);
	const [selectedChampionId, setSelectedChampionId] = useState(null);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRegions, setSelectedRegions] = useState([]);
	const [selectedCosts, setSelectedCosts] = useState([]);
	const [selectedMaxStars, setSelectedMaxStars] = useState([]);
	const [selectedTags, setSelectedTags] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [viewMode, setViewMode] = useState("list"); // 'list' hoặc 'edit'
	const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] = useState(false);
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
		useState(false);
	const [championToDelete, setChampionToDelete] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});
	const [isBackNavigation, setIsBackNavigation] = useState(false); // <-- THÊM: Flag để phân biệt back vs cancel
	const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

	const fetchChampions = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`${API_BASE_URL}/api/champions`);
			if (!response.ok) throw new Error(`Lỗi mạng: ${response.status}`);
			const data = await response.json();
			const formattedData = data.map(champ => ({
				...champ,
				avatarUrl: champ.assets?.[0]?.M?.avatar?.S || "",
			}));
			setChampions(formattedData);
		} catch (e) {
			setError("Không thể tải dữ liệu từ máy chủ.");
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL]);

	useEffect(() => {
		fetchChampions();
	}, [fetchChampions]);

	// Xử lý beforeunload cho đóng tab/refresh khi đang edit
	useEffect(() => {
		const handleBeforeUnload = e => {
			if (viewMode === "edit") {
				e.preventDefault();
				e.returnValue = "Bạn có thay đổi chưa lưu?";
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, [viewMode]);

	// Tạo các tùy chọn cho bộ lọc (giống champions.jsx)
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
					iconUrl: regionData ? regionData.iconAbsolutePath : null,
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

	// Lọc và sắp xếp danh sách tướng (giống champions.jsx)
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
			const valA = a[sortKey];
			const valB = b[sortKey];

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
	const paginatedChampions = useMemo(
		() =>
			filteredChampions.slice(
				(currentPage - 1) * ITEMS_PER_PAGE,
				currentPage * ITEMS_PER_PAGE
			),
		[filteredChampions, currentPage]
	);

	const handleSelectChampion = championId => {
		setSelectedChampionId(championId);
		setViewMode("edit");
	};

	const handleBackToList = () => {
		setViewMode("list");
		setSelectedChampionId(null);
		setCurrentPage(1);
	};

	const handleAddNewChampion = () => {
		const newChampion = { ...NEW_CHAMPION_TEMPLATE, championID: Date.now() };
		setChampions(prev => [newChampion, ...prev]);
		setSelectedChampionId(newChampion.championID);
		setViewMode("edit");
	};

	const handleSearch = () => {
		setSearchTerm(searchInput);
		setCurrentPage(1);
		setViewMode("list");
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
		setViewMode("list");
	};

	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
		setViewMode("list");
	};

	const handleSaveChampion = async updatedChampionData => {
		setIsSaving(true);
		const { isNew, ...championToSend } = updatedChampionData;
		try {
			const token = localStorage.getItem("token");
			if (!token)
				throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
			const response = await fetch(`${API_BASE_URL}/api/champions`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(championToSend),
			});
			if (!response.ok)
				throw new Error(
					response.status === 401 ? "Xác thực thất bại." : "Lỗi từ máy chủ."
				);

			await fetchChampions();
			setSelectedChampionId(null);
			setViewMode("list");
			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: "Lưu tướng thành công!",
			});
		} catch (e) {
			setNotification({
				isOpen: true,
				title: "Lỗi",
				message: `Không thể lưu: ${e.message}`,
			});
		} finally {
			setIsSaving(false);
		}
	};

	// <-- THAY ĐỔI: Modal cho cả Cancel & Back, với flag phân biệt
	const handleAttemptClose = (isBack = false) => {
		setIsBackNavigation(isBack);
		setIsCloseConfirmModalOpen(true);
	};

	const handleConfirmClose = () => {
		setIsCloseConfirmModalOpen(false);
		handleBackToList();
		if (isBackNavigation) {
			navigate(-1);
		}
		setIsBackNavigation(false);
	};

	const handleAttemptDelete = () => {
		const champion = champions.find(c => c.championID === selectedChampionId);
		setChampionToDelete(champion);
		setIsDeleteConfirmModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!championToDelete) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			if (!token) throw new Error("Không tìm thấy token.");
			const response = await fetch(
				`${API_BASE_URL}/api/champions/${championToDelete.championID}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (!response.ok)
				throw new Error(
					response.status === 401 ? "Xác thực thất bại." : "Lỗi từ máy chủ."
				);

			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: `Đã xóa tướng ${championToDelete.name}.`,
			});
			setChampions(prev =>
				prev.filter(c => c.championID !== championToDelete.championID)
			);
			setSelectedChampionId(null);
			setViewMode("list");
		} catch (e) {
			setNotification({
				isOpen: true,
				title: "Lỗi",
				message: `Không thể xóa: ${e.message}`,
			});
		} finally {
			setIsSaving(false);
			setIsDeleteConfirmModalOpen(false);
			setChampionToDelete(null);
		}
	};

	const handlePageChange = page => {
		setCurrentPage(page);
	};

	const handleBackNavigation = () => {
		if (viewMode === "edit") {
			handleAttemptClose(true); // <-- THAY ĐỔI: Set isBack = true
		} else {
			navigate(-1);
		}
	};

	const selectedChampion = champions.find(
		c => c.championID === selectedChampionId
	);
	const navigate = useNavigate();

	if (isLoading)
		return <div className='text-center text-lg p-10'>Đang tải...</div>;
	if (error)
		return (
			<div className='text-center text-lg p-10 text-[var(--color-danger)]'>
				{error}{" "}
				<button
					onClick={fetchChampions}
					className='mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)] transition-colors'
				>
					Thử lại
				</button>
			</div>
		);

	// <-- THAY ĐỔI: Tạo config cho multiFilterConfigs
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
		<div>
			<h1 className='text-3xl font-bold mb-6 text-[var(--color-text-primary)]'>
				Quản Lý Tướng
			</h1>

			<button
				onClick={handleBackNavigation}
				className='mb-4 px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] bg-transparent border border-[var(--color-border)] rounded-md hover:bg-[var(--color-background)] transition-colors'
			>
				Quay Lại
			</button>

			{/* Layout: SidePanel và MainContent */}
			<div className='flex flex-col lg:flex-row gap-6'>
				{/* MainContent */}
				<div className='lg:w-7/10'>
					<MainContent
						viewMode={viewMode}
						paginatedChampions={paginatedChampions}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={handlePageChange}
						onSelectChampion={handleSelectChampion}
						selectedChampion={selectedChampion}
						onSaveChampion={handleSaveChampion}
						onCancel={() => handleAttemptClose(false)} // <-- THAY ĐỔI: Set isBack = false cho cancel
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
					/>
				</div>
				{/* SidePanel */}
				<div className='lg:w-3/10'>
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
				</div>
			</div>

			{/* Các Modal giữ nguyên */}
			<Modal
				isOpen={isCloseConfirmModalOpen}
				onClose={() => setIsCloseConfirmModalOpen(false)}
				title='Xác nhận đóng'
			>
				<div className='text-[var(--color-text-primary)]'>
					<p className='mb-6'>
						Bạn có chắc muốn đóng mà không lưu các thay đổi không?
					</p>
					<div className='flex justify-end gap-3'>
						<button
							onClick={() => setIsCloseConfirmModalOpen(false)}
							className='px-4 py-2 bg-transparent border border-[var(--color-border)] rounded hover:bg-[var(--color-background)] transition-colors'
						>
							Hủy
						</button>
						<button
							onClick={handleConfirmClose}
							className='px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)] transition-colors'
						>
							Xác nhận
						</button>
					</div>
				</div>
			</Modal>
			<Modal
				isOpen={isDeleteConfirmModalOpen}
				onClose={() => setIsDeleteConfirmModalOpen(false)}
				title='Xác nhận Xóa Tướng'
			>
				<div className='text-[var(--color-text-primary)]'>
					<p className='mb-6'>
						Bạn có thực sự muốn xóa tướng{" "}
						<strong>{championToDelete?.name}</strong>? Hành động này không thể
						hoàn tác.
					</p>
					<div className='flex justify-end gap-3'>
						<button
							onClick={() => setIsDeleteConfirmModalOpen(false)}
							className='px-4 py-2 bg-transparent border border-[var(--color-border)] rounded hover:bg-[var(--color-background)] transition-colors'
						>
							Hủy
						</button>
						<button
							onClick={handleConfirmDelete}
							className='px-4 py-2 bg-[var(--color-danger)] text-white rounded hover:bg-[var(--color-danger-hover)] transition-colors'
						>
							Xác nhận Xóa
						</button>
					</div>
				</div>
			</Modal>
			<Modal
				isOpen={notification.isOpen}
				onClose={() => setNotification(p => ({ ...p, isOpen: false }))}
				title={notification.title}
			>
				<div className='text-[var(--color-text-primary)]'>
					<p className='mb-6'>{notification.message}</p>
					<div className='flex justify-end'>
						<button
							onClick={() => setNotification(p => ({ ...p, isOpen: false }))}
							className='px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)] transition-colors'
						>
							Đã hiểu
						</button>
					</div>
				</div>
			</Modal>
		</div>
	);
}

export default memo(ChampionEditor);
