// src/pages/admin/ChampionEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
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
	championID: "",
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
			fullAbsolutePath: "",
			gameAbsolutePath: "",
			avatar: "",
		},
	],
	videoLink: "", // Giờ đã có sẵn trong champion
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
		cachedData,
	}) => {
		return (
			<div className='bg-surface-bg rounded-lg'>
				{viewMode === "list" ? (
					<>
						{paginatedChampions.length > 0 ? (
							<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
								{paginatedChampions.map(champion => (
									<Link
										key={champion.championID}
										to={`/champion/${champion.championID}`}
										className='block hover:scale-105 transition-transform duration-200'
										onClick={e => {
											e.preventDefault();
											onSelectChampion(champion.championID);
										}}
									>
										<ChampionCard champion={champion} />
									</Link>
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
						// Không cần truyền videoLinks riêng nữa
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

	const API_BASE_URL = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	// === FETCH DATA (đã loại bỏ champion-videos) ===
	const fetchAllData = useCallback(async () => {
		try {
			setIsLoading(true);
			const [champRes, runeRes, relicRes, powerRes, itemRes] =
				await Promise.all([
					fetch(`${API_BASE_URL}/api/champions`),
					fetch(`${API_BASE_URL}/api/runes`),
					fetch(`${API_BASE_URL}/api/relics`),
					fetch(`${API_BASE_URL}/api/powers`),
					fetch(`${API_BASE_URL}/api/items`),
				]);

			if (![champRes, runeRes, relicRes, powerRes, itemRes].every(r => r.ok)) {
				throw new Error("Không thể tải dữ liệu");
			}

			const [champData, runeData, relicData, powerData, itemData] =
				await Promise.all([
					champRes.json(),
					runeRes.json(),
					relicRes.json(),
					powerRes.json(),
					itemRes.json(),
				]);

			setChampions(champData);
			setRunes(runeData);
			setRelics(relicData);
			setPowers(powerData);
			setItems(itemData);
		} catch (e) {
			setError("Không thể tải dữ liệu từ server.");
		} finally {
			setIsLoading(false);
		}
	}, [API_BASE_URL]);

	useEffect(() => {
		fetchAllData();
	}, [fetchAllData]);

	// === FILTER & SORT (giữ nguyên) ===
	const filterOptions = useMemo(() => {
		const regions = [...new Set(champions.flatMap(c => c.regions || []))]
			.sort()
			.map(r => ({
				value: r,
				label: r,
				iconUrl: iconRegions.find(i => i.name === r)?.iconAbsolutePath || "",
			}));

		const costs = [...new Set(champions.map(c => c.cost))].sort(
			(a, b) => a - b
		);
		const maxStars = [...new Set(champions.map(c => c.maxStar))].sort(
			(a, b) => a - b
		);
		const tags = [...new Set(champions.flatMap(c => c.tag || []))].sort();

		return {
			regions,
			costs: costs.map(c => ({ value: c, label: `${c} Mana` })),
			maxStars: maxStars.map(s => ({ value: s, label: `${s} Star` })),
			tags: tags.map(t => ({ value: t, label: t })),
			sort: [
				{ value: "name-asc", label: "Tên A-Z" },
				{ value: "name-desc", label: "Tên Z-A" },
				{ value: "cost-asc", label: "Mana thấp → cao" },
				{ value: "cost-desc", label: "Mana cao → thấp" },
			],
		};
	}, [champions]);

	const filteredChampions = useMemo(() => {
		let result = [...champions];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			result = result.filter(c =>
				removeAccents(c.name.toLowerCase()).includes(term)
			);
		}
		if (selectedRegions.length)
			result = result.filter(c =>
				c.regions?.some(r => selectedRegions.includes(r))
			);
		if (selectedCosts.length)
			result = result.filter(c => selectedCosts.includes(c.cost));
		if (selectedMaxStars.length)
			result = result.filter(c => selectedMaxStars.includes(c.maxStar));
		if (selectedTags.length)
			result = result.filter(c => c.tag?.some(t => selectedTags.includes(t)));

		const [field, dir] = sortOrder.split("-");
		result.sort((a, b) => {
			const A = field === "name" ? a.name : a[field];
			const B = field === "name" ? b.name : b[field];
			return dir === "asc" ? (A > B ? 1 : -1) : A < B ? 1 : -1;
		});

		return result;
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
	const handleSelectChampion = id => {
		const champ = champions.find(c => c.championID === id);
		setSelectedChampion(champ ? { ...champ } : null);
		setViewMode("edit");
	};

	const handleAddNewChampion = () => {
		setSelectedChampion({ ...NEW_CHAMPION_TEMPLATE });
		setViewMode("edit");
	};

	const handleSaveChampion = async data => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const method = data.isNew ? "POST" : "PUT"; // Sửa: tạo mới dùng POST
			const url = data.isNew
				? `${API_BASE_URL}/api/champions`
				: `${API_BASE_URL}/api/champions/${data.championID}`;

			const res = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(data),
			});

			if (!res.ok) {
				const err = await res.text();
				throw new Error(err || "Lưu thất bại");
			}

			setNotification({
				isOpen: true,
				title: "Thành công!",
				message: data.isNew
					? "Tạo tướng mới thành công"
					: "Cập nhật thành công",
			});

			await fetchAllData();
			setViewMode("list");
			setSelectedChampion(null);
		} catch (e) {
			setNotification({
				isOpen: true,
				title: "Lỗi",
				message: e.message || "Đã có lỗi xảy ra",
			});
		} finally {
			setIsSaving(false);
		}
	};

	const handleAttemptClose = () => {
		if (
			selectedChampion &&
			JSON.stringify(selectedChampion) !==
				JSON.stringify(
					champions.find(c => c.championID === selectedChampion.championID) ||
						NEW_CHAMPION_TEMPLATE
				)
		) {
			setIsCloseConfirmModalOpen(true);
		} else {
			setViewMode("list");
			setSelectedChampion(null);
		}
	};

	const handleConfirmClose = () => {
		setViewMode("list");
		setSelectedChampion(null);
		setIsCloseConfirmModalOpen(false);
	};

	const handleAttemptDelete = () => setIsDeleteConfirmModalOpen(true);

	const handleConfirmDelete = async () => {
		if (!selectedChampion || selectedChampion.isNew) return;
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(
				`${API_BASE_URL}/api/champions/${selectedChampion.championID}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (!res.ok) throw new Error("Xóa thất bại");

			setNotification({
				isOpen: true,
				title: "Đã xóa",
				message: `${selectedChampion.name} đã được xóa`,
			});
			await fetchAllData();
			setViewMode("list");
			setSelectedChampion(null);
		} catch (e) {
			setNotification({ isOpen: true, title: "Lỗi", message: e.message });
		} finally {
			setIsSaving(false);
			setIsDeleteConfirmModalOpen(false);
		}
	};

	const handleSearch = () => {
		setSearchTerm(searchInput.trim());
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
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

	const cachedData = { runes, relics, powers, items };

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
				<Button onClick={fetchAllData} variant='primary' className='mt-4'>
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
						onPageChange={setCurrentPage}
						onSelectChampion={handleSelectChampion}
						selectedChampion={selectedChampion}
						onSaveChampion={handleSaveChampion}
						onCancel={handleAttemptClose}
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
						cachedData={cachedData}
					/>
				</div>

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
							onClose={handleAttemptClose}
						/>
					)}
				</div>
			</div>

			{/* Modal xác nhận đóng */}
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

			{/* Modal xác nhận xóa */}
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

			{/* Notification modal */}
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
