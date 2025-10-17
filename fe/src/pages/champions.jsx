import React, { useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/InputField";
import DropdownFilter from "../components/common/DropdownFilter";
import ChampionCard from "../components/champion/ChampionCard";
import Button from "../components/common/Button";
import championsData from "../assets/data/champions.json";
import iconRegions from "../assets/data/iconRegions.json";
import { Search, XCircle, RotateCw, List } from "lucide-react";

const ITEMS_PER_PAGE = 20;

function ChampionList() {
	// State cho giá trị nhập vào
	const [searchInput, setSearchInput] = usePersistentState(
		"championsSearchInput",
		""
	);
	// State cho giá trị được áp dụng
	const [searchTerm, setSearchTerm] = usePersistentState(
		"championsSearchTerm",
		""
	);
	const [selectedRegion, setSelectedRegion] = usePersistentState(
		"championsSelectedRegion",
		""
	);
	const [selectedCost, setSelectedCost] = usePersistentState(
		"championsSelectedCost",
		""
	);
	const [selectedTag, setSelectedTag] = usePersistentState(
		"championsSelectedTag",
		""
	);
	const [selectedStar, setSelectedStar] = usePersistentState(
		"championsSelectedStar",
		""
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"championsSortOrder",
		"asc"
	);
	const [currentPage, setCurrentPage] = usePersistentState(
		"championsCurrentPage",
		1
	);

	const filterOptions = useMemo(() => {
		const regions = [...new Set(championsData.flatMap(c => c.regions))].sort();
		const costs = [...new Set(championsData.map(c => c.cost))].sort(
			(a, b) => a - b
		);
		const tags = [...new Set(championsData.flatMap(c => c.tag))].sort();
		const stars = [...new Set(championsData.map(c => c.maxStar))].sort(
			(a, b) => a - b
		);

		const findRegionIcon = regionName =>
			iconRegions.find(item => item.name === regionName)?.iconAbsolutePath ||
			"";

		return {
			regions: [
				{
					value: "",
					label: "Tất cả khu vực",
				},
				...regions.map(r => ({
					value: r,
					label: r,
					icon: findRegionIcon(r),
				})),
			],
			costs: [
				{ value: "", label: "Mọi giá" },
				...costs.map(c => ({ value: c, label: c.toString() })),
			],
			tags: [
				{ value: "", label: "Tất cả tag" },
				...tags.map(t => ({ value: t, label: t })),
			],
			stars: [
				{ value: "", label: "Mọi sao" },
				...stars.map(s => ({ value: s, label: s.toString() })),
			],
			sort: [
				{ value: "asc", label: "Tên A-Z" },
				{ value: "desc", label: "Tên Z-A" },
				{ value: "costAsc", label: "Giá tăng dần" },
				{ value: "costDesc", label: "Giá giảm dần" },
			],
		};
	}, []);

	const filteredChampions = useMemo(() => {
		let champions = [...championsData];
		if (searchTerm) {
			champions = champions.filter(c =>
				c.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}
		if (selectedRegion) {
			champions = champions.filter(c => c.regions.includes(selectedRegion));
		}
		if (selectedCost) {
			champions = champions.filter(c => c.cost === parseInt(selectedCost));
		}
		if (selectedTag) {
			champions = champions.filter(c => c.tag.includes(selectedTag));
		}
		if (selectedStar) {
			champions = champions.filter(c => c.maxStar === parseInt(selectedStar));
		}

		switch (sortOrder) {
			case "asc":
				champions.sort((a, b) => a.name.localeCompare(b.name));
				break;
			case "desc":
				champions.sort((a, b) => b.name.localeCompare(a.name));
				break;
			case "costAsc":
				champions.sort((a, b) => a.cost - b.cost);
				break;
			case "costDesc":
				champions.sort((a, b) => b.cost - a.cost);
				break;
			default:
				break;
		}
		return champions;
	}, [
		searchTerm,
		selectedRegion,
		selectedCost,
		selectedTag,
		selectedStar,
		sortOrder,
	]);

	// Tự động về trang 1 khi bộ lọc thay đổi
	useEffect(() => {
		setCurrentPage(1);
	}, [
		searchTerm,
		selectedRegion,
		selectedCost,
		selectedTag,
		selectedStar,
		sortOrder,
		setCurrentPage,
	]);

	// Logic phân trang
	const totalPages = Math.ceil(filteredChampions.length / ITEMS_PER_PAGE);
	const paginatedChampions = useMemo(() => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		return filteredChampions.slice(startIndex, startIndex + ITEMS_PER_PAGE);
	}, [filteredChampions, currentPage]);

	const handleSearchSubmit = e => {
		e.preventDefault();
		setSearchTerm(searchInput);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearchTerm("");
	};

	const handleResetFilters = () => {
		handleClearSearch();
		setSelectedRegion("");
		setSelectedCost("");
		setSelectedTag("");
		setSelectedStar("");
		setSortOrder("asc");
	};

	const handlePageChange = newPage => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-3xl font-bold mb-6 text-[var(--color-primary)]'>
				Danh Sách Tướng
			</h1>
			<div className='mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]'>
				<form onSubmit={handleSearchSubmit} className='mb-4'>
					<div className='relative flex items-center gap-4'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							placeholder='Tìm theo tên tướng...'
							className='flex-grow pr-10'
						/>
						{searchInput && (
							<button
								type='button'
								onClick={handleClearSearch}
								className='absolute right-[calc(6rem+1rem)] mr-2 text-gray-500 hover:text-gray-800'
							>
								<XCircle size={20} />
							</button>
						)}
						<Button
							type='submit'
							variant='primary'
							iconLeft={<Search size={18} />}
						>
							Tìm
						</Button>
					</div>
				</form>
				<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4'>
					<div className='lg:col-span-2'>
						<DropdownFilter
							options={filterOptions.regions}
							selectedValue={selectedRegion}
							onChange={setSelectedRegion}
							placeholder='Khu vực'
							renderOption={option => (
								<span className='flex items-center'>
									{option.value === "" ? (
										<List className='w-5 h-5 mr-2' />
									) : (
										<img
											src={option.icon}
											alt={option.label}
											className='w-5 h-5 mr-2'
										/>
									)}
									{option.label}
								</span>
							)}
						/>
					</div>
					<DropdownFilter
						options={filterOptions.costs}
						selectedValue={selectedCost}
						onChange={setSelectedCost}
						placeholder='Tiêu hao'
					/>
					<DropdownFilter
						options={filterOptions.tags}
						selectedValue={selectedTag}
						onChange={setSelectedTag}
						placeholder='Tag'
					/>
					<DropdownFilter
						options={filterOptions.stars}
						selectedValue={selectedStar}
						onChange={setSelectedStar}
						placeholder='Sao'
					/>
					<div className='lg:col-span-1'>
						<DropdownFilter
							options={filterOptions.sort}
							selectedValue={sortOrder}
							onChange={setSortOrder}
							placeholder='Sắp xếp'
						/>
					</div>
					<Button
						variant='outline'
						onClick={handleResetFilters}
						iconLeft={<RotateCw size={16} />}
					>
						Đặt lại
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 justify-items-center'>
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

			{/* Giao diện phân trang */}
			{totalPages > 1 && (
				<div className='mt-8 flex justify-center items-center gap-4'>
					<Button
						onClick={() => handlePageChange(currentPage - 1)}
						disabled={currentPage === 1}
						variant='outline'
					>
						Trang trước
					</Button>
					<span className='text-lg font-medium text-[var(--color-text)]'>
						Trang {currentPage} / {totalPages}
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
	);
}

export default ChampionList;
