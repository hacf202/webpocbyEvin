// PowerEditor.jsx
import { useState, memo, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import RarityIcon from "../components/common/RarityIcon";
import { useAuth } from "../context/AuthContext";
import { removeAccents } from "../utils/vietnameseUtils";
import SidePanel from "../components/common/SidePanel"; // <-- THAY ĐỔI: Import SidePanel chung

// Cấu trúc năng lực mới mặc định
const NEW_POWER_TEMPLATE = {
	powerCode: Date.now().toString(),
	isNew: true,
	name: "Năng Lực Mới",
	rarity: "",
	description: "",
	descriptionRaw: "",
	assetAbsolutePath: "",
	assetFullAbsolutePath: "",
	type: [],
};

const ITEMS_PER_PAGE = 20;

// --- Component con: Dành cho việc chỉnh sửa mảng "Loại" (type) ---
const ArrayInputComponent = ({ label, data = [], onChange }) => {
	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue; // Mảng type chỉ chứa chuỗi, không cần object {S: ...}
		onChange(newData);
	};

	const handleAddItem = () => {
		onChange([...data, ""]); // Thêm một chuỗi rỗng
	};

	const handleRemoveItem = index => {
		const newData = data.filter((_, i) => i !== index);
		onChange(newData);
	};

	return (
		<div className='flex flex-col'>
			<div className='flex justify-between items-center mb-2'>
				<label className='font-semibold text-[var(--color-text-secondary)]'>
					{label}:
				</label>
				<button
					onClick={handleAddItem}
					type='button'
					className='px-3 py-1 text-xs font-semibold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] transition-colors'
				>
					+ Thêm
				</button>
			</div>
			<div className='flex flex-col gap-2'>
				{data.length > 0 ? (
					data.map((item, index) => (
						<div key={index} className='flex items-center gap-2'>
							<span className='font-bold text-[var(--color-text-secondary)]'>
								{index + 1}.
							</span>
							<input
								type='text'
								value={item || ""}
								onChange={e => handleItemChange(index, e.target.value)}
								className='flex-grow p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
							<button
								onClick={() => handleRemoveItem(index)}
								type='button'
								className='text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									viewBox='0 0 20 20'
									fill='currentColor'
								>
									<path
										fillRule='evenodd'
										d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
										clipRule='evenodd'
									/>
								</svg>
							</button>
						</div>
					))
				) : (
					<p className='text-sm text-center text-[var(--color-text-secondary)] bg-[var(--color-background)] p-2 rounded-md'>
						Chưa có mục nào.
					</p>
				)}
			</div>
		</div>
	);
};

