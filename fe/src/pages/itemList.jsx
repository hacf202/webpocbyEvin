// src/pages/items.jsx
import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import Button from "../components/common/button";
import RarityIcon from "../components/common/rarityIcon";
import { Search, RotateCw, XCircle } from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";

const ITEMS_PER_PAGE = 21;

// --- Component phụ ---
const LoadingSpinner = () => (
	<div className='flex justify-center items-center h-64'>
		<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500'></div>
	</div>
);

const ErrorMessage = ({ message, onRetry }) => (
	<div className='text-center p-10 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg'>
		<h2 className='text-xl font-bold mb-2'>Đã xảy ra lỗi</h2>
		<p className='mb-4'>{message}</p>
		<Button onClick={onRetry} variant='danger'>
			Thử lại
		</Button>
	</div>
);

// --- Component chính ---
function ItemList() {
	// State quản lý dữ liệu và bộ lọc
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchInput, setSearchInput] = usePersistentState(
		"itemsSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState("itemsSearchTerm", "");
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"itemsSelectedRarities",
		[]
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"itemsSortOrder",
		"name-asc"
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"itemsCurrentPage",
		1
	);

	// Hàm gọi API
	const fetchItems = async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/items`);
			if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);
			const data = await response.json();
			setItems(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchItems();
	}, []);

	// Tạo tùy chọn cho bộ lọc
	const filterOptions = useMemo(() => {
		if (items.length === 0) return { rarities: [], sort: [] };

		// Sử dụng icon trong bộ lọc
		const rarities = [...new Set(items.map(i => i.rarity))]
			.sort()
			.map(rarity => ({
				value: rarity,
				label: rarity,
				iconComponent: <RarityIcon rarity={rarity} />, // Sử dụng component icon
			}));

		const sort = [
			{ value: "name-asc", label: "Tên A-Z" },
			{ value: "name-desc", label: "Tên Z-A" },
		];

		return { rarities, sort };
	}, [items]);

	// Lọc và sắp xếp danh sách
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

	// Các hàm xử lý sự kiện
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
		setSelectedRarities([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};
	const handlePageChange = page => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} onRetry={fetchItems} />;

	return (
		<div>
			<h1 className='text-3xl font-bold mb-6 text-[var(--color-text-primary)]'>
				Danh Sách Đồ Vật
			</h1>
			<div className='flex flex-col lg:flex-row gap-8'>
				<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
					<div className='p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] space-y-4'>
						<div>
							<label className='block text-sm font-medium mb-1 text-[var(--color-text-secondary)]'>
								Tìm kiếm
							</label>
							<div className='relative'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyPress={e => e.key === "Enter" && handleSearch()}
									placeholder='Nhập tên đồ vật...'
								/>
								{searchInput && (
									<button
										onClick={handleClearSearch}
										className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 '
									>
										<XCircle size={18} />
									</button>
								)}
							</div>
							<Button onClick={handleSearch} className='w-full mt-2'>
								<Search size={16} className='mr-2' />
								Tìm kiếm
							</Button>
						</div>

						<MultiSelectFilter
							label='Độ hiếm'
							options={filterOptions.rarities}
							selectedValues={selectedRarities}
							onChange={setSelectedRarities}
							placeholder='Tất cả Độ hiếm'
						/>
						<DropdownFilter
							label='Sắp xếp'
							options={filterOptions.sort}
							selectedValue={sortOrder}
							onChange={setSortOrder}
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
					<div className='bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6'>
						{paginatedItems.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
								{paginatedItems.map(item => (
									<Link
										key={item.itemCode}
										to={`/item/${encodeURIComponent(item.itemCode)}`}
										className='group relative flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-lg hover:bg-gray-200  transition border border-[var(--color-border)]'
									>
										<img
											src={item.assetAbsolutePath}
											alt={item.name}
											className='w-16 h-16 object-cover rounded-md border '
										/>
										<div className='flex-grow'>
											<h3 className='font-bold text-lg text-[var(--color-text-primary)]'>
												{item.name}
											</h3>
											{/* Sử dụng icon trong danh sách */}
											<div className='flex items-center gap-2 text-sm text-[var(--color-text-secondary)]'>
												<RarityIcon rarity={item.rarity} />
												<span>{item.rarity}</span>
											</div>
										</div>
										<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
											<p className='whitespace-pre-wrap'>
												{item.descriptionRaw}
											</p>
											<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800'></div>
										</div>
									</Link>
								))}
							</div>
						) : (
							<div className='flex items-center justify-center h-full min-h-[300px] text-center text-gray-500 dark:text-gray-400'>
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
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									variant='outline'
								>
									Trang trước
								</Button>
								<span className='text-lg font-medium text-[var(--color-text-primary)]'>
									{currentPage} / {totalPages}
								</span>
								<Button
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={currentPage === totalPages}
									variant='outline'
								>
									Trang sau
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ItemList;
