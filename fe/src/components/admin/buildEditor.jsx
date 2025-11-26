// src/pages/admin/BuildEditor.jsx
import { useState, useEffect, memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../common/modal";
import Button from "../common/button";
import BuildCard from "./buildCard";
import BuildEditorForm from "./buildEditorForm";
import MultiSelectFilter from "../common/multiSelectFilter";
import InputField from "../common/inputField";
import DropdownFilter from "../common/dropdownFilter"; // <-- THÊM IMPORT
import { Loader2, ChevronLeft, RotateCw, Search, XCircle } from "lucide-react";

const ITEMS_PER_PAGE = 12;

// === SẮP XẾP OPTIONS ===
const SORT_OPTIONS = [
	{ value: "newest", label: "Mới nhất" },
	{ value: "oldest", label: "Cũ nhất" },
	{ value: "likes_desc", label: "Lượt thích nhiều nhất" },
	{ value: "likes_asc", label: "Lượt thích ít nhất" },
	{ value: "views_desc", label: "Lượt xem nhiều nhất" },
	{ value: "views_asc", label: "Lượt xem ít nhất" },
];

// === CẤP SAO OPTIONS ===
const STAR_LEVEL_OPTIONS = [
	{ value: "1", label: "1 sao" },
	{ value: "2", label: "2 sao" },
	{ value: "3", label: "3 sao" },
	{ value: "4", label: "4 sao" },
	{ value: "5", label: "5 sao" },
	{ value: "6", label: "6 sao" },
	{ value: "7", label: "7 sao" },
];

const MainContent = memo(
	({
		viewMode,
		paginatedBuilds,
		totalPages,
		currentPage,
		onPageChange,
		onSelectBuild,
		selectedBuild,
		onSaveBuild,
		onCancel,
		onDelete,
		isSaving,
	}) => {
		return (
			<div className='bg-surface-bg rounded-lg border border-border p-1 sm:p-2'>
				{viewMode === "list" ? (
					<>
						{paginatedBuilds.length > 0 ? (
							<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
								{paginatedBuilds.map(build => (
									<BuildCard
										key={build.id}
										build={build}
										onClick={() => onSelectBuild(build)}
									/>
								))}
							</div>
						) : (
							<div className='text-center py-16 text-text-secondary'>
								<p className='text-lg font-semibold'>
									Không tìm thấy build nào.
								</p>
							</div>
						)}

						{totalPages > 1 && (
							<div className='mt-10 flex justify-center gap-4'>
								<Button
									onClick={() => onPageChange(currentPage - 1)}
									disabled={currentPage === 1}
									variant='outline'
								>
									Trang trước
								</Button>
								<span className='self-center text-lg font-medium text-text-primary'>
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
					<div>
						<div className='mb-2 flex justify-between items-center'>
							<h2 className='text-2xl font-bold text-text-primary font-primary'>
								Chỉnh sửa Build
							</h2>
						</div>

						<BuildEditorForm
							build={selectedBuild}
							onSave={onSaveBuild}
							onCancel={onCancel}
							onDelete={onDelete}
							isSaving={isSaving}
							onConfirmExit={onCancel}
						/>
					</div>
				)}
			</div>
		);
	}
);

function BuildEditor() {
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [builds, setBuilds] = useState([]);
	const [selectedBuild, setSelectedBuild] = useState(null);
	const [viewMode, setViewMode] = useState("list");

	// === BỘ LỌC ===
	const [searchInput, setSearchInput] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	const [selectedStarLevels, setSelectedStarLevels] = useState([]);
	const [sortBy, setSortBy] = useState("newest");

	const [currentPage, setCurrentPage] = useState(1);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [notification, setNotification] = useState({
		isOpen: false,
		title: "",
		message: "",
	});
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);
	const [isCloseConfirmOpen, setIsCloseConfirmOpen] = useState(false);
	const [pendingExit, setPendingExit] = useState(null);

	// === LẤY DỮ LIỆU ===
	useEffect(() => {
		const fetchBuilds = async () => {
			try {
				setIsLoading(true);
				const token = localStorage.getItem("token");
				const res = await fetch(`${apiUrl}/api/admin/builds`, {
					headers: { Authorization: `Bearer ${token}` },
				});
				if (!res.ok) throw new Error("Lỗi tải dữ liệu");
				const { items } = await res.json();
				setBuilds(items || []);
			} catch (err) {
				setNotification({ isOpen: true, title: "Lỗi", message: err.message });
			} finally {
				setIsLoading(false);
			}
		};
		fetchBuilds();
	}, [apiUrl]);

	// === XỬ LÝ TÌM KIẾM ===
	const handleSearch = () => {
		setSearchTerm(searchInput.trim().toLowerCase());
		setCurrentPage(1);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
		setCurrentPage(1);
	};

	const handleResetFilters = () => {
		setSearchInput("");
		setSearchTerm("");
		setSelectedStarLevels([]);
		setSortBy("newest");
		setCurrentPage(1);
	};

	// === LỌC & SẮP XẾP ===
	const filteredAndSortedBuilds = useMemo(() => {
		let result = [...builds];

		// TÌM KIẾM
		if (searchTerm) {
			result = result.filter(build => {
				const q = searchTerm;
				const champ = build.championName?.toLowerCase() || "";
				const creator =
					build.creatorName?.toLowerCase() ||
					build.creator?.toLowerCase() ||
					"";
				const relicSet = (build.relicSet || []).join(" ").toLowerCase();
				const powers = (build.powers || []).join(" ").toLowerCase();
				const rune = (build.rune || []).join(" ").toLowerCase();

				return (
					champ.includes(q) ||
					creator.includes(q) ||
					relicSet.includes(q) ||
					powers.includes(q) ||
					rune.includes(q)
				);
			});
		}

		// LỌC CẤP SAO
		if (selectedStarLevels.length > 0) {
			result = result.filter(build =>
				selectedStarLevels.includes(String(build.star || 0))
			);
		}

		// SẮP XẾP
		result.sort((a, b) => {
			switch (sortBy) {
				case "newest":
					return new Date(b.createdAt) - new Date(a.createdAt);
				case "oldest":
					return new Date(a.createdAt) - new Date(b.createdAt);
				case "likes_desc":
					return (b.like || 0) - (a.like || 0);
				case "likes_asc":
					return (a.like || 0) - (b.like || 0);
				case "views_desc":
					return (b.views || 0) - (a.views || 0);
				case "views_asc":
					return (a.views || 0) - (b.views || 0);
				default:
					return 0;
			}
		});

		return result;
	}, [builds, searchTerm, selectedStarLevels, sortBy]);

	const paginatedBuilds = filteredAndSortedBuilds.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);
	const totalPages = Math.ceil(filteredAndSortedBuilds.length / ITEMS_PER_PAGE);

	// === XỬ LÝ ===
	const handleSelectBuild = build => {
		setSelectedBuild(build);
		setViewMode("edit");
	};

	const handleBackToList = () => {
		setViewMode("list");
		setSelectedBuild(null);
		setCurrentPage(1);
	};

	const handleAttemptClose = () => {
		setPendingExit(() => handleBackToList);
		setIsCloseConfirmOpen(true);
	};

	const handleConfirmClose = () => {
		setIsCloseConfirmOpen(false);
		if (pendingExit) pendingExit();
		setPendingExit(null);
	};

	const handleSaveBuild = async updatedBuild => {
		setIsSaving(true);
		try {
			const token = localStorage.getItem("token");
			const res = await fetch(`${apiUrl}/api/admin/builds/${updatedBuild.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updatedBuild),
			});
			if (!res.ok) throw new Error("Cập nhật thất bại");
			const data = await res.json();
			setBuilds(prev =>
				prev.map(b => (b.id === data.build.id ? data.build : b))
			);
			setNotification({
				isOpen: true,
				title: "Thành công",
				message: "Cập nhật thành công!",
			});
			handleBackToList();
		} catch (err) {
			setNotification({ isOpen: true, title: "Lỗi", message: err.message });
		} finally {
			setIsSaving(false);
		}
	};

	const handleAttemptDelete = build => {
		setBuildToDelete(build);
		setIsDeleteModalOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!buildToDelete) return;
		try {
			const token = localStorage.getItem("token");
			await fetch(`${apiUrl}/api/admin/builds/${buildToDelete.id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			setBuilds(prev => prev.filter(b => b.id !== buildToDelete.id));
			setNotification({
				isOpen: true,
				title: "Thành công",
				message: "Đã xóa!",
			});
		} catch (err) {
			setNotification({ isOpen: true, title: "Lỗi", message: err.message });
		} finally {
			setIsDeleteModalOpen(false);
			setBuildToDelete(null);
		}
	};

	if (isLoading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[600px] text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4'>Đang tải...</p>
			</div>
		);
	}

	return (
		<div className='mx-auto max-w-[1600px] p-1 sm:p-2 font-secondary'>
			<div className='flex flex-col lg:flex-row gap-6'>
				{/* MAIN CONTENT */}
				<div className='lg:w-4/5 w-full lg:order-first'>
					<MainContent
						viewMode={viewMode}
						paginatedBuilds={paginatedBuilds}
						totalPages={totalPages}
						currentPage={currentPage}
						onPageChange={setCurrentPage}
						onSelectBuild={handleSelectBuild}
						selectedBuild={selectedBuild}
						onSaveBuild={handleSaveBuild}
						onCancel={handleAttemptClose}
						onDelete={handleAttemptDelete}
						isSaving={isSaving}
						onBackToList={handleBackToList}
					/>
				</div>

				{/* BỘ LỌC + SẮP XẾP */}
				<aside className='lg:w-1/5 w-full space-y-4'>
					<div className='bg-surface-bg rounded-lg border border-border p-4'>
						{/* TÌM KIẾM */}
						<div className='relative mb-4'>
							<InputField
								type='text'
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
						<Button onClick={handleSearch} className='w-full mb-4'>
							<Search size={16} className='mr-2' />
							Tìm kiếm
						</Button>

						{/* CẤP SAO */}
						<MultiSelectFilter
							label='Cấp sao'
							options={STAR_LEVEL_OPTIONS}
							selectedValues={selectedStarLevels}
							onChange={setSelectedStarLevels}
							placeholder='Tất cả cấp sao'
						/>

						{/* SẮP XẾP (ĐÃ THAY THẾ <select>) */}
						<div className='mt-4'>
							<DropdownFilter
								label='Sắp xếp theo'
								options={SORT_OPTIONS}
								selectedValue={sortBy}
								onChange={setSortBy}
							/>
						</div>

						{/* ĐẶT LẠI */}
						<div className='pt-4'>
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
			</div>

			{/* MODALS (ĐÃ ĐỒNG BỘ) */}
			<Modal
				isOpen={isDeleteModalOpen}
				onClose={() => setIsDeleteModalOpen(false)}
				title='Xác nhận'
			>
				<p className='mb-4 text-text-secondary'>
					Xóa build <strong>{buildToDelete?.championName}</strong>?
				</p>
				<div className='flex justify-end gap-3'>
					<Button onClick={() => setIsDeleteModalOpen(false)} variant='ghost'>
						Hủy
					</Button>
					<Button onClick={handleConfirmDelete} variant='danger'>
						Xóa
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={isCloseConfirmOpen}
				onClose={() => setIsCloseConfirmOpen(false)}
				title='Xác nhận thoát'
			>
				<p className='mb-6 text-text-secondary'>
					Bạn có thay đổi chưa lưu. Thoát sẽ mất dữ liệu.
				</p>
				<div className='flex justify-end gap-3'>
					<Button onClick={() => setIsCloseConfirmOpen(false)} variant='ghost'>
						Ở lại
					</Button>
					<Button onClick={handleConfirmClose} variant='danger'>
						Thoát không lưu
					</Button>
				</div>
			</Modal>

			<Modal
				isOpen={notification.isOpen}
				onClose={() => setNotification({ ...notification, isOpen: false })}
				title={notification.title}
			>
				<p className='text-text-secondary'>{notification.message}</p>
				<div className='flex justify-end mt-4'>
					<Button
						onClick={() => setNotification({ ...notification, isOpen: false })}
					>
						Đóng
					</Button>
				</div>
			</Modal>
		</div>
	);
}

export default memo(BuildEditor);