// --- COMPONENT: PowerEditorForm ---
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
			<div className='p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]'>
				{/* Header của Form */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-4 border-b border-[var(--color-border)]'>
					<div className='flex items-center gap-2 mb-2 sm:mb-0'>
						<h3 className='text-xl font-bold text-[var(--color-text-primary)]'>
							{power.isNew ? "Tạo Năng Lực Mới" : `Chỉnh sửa: ${power.name}`}
						</h3>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
						{!power.isNew && (
							<button
								onClick={onDelete}
								className='px-4 py-2 text-sm font-semibold text-white bg-[var(--color-danger)] rounded-md hover:bg-[var(--color-danger-hover)] transition-colors'
							>
								Xóa Năng Lực
							</button>
						)}
						<button
							onClick={onCancel}
							className='px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] bg-transparent border border-[var(--color-border)] rounded-md hover:bg-[var(--color-background)] transition-colors'
						>
							Hủy
						</button>
						<button
							onClick={() => onSave(formData)}
							className='px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
							disabled={isSaving}
						>
							{isSaving ? "Đang lưu..." : "Lưu thay đổi"}
						</button>
					</div>
				</div>

				{/* Grid Layout cho Form */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
					{/* Section: Thông tin cơ bản */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							1. Thông tin cơ bản
						</h4>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Mã (Power Code):
							</label>
							<input
								type='text'
								name='powerCode'
								value={formData.powerCode || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
								disabled={!formData.isNew}
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Tên (Name):
							</label>
							<input
								type='text'
								name='name'
								value={formData.name || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Độ hiếm (Rarity):
							</label>
							<input
								type='text'
								name='rarity'
								value={formData.rarity || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Mô tả (Description):
							</label>
							<textarea
								name='description'
								rows={4}
								value={formData.description || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Mô tả Thô (Description Raw):
							</label>
							<textarea
								name='descriptionRaw'
								rows={4}
								value={formData.descriptionRaw || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
					</div>

					{/* Section: Tài nguyên & Loại */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							2. Tài nguyên & Loại
						</h4>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Đường dẫn Ảnh (Asset Absolute Path):
							</label>
							<input
								type='text'
								name='assetAbsolutePath'
								value={formData.assetAbsolutePath || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Đường dẫn Ảnh Đầy đủ (Asset Full Absolute Path):
							</label>
							<input
								type='text'
								name='assetFullAbsolutePath'
								value={formData.assetFullAbsolutePath || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
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

// --- COMPONENT: PowerCard ---
const PowerCard = memo(({ power, onSelect }) => {
	return (
		<div
			key={power.powerCode}
			className='hover:scale-105 transition-transform duration-200 cursor-pointer'
			onClick={() => onSelect(power.powerCode)}
		>
			<div className='group relative flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-lg hover:bg-gray-200 transition border border-[var(--color-border)]'>
				<img
					src={power.assetAbsolutePath || "/images/placeholder.png"}
					alt={power.name}
					className='w-16 h-16 object-cover rounded-md border border-[var(--color-border)]'
				/>
				<div className='flex-grow'>
					<h3 className='font-bold text-lg text-[var(--color-text-primary)]'>
						{power.name}
					</h3>
					<div className='flex items-center gap-2 text-sm text-[var(--color-text-secondary)]'>
						<RarityIcon rarity={power.rarity} />
						<span>{power.rarity}</span>
					</div>
				</div>
				<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
					<p className='whitespace-pre-wrap'>{power.descriptionRaw}</p>
					<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800'></div>
				</div>
			</div>
		</div>
	);
});

// --- COMPONENT: MainContent ---
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
			<div className='bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6'>
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
							<div className='flex items-center justify-center h-full min-h-[300px] text-center text-gray-500 dark:text-gray-400'>
								<div>
									<p className='font-semibold text-lg'>
										Không tìm thấy năng lực nào phù hợp.
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
	const backendUrl =
		import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
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

	// Lọc và sắp xếp danh sách năng lực
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
				message: "Lưu năng lực thành công!",
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
				message: `Đã xóa năng lực ${powerToDelete.name}.`,
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

	const handleBackNavigation = () => {
		if (viewMode === "edit") {
			handleAttemptClose(true); // <-- THAY ĐỔI: Set isBack = true
		} else {
			navigate(-1);
		}
	};

	const selectedPower = powers.find(p => p.powerCode === selectedPowerId);

	if (isLoading)
		return <div className='text-center text-lg p-10'>Đang tải...</div>;
	if (error)
		return (
			<div className='text-center text-lg p-10 text-[var(--color-danger)]'>
				{error}{" "}
				<button
					onClick={fetchPowers}
					className='mt-4 px-4 py-2 bg-[var(--color-primary)] text-white rounded hover:bg-[var(--color-primary-hover)] transition-colors'
				>
					Thử lại
				</button>
			</div>
		);

	// <-- THAY ĐỔI: Tạo config cho multiFilterConfigs
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
		<div>
			<h1 className='text-3xl font-bold mb-6 text-[var(--color-text-primary)]'>
				Quản Lý Năng Lực
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
						paginatedPowers={paginatedPowers}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={handlePageChange}
						onSelectPower={handleSelectPower}
						selectedPower={selectedPower}
						onSavePower={handleSavePower}
						onCancel={() => handleAttemptClose(false)} // <-- THAY ĐỔI: Set isBack = false cho cancel
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
					/>
				</div>
				{/* SidePanel */}
				<div className='lg:w-3/10'>
					<SidePanel
						searchPlaceholder='Nhập tên năng lực...'
						addLabel='Thêm Năng Lực Mới'
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

			{/* Các Modal */}
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
				title='Xác nhận Xóa Năng Lực'
			>
				<div className='text-[var(--color-text-primary)]'>
					<p className='mb-6'>
						Bạn có thực sự muốn xóa năng lực{" "}
						<strong>{powerToDelete?.name}</strong>? Hành động này không thể hoàn
						tác.
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

export default memo(PowerEditor);
