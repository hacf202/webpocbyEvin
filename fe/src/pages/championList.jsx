import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/inputField";
import MultiSelectFilter from "../components/common/multiSelectFilter";
import DropdownFilter from "../components/common/dropdownFilter";
import ChampionCard from "../components/champion/championCard";
import Button from "../components/common/button";
import { Search, RotateCw, XCircle } from "lucide-react";
import { removeAccents } from "../utils/vietnameseUtils";
import iconRegions from "../assets/data/iconRegions.json";

const ITEMS_PER_PAGE = 20;

// --- Component phụ ---
const LoadingSpinner = () => (
	<div className='flex justify-center items-center h-64'>
		{/* Sử dụng màu 'primary' (Xanh-Tím) của theme */}
		<div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500'></div>
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
function ChampionList() {
	// State quản lý dữ liệu và bộ lọc
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [searchInput, setSearchInput] = usePersistentState(
		"championsSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"championsSearchTerm",
		""
	);
	const [selectedRegions, setSelectedRegions] = usePersistentState(
		"championsSelectedRegions",
		[]
	);
	const [selectedCosts, setSelectedCosts] = usePersistentState(
		"championsSelectedCosts",
		[]
	);
	const [selectedMaxStars, setSelectedMaxStars] = usePersistentState(
		"championsSelectedMaxStars",
		[]
	);
	const [selectedTags, setSelectedTags] = usePersistentState(
		"championsSelectedTags",
		[]
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"championsSortOrder",
		"name-asc"
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"championsCurrentPage",
		1
	);

	// Hàm gọi API
	const fetchChampions = async () => {
		setLoading(true);
		setError(null);
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await fetch(`${backendUrl}/api/champions`);
			if (!response.ok) throw new Error(`Lỗi server: ${response.status}`);

			const data = await response.json();
			const formattedData = data.map(champ => ({
				...champ,
				avatarUrl: champ.assets?.[0]?.M?.avatar?.S || "",
			}));
			setChampions(formattedData);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchChampions();
	}, []);

	// Tạo các tùy chọn cho bộ lọc
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

	// Lọc và sắp xếp danh sách tướng
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

			// Nếu sắp xếp theo 'cost', so sánh như số
			if (sortKey === "cost" || sortKey === "maxStar") {
				return sortDirection === "asc" ? valA - valB : valB - valA;
			}

			// Nếu không, so sánh như chuỗi
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
		setSelectedRegions([]);
		setSelectedCosts([]);
		setSelectedMaxStars([]);
		setSelectedTags([]);
		setSortOrder("name-asc");
		setCurrentPage(1);
	};
	const handlePageChange = page => {
		setCurrentPage(page);
	};

	const totalPages = Math.ceil(filteredChampions.length / ITEMS_PER_PAGE);
	const paginatedChampions = filteredChampions.slice(
		(currentPage - 1) * ITEMS_PER_PAGE,
		currentPage * ITEMS_PER_PAGE
	);

	if (loading) return <LoadingSpinner />;
	if (error) return <ErrorMessage message={error} onRetry={fetchChampions} />;

	return (
		// Sử dụng font-secondary (Open Sans) làm font chữ chính cho trang này
		<div className='font-secondary'>
			{/* Sử dụng class ngữ nghĩa 'text-text-primary' */}
			<h1 className='text-3xl font-bold mb-6 text-text-primary'>
				Danh Sách Tướng
			</h1>

			{/* BỐ CỤC MỚI: flex-col mặc định (mobile), lg:flex-row cho desktop */}
			<div className='flex flex-col lg:flex-row gap-8'>
				{/* THANH CÔNG CỤ (ĐÃ REFACTOR) */}
				<aside className='lg:w-1/5 w-full lg:sticky lg:top-24 h-fit'>
					{/* Sử dụng class ngữ nghĩa 'border-border' và 'bg-surface-bg' */}
					<div className='p-4 rounded-lg border border-border bg-surface-bg space-y-4'>
						<div>
							{/* Sử dụng class 'text-text-secondary' */}
							<label className='block text-sm font-medium mb-1 text-text-secondary'>
								Tìm kiếm tướng
							</label>
							<div className='relative'>
								<InputField
									value={searchInput}
									onChange={e => setSearchInput(e.target.value)}
									onKeyPress={e => e.key === "Enter" && handleSearch()}
									placeholder='Nhập tên tướng...'
								/>
								{searchInput && (
									<button
										onClick={handleClearSearch}
										// Sử dụng class ngữ nghĩa
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
							label='Vùng'
							options={filterOptions.regions}
							selectedValues={selectedRegions}
							onChange={setSelectedRegions}
							placeholder='Tất cả Vùng'
						/>
						<MultiSelectFilter
							label='Năng lượng'
							options={filterOptions.costs}
							selectedValues={selectedCosts}
							onChange={setSelectedCosts}
							placeholder='Tất cả Năng lượng'
						/>
						<MultiSelectFilter
							label='Số sao tối đa'
							options={filterOptions.maxStars}
							selectedValues={selectedMaxStars}
							onChange={setSelectedMaxStars}
							placeholder='Tất cả Sao'
						/>
						<MultiSelectFilter
							label='Thẻ'
							options={filterOptions.tags}
							selectedValues={selectedTags}
							onChange={setSelectedTags}
							placeholder='Tất cả Thẻ'
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

				{/* NỘI DUNG CHÍNH (ĐÃ REFACTOR) */}
				{/* THAY ĐỔI Ở ĐÂY: Dùng `order-first` trên desktop để đẩy nó sang trái */}
				<div className='lg:w-4/5 w-full lg:order-first'>
					{/* Sử dụng class ngữ nghĩa 'bg-surface-bg' và 'border-border' */}
					<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6'>
						{paginatedChampions.length > 0 ? (
							<div className='grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6'>
								{paginatedChampions.map(champion => (
									<Link
										key={champion.name}
										to={`/champion/${encodeURIComponent(champion.name)}`}
										className='hover:scale-105 transition-transform duration-200'
									>
										<ChampionCard champion={champion} />
									</Link>
								))}
							</div>
						) : (
							// Sử dụng class 'text-text-secondary'
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
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={currentPage === 1}
									variant='outline'
								>
									Trang trước
								</Button>
								{/* Sử dụng class 'text-text-primary' */}
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

export default ChampionList;
