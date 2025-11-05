// src/pages/admin/ItemEditor.jsx (ĐÃ ĐỒNG BỘ)
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/modal";
import Button from "../common/button";
import InputField from "../common/inputField"; // <-- IMPORT
import RarityIcon from "../common/rarityIcon";
import { useAuth } from "../../context/AuthContext.jsx";
import { removeAccents } from "../../utils/vietnameseUtils";
import SidePanel from "../common/sidePanel";
import { Loader2 } from "lucide-react"; // <-- IMPORT

// Cấu trúc đồ vật mới mặc định
const NEW_ITEM_TEMPLATE = {
	itemCode: Date.now().toString(),
	isNew: true,
	name: "Đồ Vật Mới",
	rarity: "",
	rarityRef: "",
	description: "",
	descriptionRaw: "",
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
};

const ITEMS_PER_PAGE = 20;

// --- COMPONENT: ItemEditorForm (ĐÃ ĐỒNG BỘ) ---
const ItemEditorForm = memo(
	({ item, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState(item);

		useEffect(() => {
			setFormData(item);
		}, [item]);

		const handleInputChange = event => {
			const { name, value } = event.target;
			setFormData(previousData => ({
				...previousData,
				[name]: value,
			}));
		};

		return (
			<div className='p-4 bg-surface-bg rounded-lg border border-border'>
				{/* Header của Form */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-4 border-b border-border'>
					<div className='flex items-center gap-2 mb-2 sm:mb-0'>
						<h3 className='text-xl font-bold text-text-primary font-primary'>
							{item.isNew ? "Tạo Đồ Vật Mới" : `Chỉnh sửa: ${item.name}`}
						</h3>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
						{!item.isNew && (
							<Button variant='danger' onClick={onDelete}>
								Xóa Đồ Vật
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
							label='Mã (Item Code):'
							type='text'
							name='itemCode'
							value={formData.itemCode || ""}
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

					{/* Section: Tài nguyên */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2 font-primary'>
							2. Tài nguyên
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
					</div>
				</div>
			</div>
		);
	}
);

// --- COMPONENT: ItemCard (ĐÃ ĐỒNG BỘ) ---
const ItemCard = memo(({ item, onSelect }) => {
	return (
		<div
			key={item.itemCode}
			className='hover:scale-105 transition-transform duration-200 cursor-pointer'
			onClick={() => onSelect(item.itemCode)}
		>
			<div className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border'>
				<img
					src={item.assetAbsolutePath || "/images/placeholder.png"}
					alt={item.name}
					className='w-16 h-16 object-cover rounded-md border border-border'
				/>
				<div className='flex-grow'>
					<h3 className='font-bold text-lg text-text-primary'>{item.name}</h3>
					<div className='flex items-center gap-2 text-sm text-text-secondary'>
						<RarityIcon rarity={item.rarity} />
						<span>{item.rarity}</span>
					</div>
				</div>
				<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
					<p className='whitespace-pre-wrap'>{item.descriptionRaw}</p>
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
		paginatedItems,
		totalPages,
		currentPage,
		onPageChange,
		onSelectItem,
		selectedItem,
		onSaveItem,
		onCancel,
		onDelete,
		isSaving,
		onBackToList,
	}) => {
		return (
			<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6'>
				{viewMode === "list" ? (
					<>
						{paginatedItems.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
								{paginatedItems.map(item => (
									<ItemCard
										key={item.itemCode}
										item={item}
										onSelect={onSelectItem}
									/>
								))}
							</div>
						) : (
							<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
								<div>
									<p className='font-semibold text-lg'>
										Không tìm thấy đồ vật nào phù hợp.
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
					<ItemEditorForm
						item={selectedItem}
						onSave={onSaveItem}
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
// --- COMPONENT CHÍNH: ItemEditor ---
function ItemEditor() {
	const { token } = useAuth();
	const [items, setItems] = useState([]);
	const [selectedItemId, setSelectedItemId] = useState(null);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [viewMode, setViewMode] = useState("list"); // 'list' hoặc 'edit'
	const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] = useState(false);
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
		useState(false);
	const [itemToDelete, setItemToDelete] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});
	const [isBackNavigation, setIsBackNavigation] = useState(false);
	const backendUrl = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	const fetchItems = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`${backendUrl}/api/items`);
			if (!response.ok) throw new Error(`Lỗi mạng: ${response.status}`);
			const data = await response.json();
			const formattedData = data.map(item => ({
				...item,
				avatarUrl: item.assetAbsolutePath || "",
			}));
			setItems(formattedData);
		} catch (e) {
			setError("Không thể tải dữ liệu từ máy chủ.");
		} finally {
			setIsLoading(false);
		}
	}, [backendUrl]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

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
		if (items.length === 0) return { rarities: [], sort: [] };
		const rarities = [...new Set(items.map(i => i.rarity))]
			.sort()
			.map(rarity => ({
				value: rarity,
				label: rarity,
				iconComponent: <RarityIcon rarity={rarity} />,
			}));
		const sort = [
			{ value: "name-asc", label: "Tên A-Z" },
			{ value: "name-desc", label: "Tên Z-A" },
		];
		return { rarities, sort };
	}, [items]);

	// Lọc và sắp xếp danh sách đồ vật
	const filteredItems = useMemo(() => {
		let filtered = [...items];
		if (searchTerm) {
			const normalized = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(i =>
				removeAccents(i.name.toLowerCase()).includes(normalized)
			);
		}
		if (selectedRarities.length > 0) {
			filtered = filtered.filter(i => selectedRarities.includes(i.rarity));
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
	}, [items, searchTerm, selectedRarities, sortOrder]);

	const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
	const paginatedItems = useMemo(
		() =>
			filteredItems.slice(
				(currentPage - 1) * ITEMS_PER_PAGE,
				currentPage * ITEMS_PER_PAGE
			),
		[filteredItems, currentPage]
	);

	const handleSelectItem = itemId => {
		setSelectedItemId(itemId);
		setViewMode("edit");
	};

	const handleBackToList = () => {
		setViewMode("list");
		setSelectedItemId(null);
		setCurrentPage(1);
	};

	const handleAddNewItem = () => {
		const newItem = {
			...NEW_ITEM_TEMPLATE,
			itemCode: Date.now().toString(),
		};
		setItems(prev => [newItem, ...prev]);
		setSelectedItemId(newItem.itemCode);
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
		setSortOrder("name-asc");
		setCurrentPage(1);
		setViewMode("list");
	};

	const handleSaveItem = async updatedItemData => {
		setIsSaving(true);
		const { isNew, ...itemToSend } = updatedItemData;
		try {
			if (!token)
				throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
			const response = await fetch(`${backendUrl}/api/items`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(itemToSend),
			});
			if (!response.ok)
				throw new Error(
					response.status === 401 ? "Xác thực thất bại." : "Lỗi từ máy chủ."
				);

			await fetchItems();
			setSelectedItemId(null);
			setViewMode("list");
			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: "Lưu đồ vật thành công!",
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
		const item = items.find(i => i.itemCode === selectedItemId);
		setItemToDelete(item);
		setIsDeleteConfirmModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!itemToDelete) return;
		setIsSaving(true);
		try {
			if (!token) throw new Error("Không tìm thấy token.");
			const response = await fetch(
				`${backendUrl}/api/items/${itemToDelete.itemCode}`,
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
				message: `Đã xóa đồ vật ${itemToDelete.name}.`,
			});
			setItems(prev => prev.filter(i => i.itemCode !== itemToDelete.itemCode));
			setSelectedItemId(null);
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
			setItemToDelete(null);
		}
	};

	const handlePageChange = page => {
		setCurrentPage(page);
	};

	const handleBackNavigation = () => {
		if (viewMode === "edit") {
			handleAttemptClose(true);
		} else {
			navigate(-1);
		}
	};

	const selectedItem = items.find(i => i.itemCode === selectedItemId);

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
				<Button onClick={fetchItems} variant='primary' className='mt-4'>
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
	];

	return (
		<div className='font-secondary'>
			<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
				Quản Lý Đồ Vật
			</h1>

			<Button variant='outline' onClick={handleBackNavigation} className='mb-4'>
				Quay Lại
			</Button>

			{/* Layout: MainContent và SidePanel */}
			<div className='flex flex-col lg:flex-row gap-6'>
				{/* MainContent */}
				<div className='lg:w-4/5'>
					<MainContent
						viewMode={viewMode}
						paginatedItems={paginatedItems}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={handlePageChange}
						onSelectItem={handleSelectItem}
						selectedItem={selectedItem}
						onSaveItem={handleSaveItem}
						onCancel={() => handleAttemptClose(false)}
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
					/>
				</div>
				{/* SidePanel */}
				<div className='lg:w-1/5'>
					<SidePanel
						searchPlaceholder='Nhập tên đồ vật...'
						addLabel='Thêm Đồ Vật Mới'
						resetLabel='Đặt lại bộ lọc'
						searchInput={searchInput}
						onSearchInputChange={e => setSearchInput(e.target.value)}
						onSearch={handleSearch}
						onClearSearch={handleClearSearch}
						onAddNew={handleAddNewItem}
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
				title='Xác nhận Xóa Đồ Vật'
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						Bạn có thực sự muốn xóa đồ vật <strong>{itemToDelete?.name}</strong>
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

export default memo(ItemEditor);
