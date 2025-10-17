import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/InputField";
import DropdownFilter from "../components/common/DropdownFilter";
import Button from "../components/common/Button";
import itemsData from "../assets/data/items-vi_vn.json";
import { Search, XCircle, RotateCw } from "lucide-react";

function Items() {
	const [searchInput, setSearchInput] = usePersistentState(
		"itemsSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState("itemsSearchTerm", "");
	const [selectedRarity, setSelectedRarity] = usePersistentState(
		"itemsSelectedRarity",
		""
	);
	const [sortOrder, setSortOrder] = usePersistentState("itemsSortOrder", "asc");

	const filterOptions = useMemo(() => {
		const rarities = [...new Set(itemsData.map(item => item.rarity))].sort();
		return {
			rarities: [
				{ value: "", label: "Tất cả độ hiếm" },
				...rarities.map(r => ({ value: r, label: r })),
			],
			sort: [
				{ value: "asc", label: "A-Z" },
				{ value: "desc", label: "Z-A" },
				{ value: "rarityAsc", label: "Độ hiếm tăng dần" },
				{ value: "rarityDesc", label: "Độ hiếm giảm dần" },
			],
		};
	}, []);

	const rarityOrderMap = useMemo(
		() => ({ THƯỜNG: 0, HIẾM: 1, "SỬ THI": 2, "ANH HÙNG": 3 }),
		[]
	);

	const sortedItems = useMemo(() => {
		let items = itemsData.filter(item =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		if (selectedRarity) {
			items = items.filter(item => item.rarity === selectedRarity);
		}
		switch (sortOrder) {
			case "asc":
				return items.sort((a, b) => a.name.localeCompare(b.name));
			case "desc":
				return items.sort((a, b) => b.name.localeCompare(a.name));
			case "rarityAsc":
				return items.sort(
					(a, b) => rarityOrderMap[a.rarity] - rarityOrderMap[b.rarity]
				);
			case "rarityDesc":
				return items.sort(
					(a, b) => rarityOrderMap[b.rarity] - rarityOrderMap[a.rarity]
				);
			default:
				return items;
		}
	}, [searchTerm, selectedRarity, sortOrder, rarityOrderMap]);

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
		setSelectedRarity("");
		setSortOrder("asc");
	};

	return (
		<div className='container mx-auto p-4'>
			<h1 className='text-3xl font-bold mb-6 text-[var(--color-primary)]'>
				Vật Phẩm
			</h1>
			<div className='mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]'>
				<form onSubmit={handleSearchSubmit} className='mb-4'>
					<div className='relative flex items-center gap-4'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							placeholder='Tìm theo tên vật phẩm...'
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
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					<DropdownFilter
						options={filterOptions.rarities}
						selectedValue={selectedRarity}
						onChange={setSelectedRarity}
						placeholder='Tất cả độ hiếm'
					/>
					<DropdownFilter
						options={filterOptions.sort}
						selectedValue={sortOrder}
						onChange={setSortOrder}
						placeholder='Sắp xếp theo'
					/>
					<Button
						variant='outline'
						onClick={handleResetFilters}
						iconLeft={<RotateCw size={16} />}
					>
						Đặt lại
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4'>
				{sortedItems.map(item => (
					<Link
						key={item.itemCode}
						to={`/item/${encodeURIComponent(item.itemCode)}`}
						className='flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-lg hover:bg-gray-200 transition border border-[var(--color-border)]'
					>
						<img
							src={item.assetAbsolutePath}
							alt={item.name}
							className='w-16 h-16 object-cover rounded-md border border-[var(--color-border)]'
						/>
						<div className='flex-grow'>
							<h3 className='font-bold text-lg text-[var(--color-text-primary)]'>
								{item.name}
							</h3>
							<p className='text-sm text-[var(--color-text-secondary)]'>
								{item.rarity}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

export default Items;
