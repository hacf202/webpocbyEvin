// src/pages/admin/PowerEditor.jsx (ĐÃ ĐỒNG BỘ)
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/modal";
import Button from "../common/button";
import InputField from "../common/inputField"; // <-- IMPORT
import RarityIcon from "../common/rarityIcon";
import { useAuth } from "../../context/AuthContext.jsx";
import { removeAccents } from "../../utils/vietnameseUtils";
import SidePanel from "../common/sidePanel";
import { Loader2, XCircle, Plus } from "lucide-react"; // <-- IMPORT
// Cấu trúc Sức Mạnh mới mặc định
const NEW_POWER_TEMPLATE = {
	powerCode: Date.now().toString(),
	isNew: true,
	name: "Sức Mạnh Mới",
	rarity: "",
	description: "",
	descriptionRaw: "",
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	type: [],
};

const ITEMS_PER_PAGE = 20;

// --- Component con: Dành cho việc chỉnh sửa mảng "Loại" (type) (ĐÃ ĐỒNG BỘ) ---
const ArrayInputComponent = ({ label, data = [], onChange }) => {
	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue;
		onChange(newData);
	};

	const handleAddItem = () => {
		onChange([...data, ""]);
	};

	const handleRemoveItem = index => {
		const newData = data.filter((_, i) => i !== index);
		onChange(newData);
	};

	return (
		<div className='flex flex-col'>
			<div className='flex justify-between items-center mb-2'>
				<label className='font-semibold text-text-secondary'>{label}:</label>
				<Button
					onClick={handleAddItem}
					type='button'
					variant='outline'
					size='sm'
					iconLeft={<Plus size={14} />}
				>
					Thêm
				</Button>
			</div>
			<div className='flex flex-col gap-2'>
				{data.length > 0 ? (
					data.map((item, index) => (
						<div key={index} className='flex items-center gap-2'>
							<span className='font-bold text-text-secondary'>
								{index + 1}.
							</span>
							<InputField
								type='text'
								value={item || ""}
								onChange={e => handleItemChange(index, e.target.value)}
								className='flex-grow'
							/>
							<button
								onClick={() => handleRemoveItem(index)}
								type='button'
								className='text-text-secondary hover:text-danger-500 transition-colors'
							>
								<XCircle size={20} />
							</button>
						</div>
					))
				) : (
					<p className='text-sm text-center text-text-secondary bg-surface-hover p-2 rounded-md'>
						Chưa có mục nào.
					</p>
				)}
			</div>
		</div>
	);
};

