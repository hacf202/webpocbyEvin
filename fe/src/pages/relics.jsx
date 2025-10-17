import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { usePersistentState } from "../hooks/usePersistentState";
import InputField from "../components/common/InputField";
import DropdownFilter from "../components/common/DropdownFilter";
import Button from "../components/common/Button";
import relicsData from "../assets/data/relics-vi_vn.json";
import { Search, XCircle, RotateCw } from "lucide-react";

function Relics() {
	const [searchInput, setSearchInput] = usePersistentState(
		"relicsSearchInput",
		""
	);
	const [searchTerm, setSearchTerm] = usePersistentState(
		"relicsSearchTerm",
		""
	);
	const [selectedRarity, setSelectedRarity] = usePersistentState(
		"relicsSelectedRarity",
		""
	);
	const [sortOrder, setSortOrder] = usePersistentState(
		"relicsSortOrder",
		"asc"
	);

	const filterOptions = useMemo(() => {
		const rarities = [...new Set(relicsData.map(relic => relic.rarity))].sort();
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
		() => ({ THƯỜNG: 0, HIẾM: 1, "SỬ THI": 2 }),
		[]
	);

	const sortedRelics = useMemo(() => {
		let relics = relicsData.filter(relic =>
			relic.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
		if (selectedRarity) {
			relics = relics.filter(relic => relic.rarity === selectedRarity);
		}
		switch (sortOrder) {
			case "asc":
				return relics.sort((a, b) => a.name.localeCompare(b.name));
			case "desc":
				return relics.sort((a, b) => b.name.localeCompare(a.name));
			case "rarityAsc":
				return relics.sort(
					(a, b) => rarityOrderMap[a.rarity] - rarityOrderMap[b.rarity]
				);
			case "rarityDesc":
				return relics.sort(
					(a, b) => rarityOrderMap[b.rarity] - rarityOrderMap[a.rarity]
				);
			default:
				return relics;
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
				Cổ Vật
			</h1>
			<div className='mb-6 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]'>
				<form onSubmit={handleSearchSubmit} className='mb-4'>
					<div className='relative flex items-center gap-4'>
						<InputField
							value={searchInput}
							onChange={e => setSearchInput(e.target.value)}
							placeholder='Tìm theo tên cổ vật...'
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
				{sortedRelics.map(relic => (
					<Link
						key={relic.relicCode}
						to={`/relic/${encodeURIComponent(relic.relicCode)}`}
						className='flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-lg hover:bg-gray-200 transition border border-[var(--color-border)]'
					>
						<img
							src={relic.assetAbsolutePath}
							alt={relic.name}
							className='w-16 h-16 object-cover rounded-md border border-[var(--color-border)]'
						/>
						<div className='flex-grow'>
							<h3 className='font-bold text-lg text-[var(--color-text-primary)]'>
								{relic.name}
							</h3>
							<p className='text-sm text-[var(--color-text-secondary)]'>
								{relic.rarity}
							</p>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
}

export default Relics;
