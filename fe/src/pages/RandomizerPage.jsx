import React, { useState, useEffect, useCallback } from "react";
import VongQuayNgauNhien from "../components/common/VongQuayNgauNhien";
import SidePanel from "../components/common/SidePanel";

// (Các import dữ liệu json giữ nguyên)
import mapsData from "../assets/data/map.json";
import championsData from "../assets/data/champions.json";
import relicsData from "../assets/data/relics-vi_vn.json";
import itemsData from "../assets/data/items-vi_vn.json";
import powersData from "../assets/data/powers-vi_vn.json";

// --- HÀM TIỆN ÍCH: Sắp xếp theo tên ---
const sortByName = (a, b) => a.name.localeCompare(b.name);

function RandomizerPage() {
	const [originalWheelsData, setOriginalWheelsData] = useState({});
	const [customItemsText, setCustomItemsText] = useState({});
	const [checkedItems, setCheckedItems] = useState({});
	const [activeWheelKey, setActiveWheelKey] = useState("champions");
	const [isWheelVisible, setIsWheelVisible] = useState(true);
	const [isPanelOpen, setIsPanelOpen] = useState(true);
	const [filterCategories, setFilterCategories] = useState({});
	const [activeFilters, setActiveFilters] = useState({});

	useEffect(() => {
		const initialData = {
			champions: {
				key: "champions",
				title: "Tướng",
				items: [...championsData].sort(sortByName),
			},
			// Vòng quay mới cho Map
			maps: {
				key: "maps",
				title: "Map",
				items: [...mapsData].sort(sortByName),
			},
			relics: {
				key: "relics",
				title: "Cổ Vật",
				items: relicsData
					.filter(relic => relic.name)
					.map(relic => ({ name: relic.name, rarity: relic.rarity || "Chung" }))
					.sort(sortByName),
			},
			items: {
				key: "items",
				title: "Vật Phẩm",
				items: itemsData
					.filter(item => item.name)
					.map(item => ({ name: item.name, rarity: item.rarity || "Chung" }))
					.sort(sortByName),
			},
			powers: {
				key: "powers",
				title: "Sức Mạnh",
				items: powersData
					.filter(
						power =>
							power.name && power.type && power.type.includes("General Power")
					)
					.map(power => ({
						name: power.name,
						rarity: power.rarity || "Chung",
						type: power.type,
					}))
					.sort(sortByName),
			},
		};
		setOriginalWheelsData(initialData);

		const initialChecked = {};
		const initialText = {};
		const initialFilters = {};
		const initialActiveFilters = {};

		for (const key in initialData) {
			const itemChecks = {};
			const isPowerWheel = key === "powers";
			initialData[key].items.forEach(item => {
				itemChecks[item.name] = !isPowerWheel;
			});
			initialChecked[key] = itemChecks;
			initialText[key] = "";

			if (key === "champions") {
				initialFilters.champions = {
					regions: [
						"Tất cả",
						...[
							...new Set(initialData.champions.items.flatMap(c => c.regions)),
						].sort(),
					],
					maxStar: [
						"Tất cả",
						...[
							...new Set(initialData.champions.items.map(c => c.maxStar)),
						].sort((a, b) => a - b),
					],
					tags: [
						"Tất cả",
						...[
							...new Set(initialData.champions.items.flatMap(c => c.tags)),
						].sort(),
					],
					cost: [
						"Tất cả",
						...[...new Set(initialData.champions.items.map(c => c.cost))].sort(
							(a, b) => a - b
						),
					],
				};
				initialActiveFilters.champions = {
					regions: "Tất cả",
					maxStar: "Tất cả",
					tags: "Tất cả",
					cost: "Tất cả",
				};
			} else if (key === "powers") {
				initialFilters.powers = {
					rarity: [
						"Tất cả",
						...[...new Set(initialData.powers.items.map(p => p.rarity))].sort(),
					],
				};
				initialActiveFilters.powers = { rarity: "Tất cả" };
			} else if (key === "relics" || key === "items") {
				// Updated condition
				const categories = [
					"Tất cả",
					...[
						...new Set(
							initialData[key].items.map(item => item.rarity).filter(Boolean)
						),
					].sort(),
				];
				if (categories.length > 2) {
					initialFilters[key] = categories;
				}
				initialActiveFilters[key] = "Tất cả";
			} else {
				// Handles 'maps' and any other new wheels without specific filters
				initialActiveFilters[key] = "Tất cả";
			}
		}
		setCheckedItems(initialChecked);
		setCustomItemsText(initialText);
		setFilterCategories(initialFilters);
		setActiveFilters(initialActiveFilters);
	}, []);

	const handleFilterChange = useCallback((wheelKey, filterType, value) => {
		setActiveFilters(prevState => {
			const currentWheelFilters = prevState[wheelKey];
			if (
				typeof currentWheelFilters === "object" &&
				currentWheelFilters !== null
			) {
				return {
					...prevState,
					[wheelKey]: { ...currentWheelFilters, [filterType]: value },
				};
			}
			return { ...prevState, [wheelKey]: value };
		});
	}, []);

	const handleCheckboxChange = useCallback((wheelKey, itemName, isChecked) => {
		setCheckedItems(p => ({
			...p,
			[wheelKey]: { ...p[wheelKey], [itemName]: isChecked },
		}));
	}, []);

	const handleCustomItemsChange = useCallback((wheelKey, newText) => {
		setCustomItemsText(p => ({ ...p, [wheelKey]: newText }));
	}, []);

	const handleSelectAll = useCallback(
		(wheelKey, itemsToSelect) => {
			const updatedChecks = { ...checkedItems[wheelKey] };
			itemsToSelect.forEach(item => {
				updatedChecks[item.name] = true;
			});
			setCheckedItems(p => ({ ...p, [wheelKey]: updatedChecks }));
		},
		[checkedItems]
	);

	const handleDeselectAll = useCallback(
		(wheelKey, itemsToDeselect) => {
			const updatedChecks = { ...checkedItems[wheelKey] };
			itemsToDeselect.forEach(item => {
				updatedChecks[item.name] = false;
			});
			setCheckedItems(p => ({ ...p, [wheelKey]: updatedChecks }));
		},
		[checkedItems]
	);

	const handleSelectWheel = key => {
		if (key === activeWheelKey) return;
		setIsWheelVisible(false);
		setTimeout(() => {
			setActiveWheelKey(key);
			setIsWheelVisible(true);
		}, 300);
	};

	const itemsForWheel = React.useMemo(() => {
		if (!originalWheelsData[activeWheelKey] || !checkedItems[activeWheelKey])
			return [];
		const selectedOriginalItems = originalWheelsData[
			activeWheelKey
		].items.filter(item => checkedItems[activeWheelKey][item.name]);
		const customItems = (customItemsText[activeWheelKey] || "")
			.split("\n")
			.map(name => name.trim())
			.filter(Boolean)
			.map(name => ({ name }));
		return [...selectedOriginalItems, ...customItems];
	}, [activeWheelKey, originalWheelsData, checkedItems, customItemsText]);

	const filteredItems = React.useMemo(() => {
		if (!originalWheelsData[activeWheelKey]) return [];
		const items = originalWheelsData[activeWheelKey].items;
		const filters = activeFilters[activeWheelKey];
		if (!filters) return items;

		return items.filter(item => {
			if (activeWheelKey === "champions") {
				const { regions, maxStar, tags, cost } = filters;
				if (regions !== "Tất cả" && !item.regions.includes(regions))
					return false;
				if (maxStar !== "Tất cả" && item.maxStar != maxStar) return false;
				if (tags !== "Tất cả" && !item.tags.includes(tags)) return false;
				if (cost !== "Tất cả" && item.cost != cost) return false;
			} else if (activeWheelKey === "powers") {
				const { rarity } = filters;
				if (rarity !== "Tất cả" && item.rarity !== rarity) return false;
			} else {
				if (
					typeof filters === "string" &&
					filters !== "Tất cả" &&
					item.rarity !== filters
				)
					return false;
			}
			return true;
		});
	}, [activeWheelKey, originalWheelsData, activeFilters]);

	const activeWheel = originalWheelsData[activeWheelKey];

	return (
		<div className='bg-gradient-to-br from-slate-600 to-gray-100 min-h-screen flex relative overflow-hidden'>
			{isPanelOpen && (
				<div
					onClick={() => setIsPanelOpen(false)}
					className='fixed inset-0 bg-black/0 z-20'
				/>
			)}
			<main className='flex-grow p-4 flex items-center justify-center transition-all duration-300 ease-in-out'>
				<div
					className={`transition-opacity duration-300 w-full h-full flex justify-center items-center ${
						isWheelVisible ? "opacity-100" : "opacity-0"
					}`}
				>
					{activeWheel && (
						<VongQuayNgauNhien
							key={activeWheel.key}
							items={itemsForWheel}
							title={activeWheel.title}
						/>
					)}
				</div>
			</main>
			{!isPanelOpen && (
				<button
					onClick={() => setIsPanelOpen(true)}
					className='fixed top-1/2 right-0 -translate-y-1/2 bg-slate-800 text-white p-3 rounded-l-lg shadow-lg z-40 hover:bg-slate-700 transition-colors'
					title='Mở bảng điều khiển'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-6 w-6'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						strokeWidth={2}
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M11 19l-7-7 7-7m8 14l-7-7 7-7'
						/>
					</svg>
				</button>
			)}
			<aside
				className={`fixed top-0 right-0 h-full transition-transform duration-300 ease-in-out z-30 ${
					isPanelOpen ? "translate-x-0" : "translate-x-full"
				}`}
				style={{ width: "24rem", maxWidth: "100vw" }}
			>
				{activeWheel && (
					<SidePanel
						wheelsData={originalWheelsData}
						activeWheelKey={activeWheelKey}
						onSelectWheel={handleSelectWheel}
						setIsOpen={setIsPanelOpen}
						customItemsText={customItemsText[activeWheelKey] || ""}
						onCustomItemsChange={handleCustomItemsChange}
						originalItems={filteredItems}
						checkedItems={checkedItems[activeWheelKey]}
						onCheckboxChange={handleCheckboxChange}
						onSelectAll={handleSelectAll}
						onDeselectAll={handleDeselectAll}
						filters={filterCategories[activeWheelKey]}
						activeFilter={activeFilters[activeWheelKey]}
						onFilterChange={handleFilterChange}
					/>
				)}
			</aside>
		</div>
	);
}

export default RandomizerPage;