// --- COMPONENT: PowerEditorForm (ĐÃ ĐỒNG BỘ) ---
const PowerEditorForm = memo(
	({ power, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState(power);

		useEffect(() => {
			setFormData(power);
		}, [power]);

		const handleInputChange = event => {
			const { name, value } = event.target;
			setFormData(previousData => ({
				...previousData,
				[name]: value,
			}));
		};

		const handleArrayChange = (fieldName, newArray) => {
			setFormData(previousData => ({ ...previousData, [fieldName]: newArray }));
		};

		return (
			<div className='p-4 bg-surface-bg rounded-lg border border-border'>
				{/* Header của Form */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-4 border-b border-border'>
					<div className='flex items-center gap-2 mb-2 sm:mb-0'>
						<h3 className='text-xl font-bold text-text-primary font-primary'>
							{power.isNew ? "Tạo Sức Mạnh Mới" : `Chỉnh sửa: ${power.name}`}
						</h3>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
						{!power.isNew && (
							<Button variant='danger' onClick={onDelete}>
								Xóa Sức Mạnh
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
							label='Mã (Power Code):'
							type='text'
							name='powerCode'
							value={formData.powerCode || ""}
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
						<ArrayInputComponent
							label='Loại (Type)'
							data={formData.type || []}
							onChange={newData => handleArrayChange("type", newData)}
						/>
					</div>
				</div>
			</div>
		);
	}
);

// --- COMPONENT: PowerCard (ĐÃ ĐỒNG BỘ) ---
const PowerCard = memo(({ power, onSelect }) => {
	return (
		<div
			key={power.powerCode}
			className='hover:scale-105 transition-transform duration-200 cursor-pointer'
			onClick={() => onSelect(power.powerCode)}
		>
			<div className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border'>
				<img
					src={power.assetAbsolutePath || "/images/placeholder.png"}
					alt={power.name}
					className='w-16 h-16 object-cover rounded-md border '
				/>
				<div className='flex-grow'>
					<h3 className='font-bold text-lg text-text-primary'>{power.name}</h3>
					<div className='flex items-center gap-2 text-sm text-text-secondary'>
						<RarityIcon rarity={power.rarity} />
						<span>{power.rarity}</span>
					</div>
				</div>
				<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
					<p className='whitespace-pre-wrap'>{power.descriptionRaw}</p>
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
		paginatedPowers,
		totalPages,
		currentPage,
		onPageChange,
		onSelectPower,
		selectedPower,
		onSavePower,
		onCancel,
		onDelete,
		isSaving,
		onBackToList,
	}) => {
		return (
			<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6'>
				{viewMode === "list" ? (
					<>
						{paginatedPowers.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
								{paginatedPowers.map(power => (
									<PowerCard
										key={power.powerCode}
										power={power}
										onSelect={onSelectPower}
									/>
								))}
							</div>
						) : (
							<div className='flex items-center justify-center h-full min-h-[300px] text-center text-text-secondary'>
								<div>
									<p className='font-semibold text-lg'>
										Không tìm thấy Sức Mạnh nào phù hợp.
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
					<PowerEditorForm
						power={selectedPower}
						onSave={onSavePower}
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

// --- COMPONENT CHÍNH: PowerEditor ---
function PowerEditor() {
	const { token } = useAuth();
	const [powers, setPowers] = useState([]);
	const [selectedPowerId, setSelectedPowerId] = useState(null);
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedRarities, setSelectedRarities] = useState([]);
	const [selectedTypes, setSelectedTypes] = useState([]);
	const [sortOrder, setSortOrder] = useState("name-asc");
	const [currentPage, setCurrentPage] = useState(1);
	const [viewMode, setViewMode] = useState("list"); // 'list' hoặc 'edit'
	const [isCloseConfirmModalOpen, setIsCloseConfirmModalOpen] = useState(false);
	const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] =
		useState(false);
	const [powerToDelete, setPowerToDelete] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState(null);
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});
	const [isBackNavigation, setIsBackNavigation] = useState(false); // <-- THÊM: Flag để phân biệt back vs cancel
	const backendUrl = import.meta.env.VITE_API_URL;
	const navigate = useNavigate();

	const fetchPowers = useCallback(async () => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await fetch(`${backendUrl}/api/powers`);
			if (!response.ok) throw new Error(`Lỗi mạng: ${response.status}`);
			const data = await response.json();
			const formattedData = data.map(power => ({
				...power,
				avatarUrl: power.assetAbsolutePath || "",
			}));
			setPowers(formattedData);
		} catch (e) {
			setError("Không thể tải dữ liệu từ máy chủ.");
		} finally {
			setIsLoading(false);
		}
	}, [backendUrl]);

	useEffect(() => {
		fetchPowers();
	}, [fetchPowers]);

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
		if (powers.length === 0) return { rarities: [], types: [], sort: [] };
		const rarities = [...new Set(powers.map(p => p.rarity))]
			.sort()
			.map(rarity => ({
				value: rarity,
				label: rarity,
				iconComponent: <RarityIcon rarity={rarity} />,
			}));
		const types = [...new Set(powers.flatMap(p => p.type || []))]
			.sort()
			.map(type => ({ value: type, label: type }));
		const sort = [
			{ value: "name-asc", label: "Tên A-Z" },
			{ value: "name-desc", label: "Tên Z-A" },
		];
		return { rarities, types, sort };
	}, [powers]);

	// Lọc và sắp xếp danh sách Sức Mạnh
	const filteredPowers = useMemo(() => {
		let filtered = [...powers];
		if (searchTerm) {
			const normalized = removeAccents(searchTerm.toLowerCase());
			filtered = filtered.filter(p =>
				removeAccents(p.name.toLowerCase()).includes(normalized)
			);
		}
		if (selectedRarities.length > 0) {
			filtered = filtered.filter(p => selectedRarities.includes(p.rarity));
		}
		if (selectedTypes.length > 0) {
			filtered = filtered.filter(p =>
				p.type?.some(t => selectedTypes.includes(t))
			);
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
	}, [powers, searchTerm, selectedRarities, selectedTypes, sortOrder]);

	const totalPages = Math.ceil(filteredPowers.length / ITEMS_PER_PAGE);
	const paginatedPowers = useMemo(
		() =>
			filteredPowers.slice(
				(currentPage - 1) * ITEMS_PER_PAGE,
				currentPage * ITEMS_PER_PAGE
			),
		[filteredPowers, currentPage]
	);

	const handleSelectPower = powerId => {
		setSelectedPowerId(powerId);
		setViewMode("edit");
	};

	const handleBackToList = () => {
		setViewMode("list");
		setSelectedPowerId(null);
		setCurrentPage(1);
	};

	const handleAddNewPower = () => {
		const newPower = {
			...NEW_POWER_TEMPLATE,
			powerCode: Date.now().toString(),
		};
		setPowers(prev => [newPower, ...prev]);
		setSelectedPowerId(newPower.powerCode);
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
		setSortOrder("name-asc");
		setCurrentPage(1);
		setViewMode("list");
	};

	const handleSavePower = async updatedPowerData => {
		setIsSaving(true);
		const { isNew, ...powerToSend } = updatedPowerData;
		try {
			if (!token)
				throw new Error("Không tìm thấy token. Vui lòng đăng nhập lại.");
			const response = await fetch(`${backendUrl}/api/powers`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(powerToSend),
			});
			if (!response.ok)
				throw new Error(
					response.status === 401 ? "Xác thực thất bại." : "Lỗi từ máy chủ."
				);

			await fetchPowers();
			setSelectedPowerId(null);
			setViewMode("list");
			setNotification({
				isOpen: true,
				title: "Thành Công",
				message: "Lưu Sức Mạnh thành công!",
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
		const power = powers.find(p => p.powerCode === selectedPowerId);
		setPowerToDelete(power);
		setIsDeleteConfirmModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!powerToDelete) return;
		setIsSaving(true);
		try {
			if (!token) throw new Error("Không tìm thấy token.");
			const response = await fetch(
				`${backendUrl}/api/powers/${powerToDelete.powerCode}`,
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
				message: `Đã xóa Sức Mạnh ${powerToDelete.name}.`,
			});
			setPowers(prev =>
				prev.filter(p => p.powerCode !== powerToDelete.powerCode)
			);
			setSelectedPowerId(null);
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
			setPowerToDelete(null);
		}
	};

	const handlePageChange = page => {
		setCurrentPage(page);
	};

	const selectedPower = powers.find(p => p.powerCode === selectedPowerId);

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
				<Button onClick={fetchPowers} variant='primary' className='mt-4'>
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
	];

	return (
		<div className='font-secondary'>
			{/* Layout: SidePanel và MainContent */}
			<div className='flex flex-col lg:flex-row gap-6'>
				{/* MainContent */}
				<div className='lg:w-4/5'>
					<MainContent
						viewMode={viewMode}
						paginatedPowers={paginatedPowers}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={handlePageChange}
						onSelectPower={handleSelectPower}
						selectedPower={selectedPower}
						onSavePower={handleSavePower}
						onCancel={() => handleAttemptClose(false)}
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
					/>
				</div>
				{/* SidePanel */}
				<div className='lg:w-1/5'>
					<SidePanel
						searchPlaceholder='Nhập tên sức mạnh...'
						addLabel='Thêm Sức Mạnh Mới'
						resetLabel='Đặt lại bộ lọc'
						searchInput={searchInput}
						onSearchInputChange={e => setSearchInput(e.target.value)}
						onSearch={handleSearch}
						onClearSearch={handleClearSearch}
						onAddNew={handleAddNewPower}
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
				title='Xác nhận Xóa Sức Mạnh'
			>
				<div className='text-text-secondary'>
					<p className='mb-6'>
						Bạn có thực sự muốn xóa Sức Mạnh{" "}
						<strong className='text-text-primary'>{powerToDelete?.name}</strong>
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

export default memo(PowerEditor);
