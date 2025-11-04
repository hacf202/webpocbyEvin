// src/pages/admin/RelicEditor.jsx (ĐÃ ĐỒNG BỘ)
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/modal";
import Button from "../common/button";
import InputField from "../common/inputField"; // <-- IMPORT
import RarityIcon from "../common/rarityIcon";
import { useAuth } from "../../context/authContext";
import { removeAccents } from "../../utils/vietnameseUtils";
import SidePanel from "../common/sidePanel";
import { Loader2, ChevronLeft } from "lucide-react"; // <-- IMPORT

// Cấu trúc di vật mới mặc định
const NEW_RELIC_TEMPLATE = {
	relicCode: Date.now().toString(),
	isNew: true,
	name: "Di Vật Mới",
	rarity: "",
	rarityRef: "",
	description: "",
	descriptionRaw: "",
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	type: "Relic",
	stack: 1,
};

const ITEMS_PER_PAGE = 20;

// --- COMPONENT: RelicEditorForm (ĐÃ ĐỒNG BỘ) ---
const RelicEditorForm = memo(
	({ relic, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState(relic);

		useEffect(() => {
			setFormData(relic);
		}, [relic]);

		const handleInputChange = event => {
			const { name, value } = event.target;
			setFormData(previousData => ({
				...previousData,
				[name]: name === "stack" ? parseInt(value, 10) || 1 : value,
			}));
		};

		return (
			<div className='p-4 bg-surface-bg rounded-lg border border-border'>
				{/* Header của Form */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-4 border-b border-border'>
					<div className='flex items-center gap-2 mb-2 sm:mb-0'>
						<h3 className='text-xl font-bold text-text-primary font-primary'>
							{relic.isNew ? "Tạo Di Vật Mới" : `Chỉnh sửa: ${relic.name}`}
						</h3>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
						{!relic.isNew && (
							<Button variant='danger' onClick={onDelete}>
								Xóa Di Vật
							</Button>
						)}
						<Button variant='outline' onClick={onCancel}>
							Hủy
						</Button>
						<Button
							variant='primary'
							onClick={() => onSave(formData)}
							disabled={isSaving}
						>
							{isSaving ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					</div>
				</div>

				{/* Grid Layout cho Form */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Section: Thông tin cơ bản */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2 font-primary'>
							1. Thông tin cơ bản
						</h4>
						<InputField
							label='Mã (Relic Code):'
							type='text'
							name='relicCode'
							value={formData.relicCode || ""}
							onChange={handleInputChange}
							disabled={!formData.isNew}
						/>
						<InputField
							label='Tên (Name):'
							type='text'
							name='name'
							value={formData.name || ""}
							onChange={handleInputChange}
						/>
						<InputField
							label='Độ hiếm (Rarity):'
							type='text'
							name='rarity'
							value={formData.rarity || ""}
							onChange={handleInputChange}
						/>
						<InputField
							label='Độ hiếm Tham chiếu (Rarity Ref):'
							type='text'
							name='rarityRef'
							value={formData.rarityRef || ""}
							onChange={handleInputChange}
						/>
						<InputField
							label='Stack:'
							type='number'
							name='stack'
							value={formData.stack || 1}
							onChange={handleInputChange}
							min={1}
						/>
						<div className='flex flex-col gap-1'>
							<label className='block text-sm font-medium mb-1 text-text-secondary'>
								Mô tả (Description):
							</label>
							<textarea
								name='description'
								rows={4}
								value={formData.description || ""}
								onChange={handleInputChange}
								className='w-full p-2 bg-input-bg text-input-text rounded-md border border-input-border
                  placeholder:text-input-placeholder
                  focus:border-input-focus-border focus:ring-0 focus:outline-none 
                  transition-colors duration-200 resize-y'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='block text-sm font-medium mb-1 text-text-secondary'>
								Mô tả Thô (Description Raw):
							</label>
							<textarea
								name='descriptionRaw'
								rows={4}
								value={formData.descriptionRaw || ""}
								onChange={handleInputChange}
								className='w-full p-2 bg-input-bg text-input-text rounded-md border border-input-border
                  placeholder:text-input-placeholder
                  focus:border-input-focus-border focus:ring-0 focus:outline-none 
                  transition-colors duration-200 resize-y'
							/>
						</div>
					</div>

					{/* Section: Tài nguyên & Loại */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2 font-primary'>
							2. Tài nguyên & Loại
						</h4>
						<InputField
							label='Đường dẫn Ảnh (Asset Absolute Path):'
							type='text'
							name='assetAbsolutePath'
							value={formData.assetAbsolutePath || ""}
							onChange={handleInputChange}
						/>
						<InputField
							label='Đường dẫn Ảnh Đầy đủ (Asset Full Absolute Path):'
							type='text'
							name='assetFullAbsolutePath'
							value={formData.assetFullAbsolutePath || ""}
							onChange={handleInputChange}
						/>
						<InputField
							label='Loại (Type):'
							type='text'
							name='type'
							value={formData.type || ""}
							onChange={handleInputChange}
						/>
					</div>
				</div>
			</div>
		);
	}
);

// --- COMPONENT: RelicCard (ĐÃ ĐỒNG BỘ) ---
const RelicCard = memo(({ relic, onSelect }) => {
	return (
		<div
			key={relic.relicCode}
			className='hover:scale-105 transition-transform duration-200 cursor-pointer'
			onClick={() => onSelect(relic.relicCode)}
		>
			<div className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border'>
				<img
					src={relic.assetAbsolutePath || "/images/placeholder.png"}
					alt={relic.name}
					className='w-16 h-16 object-cover rounded-md border border-border'
				/>
				<div className='flex-grow'>
					<h3 className='font-bold text-lg text-text-primary'>{relic.name}</h3>
					<div className='flex items-center gap-2 text-sm text-text-secondary'>
						<RarityIcon rarity={relic.rarity} />
						<span>{relic.rarity}</span>
					</div>
				</div>
				<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
					<p className='whitespace-pre-wrap'>{relic.descriptionRaw}</p>
					<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900'></div>
				</div>
			</div>
		</div>
	);
});

// --- COMPONENT: MainContent (ĐÃ ĐỒNG BỘ) ---
const MainContent = memo(
	({
		viewMode,
		paginatedRelics,
		totalPages,
		currentPage,
		onPageChange,
		onSelectRelic,
		selectedRelic,
		onSaveRelic,
		onCancel,
		onDelete,
		isSaving,
		onBackToList,
	}) => {
		return (
			<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6'>
				{viewMode === "list" ? (
					<>
						{paginatedRelics.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
								{paginatedRelics.map(relic => (
									<RelicCard
										key={relic.relicCode}
										relic={relic}
										onSelect={onSelectRelic}
									/>
								))}
							</div>
						) : (
							<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
								<div>
									<p className='font-semibold text-lg'>
										Không tìm thấy di vật nào phù hợp.
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
					<RelicEditorForm
						relic={selectedRelic}
						onSave={onSaveRelic}
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

// --- COMPONENT CHÍNH: RelicEditor ---
function RelicEditor() {
	const { token } = useAuth();
	const [relics, setRelics] = useState([]);
	const [selectedRelicId, setSelectedRelicId] = useState(null);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [selectedStacks, setSelectedStacks] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [viewMode, setViewMode] = useState("list"); // 'list' hoặc 'edit'
	const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] = useState(false);
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
		useState(false);
	const [relicToDelete, setRelicToDelete] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});
	const [isBackNavigation, setIsBackNavigation] = useState(false); // <-- THÊM: Flag để phân biệt back vs cancel
	const backendUrl =
		import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
	const navigate = useNavigate();

	const fetchRelics = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`${backendUrl}/api/relics`);
			if (!response.ok) throw new Error(`Lỗi mạng: ${response.status}`);
			const data = await response.json();
			const formattedData = data.map(relic => ({
				...relic,
				avatarUrl: relic.assetAbsolutePath || "",
			}));
			setRelics(formattedData);
		} catch (e) {
			setError("Không thể tải dữ liệu từ máy chủ.");
		} finally {
			setIsLoading(false);
		}
	}, [backendUrl]);

	useEffect(() => {
		fetchRelics();
	}, [fetchRelics]);

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

	// Tạo các tùy chọn cho bộ lọc
	const filterOptions = useMemo(() => {
		if (relics.length === 0)
			return { rarities: [], types: [], stacks: [], sort: [] };
		const rarities = [...new Set(relics.map(r => r.rarity))]
			.sort()
			.map(rarity => ({
				value: rarity,
				label: rarity,
				iconComponent: <RarityIcon rarity={rarity} />,
			}));
		const types = [...new Set(relics.map(r => r.type || []))]
			.sort()
			.map(type => ({ value: type, label: type }));
		const stacks = [...new Set(relics.map(r => r.stack))]
			.sort((a, b) => a - b)
			.map(stack => ({ value: stack, label: `Stack ${stack}` }));
		const sort = [
			{ value: "name-asc", label: "Tên A-Z" },
			{ value: "name-desc", label: "Tên Z-A" },
		];
		return { rarities, types, stacks, sort };
	}, [relics]);

	// Lọc và sắp xếp danh sách di vật
	const filteredRelics = useMemo(() => {
		let filtered = [...relics];
		if (searchTerm) {
			const normalized = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(r =>
				removeAccents(r.name.toLowerCase()).includes(normalized)
			);
		}
		if (selectedRarities.length > 0) {
			filtered = filtered.filter(r => selectedRarities.includes(r.rarity));
		}
		if (selectedTypes.length > 0) {
			filtered = filtered.filter(r => selectedTypes.includes(r.type));
		}
		if (selectedStacks.length > 0) {
			filtered = filtered.filter(r => selectedStacks.includes(r.stack));
		}

		const [sortKey, sortDirection] = sortOrder.split("-");
		filtered.sort((a, b) => {
			const valA = a[sortKey] || "";
			const valB = b[sortKey] || "";
			return sortDirection === "asc"
				? valA.localeCompare(valB)
				: valB.localeCompare(valA);
		});

		return filtered;
	}, [
		relics,
		searchTerm,
		selectedRarities,
		selectedTypes,
		selectedStacks,
		sortOrder,
	]);

	const totalPages = Math.ceil(filteredRelics.length / ITEMS_PER_PAGE);
	const paginatedRelics = useMemo(
		() =>
			filteredRelics.slice(
				(currentPage - 1) * ITEMS_PER_PAGE,
				currentPage * ITEMS_PER_PAGE
			),
		[filteredRelics, currentPage]
	);

	const handleSelectRelic = relicId => {
		setSelectedRelicId(relicId);
		setViewMode("edit");
	};

	const handleBackToList = () => {
		setViewMode("list");
		setSelectedRelicId(null);
		setCurrentPage(1);
	};

	const handleAddNewRelic = () => {
		const newRelic = {
			...NEW_RELIC_TEMPLATE,
			relicCode: Date.now().toString(),
		};
		setRelics(prev => [newRelic, ...prev]);
		setSelectedRelicId(newRelic.relicCode);
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
		setSelectedRarities([]);
		setSelectedTypes([]);
		setSelectedStacks([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
		setViewMode("list");
	};

	const handleSaveRelic = async updatedRelicData => {
		setIsSaving(true);
		const { isNew, ...relicToSend } = updatedRelicData;
		try {
			if (!token)
				throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
			const response = await fetch(`${backendUrl}/api/relics`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(relicToSend),
			});
			if (!response.ok)
				throw new Error(
					response.status === 401 ? "Xác thực thất bại." : "Lỗi từ máy chủ."
				);

			await fetchRelics();
			setSelectedRelicId(null);
			setViewMode("list");
			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: "Lưu di vật thành công!",
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
		const relic = relics.find(r => r.relicCode === selectedRelicId);
		setRelicToDelete(relic);
		setIsDeleteConfirmModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!relicToDelete) return;
		setIsSaving(true);
		try {
			if (!token) throw new Error("Không tìm thấy token.");
			const response = await fetch(
				`${backendUrl}/api/relics/${relicToDelete.relicCode}`,
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
				message: `Đã xóa di vật ${relicToDelete.name}.`,
			});
			setRelics(prev =>
				prev.filter(r => r.relicCode !== relicToDelete.relicCode)
			);
			setSelectedRelicId(null);
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
			setRelicToDelete(null);
		}
	};

	const handlePageChange = page => {
		setCurrentPage(page);
	};

	const handleBackNavigation = () => {
		if (viewMode === "edit") {
			handleAttemptClose(true); // <-- THÊM ĐỔI: Set isBack = true
		} else {
			navigate(-1);
		}
	};

	const selectedRelic = relics.find(r => r.relicCode === selectedRelicId);

	if (isLoading)
		return (
			<div className='flex flex-col items-center justify-center min-h-screen text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<div className='text-lg mt-4'>Đang tải...</div>
			</div>
		);
	if (error)
		return (
			<div className='text-center text-lg p-10 text-danger-text-dark'>
				{error}{" "}
				<Button onClick={fetchRelics} variant='primary' className='mt-4'>
					Thử lại
				</Button>
			</div>
		);

	const multiFilterConfigs = [
		{
			label: "Độ hiếm",
			options: filterOptions.rarities,
			selectedValues: selectedRarities,
			onChange: setSelectedRarities,
			placeholder: "Tất cả Độ hiếm",
		},
		{
			label: "Loại",
			options: filterOptions.types,
			selectedValues: selectedTypes,
			onChange: setSelectedTypes,
			placeholder: "Tất cả Loại",
		},
		{
			label: "Stack",
			options: filterOptions.stacks,
			selectedValues: selectedStacks,
			onChange: setSelectedStacks,
			placeholder: "Tất cả Stack",
		},
	];

	return (
		<div className='font-secondary'>
			<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
				Quản Lý Di Vật
			</h1>

			<Button variant='outline' onClick={handleBackNavigation} className='mb-4'>
				<ChevronLeft size={18} className='mr-1' />
				Quay Lại
			</Button>

			{/* Layout: SidePanel và MainContent */}
			<div className='flex flex-col lg:flex-row gap-6'>
				{/* MainContent */}
				<div className='lg:w-4/5'>
					<MainContent
						viewMode={viewMode}
						paginatedRelics={paginatedRelics}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={handlePageChange}
						onSelectRelic={handleSelectRelic}
						selectedRelic={selectedRelic}
						onSaveRelic={handleSaveRelic}
						onCancel={() => handleAttemptClose(false)}
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
					/>
				</div>
				{/* SidePanel */}
				<div className='lg:w-1/5'>
					<SidePanel
						searchPlaceholder='Nhập tên di vật...'
						addLabel='Thêm Di Vật Mới'
						resetLabel='Đặt lại bộ lọc'
						searchInput={searchInput}
						onSearchInputChange={e => setSearchInput(e.target.value)}
						onSearch={handleSearch}
						onClearSearch={handleClearSearch}
						onAddNew={handleAddNewRelic}
						onResetFilters={handleResetFilters}
						multiFilterConfigs={multiFilterConfigs}
						sortOptions={filterOptions.sort}
						sortSelectedValue={sortOrder}
						onSortChange={setSortOrder}
					/>
				</div>
			</div>

			{/* Các Modal (ĐÃ ĐỒNG BỘ) */}
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
				title='Xác nhận Xóa Di Vật'
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						Bạn có thực sự muốn xóa di vật{" "}
						<strong className='text-text-primary'>{relicToDelete?.name}</strong>
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

export default memo(RelicEditor);
