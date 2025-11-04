// src/pages/relics.jsx (ĐÃ ĐỒNG BỘ)
import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import Button from "../components/common/button";
import RarityIcon from "../components/common/rarityIcon";
import { Search, RotateCw, XCircle, Loader2 } from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";

const ITEMS_PER_PAGE = 21;

// --- Component phụ (ĐÃ ĐỒNG BỘ) ---
const LoadingSpinner = () => (
	<div className='flex justify-center items-center h-64 text-text-secondary'>
		<Loader2 className='animate-spin text-primary-500' size={48} />
	</div>
);

const ErrorMessage = ({ message, onRetry }) => (
	<div className='text-center p-10 bg-danger-bg-light text-danger-text-dark rounded-lg'>
		<h2 className='text-xl font-bold mb-2'>Đã xảy ra lỗi</h2>
		<p className='mb-4'>{message}</p>
		<Button onClick={onRetry} variant='danger'>
			Thử lại
		</Button>
	</div>
);

// --- Component chính ---
function RelicList() {
	// State quản lý dữ liệu và bộ lọc
	const [relics, setRelics] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchInput, setSearchInput] = usePersistentState(
		"relicsSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"relicsSearchTerm",
		""
	);
	const [selectedRarities, setSelectedRarities] = usePersistentState(
		"relicsSelectedRarities",
		[]
	);
	const [selectedTypes, setSelectedTypes] = usePersistentState(
		"relicsSelectedTypes",
		[]
	);
	const [selectedStacks, setSelectedStacks] = usePersistentState(
		"relicsSelectedStacks",
		[]
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"relicsSortOrder",
		"name-asc"
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"relicsCurrentPage",
		1
	);

	// Hàm gọi API
	const fetchRelics = async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_API_URL;
			const response = await fetch(`${backendUrl}/api/relics`);
			if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);
			const data = await response.json();
			setRelics(data);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchRelics();
	}, []);

	// Tạo tùy chọn cho bộ lọc
	const filterOptions = useMemo(() => {
		if (relics.length === 0)
			return { rarities: [], types: [], stacks: [], sort: [] };

		// Sử dụng icon trong bộ lọc
		const rarities = [...new Set(relics.map(r => r.rarity))]
			.sort()
			.map(rarity => ({
				value: rarity,
				label: rarity,
				iconComponent: <RarityIcon rarity={rarity} />, // Sử dụng component icon
			}));

		const types = [...new Set(relics.map(r => r.type).filter(Boolean))]
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

	// Lọc và sắp xếp danh sách
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
		setSelectedTypes([]);
		setSelectedStacks([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};
	const handlePageChange = page => {
		if (page > 0 && page <= totalPages) {
			setCurrentPage(page);
		}
	};

	const totalPages = Math.ceil(filteredRelics.length / ITEMS_PER_PAGE);
	const paginatedRelics = filteredRelics.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} onRetry={fetchRelics} />;

	return (
		<div className='font-secondary'>
			<h1 className='text-3xl font-bold mb-6 text-text-primary font-primary'>
				Danh Sách Di Vật
			</h1>
			<div className='flex flex-col lg:flex-row gap-8'>
				<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
					<div className='p-4 rounded-lg border border-border bg-surface-bg space-y-4 shadow-sm'>
						<div>
							<label className='block text-sm font-medium mb-1 text-text-secondary'>
								Tìm kiếm
							</label>
							<div className='relative'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyPress={e => e.key === "Enter" && handleSearch()}
									placeholder='Nhập tên di vật...'
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
						<MultiSelectFilter
							label='Loại'
							options={filterOptions.types}
							selectedValues={selectedTypes}
							onChange={setSelectedTypes}
							placeholder='TấtG cả Loại'
						/>
						<MultiSelectFilter
							label='Stack'
							options={filterOptions.stacks}
							selectedValues={selectedStacks}
							onChange={setSelectedStacks}
							placeholder='Tất cả Stack'
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
					<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6 shadow-sm'>
						{paginatedRelics.length > 0 ? (
							<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'>
								{paginatedRelics.map(relic => (
									<Link
										key={relic.relicCode}
										to={`/relic/${encodeURIComponent(relic.relicCode)}`}
										className='group relative flex items-center gap-4 bg-surface-bg p-4 rounded-lg hover:bg-surface-hover transition border border-border hover:border-primary-500'
									>
										<img
											src={relic.assetAbsolutePath}
											alt={relic.name}
											className='w-16 h-16 object-cover rounded-md border'
										/>
										<div className='flex-grow'>
											<h3 className='font-bold text-lg text-text-primary'>
												{relic.name}
											</h3>
											<div className='flex items-center gap-2 text-sm text-text-secondary'>
												<RarityIcon rarity={relic.rarity} />
												<span>{relic.rarity}</span>
											</div>
											<p className='text-sm text-text-secondary mt-1'>
												Stack: {relic.stack}
											</p>
										</div>
										{/* Tooltip (ĐÃ ĐỒNG BỘ) */}
										<div className='absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 p-3 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 invisible group-hover:visible pointer-events-none z-10'>
											<p className='whitespace-pre-wrap'>
												{relic.descriptionRaw}
											</p>
											<div className='absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-900'></div>
										</div>
									</Link>
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
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									variant='outline'
								>
									Trang trước
								</Button>
								<span className='text-lg font-medium text-text-primary'>
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

export default RelicList;
