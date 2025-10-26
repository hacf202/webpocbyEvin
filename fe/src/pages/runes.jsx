import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/InputField";
import DropdownFilter from "../components/common/DropdownFilter";
import Button from "../components/common/Button";
import runesData from "../assets/data/runes-vi_vn.json";
import { Search, XCircle, RotateCw } from "lucide-react";

function Runes() {
	const [searchInput, setSearchInput] = usePersistentState(
		"runesSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState("runesSearchTerm", "");
	const [selectedRarity, setSelectedRarity] = usePersistentState(
		"runesSelectedRarity",
		""
	);
	const [sortOrder, setSortOrder] = usePersistentState("runesSortOrder", "asc");

	// Chỉ lọc những item có type là "Rune"
	const runeItems = useMemo(
		() => runesData.filter(item => item.type.includes("Rune")),
		[]
	);

	const filterOptions = useMemo(() => {
		const rarities = [...new Set(runeItems.map(rune => rune.rarity))].sort();
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
	}, [runeItems]);

	const rarityOrderMap = useMemo(
		() => ({ THƯỜNG: 0, HIẾM: 1, "HUYỀN THOẠI": 2 }),
		[]
	);

	const sortedRunes = useMemo(() => {
		let runes = runeItems.filter(rune =>
			rune.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		if (selectedRarity) {
			runes = runes.filter(rune => rune.rarity === selectedRarity);
		}
		switch (sortOrder) {
			case "asc":
				return runes.sort((a, b) => a.name.localeCompare(b.name));
			case "desc":
				return runes.sort((a, b) => b.name.localeCompare(a.name));
			case "rarityAsc":
				return runes.sort(
					(a, b) => rarityOrderMap[a.rarity] - rarityOrderMap[b.rarity]
				);
			case "rarityDesc":
				return runes.sort(
					(a, b) => rarityOrderMap[b.rarity] - rarityOrderMap[a.rarity]
				);
			default:
				return runes;
		}
	}, [searchTerm, selectedRarity, sortOrder, rarityOrderMap, runeItems]);

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
				Ngọc
			</h1>
			<div className='mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]'>
				<form onSubmit={handleSearchSubmit} className='mb-4'>
					<div className='relative flex items-center gap-4'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							placeholder='Tìm theo tên ngọc...'
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
				{sortedRunes.map(rune => (
					<Link
						key={rune.runeCode}
						to={`/rune/${encodeURIComponent(rune.runeCode)}`}
						className='flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-lg hover:bg-gray-200 transition border border-[var(--color-border)]'
					>
						<img
							src={rune.assetAbsolutePath}
							alt={rune.name}
							className='w-16 h-16 object-cover rounded-md border border-[var(--color-border)]'
						/>
						<div className='flex-grow'>
							<h3 className='font-bold text-lg text-[var(--color-text-primary)]'>
								{rune.name}
							</h3>
							<p className='text-sm text-[var(--color-text-secondary)]'>
								{rune.rarity}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

export default Runes;
