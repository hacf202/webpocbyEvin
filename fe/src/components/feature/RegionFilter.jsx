import { memo, useState, useCallback } from "react";
import iconRegions from "../../assets/data/iconRegions.json";

function RegionFilter({ uniqueRegions, onRegionChange }) {
	const [selectedRegion, setSelectedRegion] = useState(
		() => localStorage.getItem("championsSelectedRegion") || ""
	);
	const [isOpen, setIsOpen] = useState(false);

	const saveToLocalStorage = useCallback((key, value) => {
		localStorage.setItem(key, value);
	}, []);

	const handleRegionChange = useCallback(
		value => {
			setSelectedRegion(value);
			saveToLocalStorage("championsSelectedRegion", value);
			onRegionChange(value);
			setIsOpen(false);
		},
		[saveToLocalStorage, onRegionChange]
	);

	const findRegionIcon = regionName => {
		const region = iconRegions.find(item => item.name === regionName);
		return region?.iconAbsolutePath || "/images/default-icon.png";
	};

	return (
		<div className='relative w-full sm:w-auto'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-md bg-gray-700 text-white w-full sm:w-48 flex items-center justify-between'
				aria-label='Chọn khu vực của tướng'
			>
				<span className='flex items-center'>
					{selectedRegion && (
						<img
							src={findRegionIcon(selectedRegion)}
							alt={selectedRegion}
							className='w-6 h-6 mr-2'
							loading='lazy'
						/>
					)}
					{selectedRegion || "Tất cả khu vực"}
				</span>
				<svg
					className={`w-4 h-4 transform ${isOpen ? "rotate-180" : ""}`}
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth='2'
						d='M19 9l-7 7-7-7'
					/>
				</svg>
			</button>
			{isOpen && (
				<div className='absolute z-10 mt-1 w-full sm:w-48 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					<button
						onClick={() => handleRegionChange("")}
						className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
					>
						<span>Tất cả khu vực</span>
					</button>
					{uniqueRegions.map((region, index) => (
						<button
							key={index}
							onClick={() => handleRegionChange(region)}
							className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
						>
							<img
								src={findRegionIcon(region)}
								alt={region}
								className='w-6 h-6 mr-2'
								loading='lazy'
							/>
							<span>{region}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default memo(RegionFilter);
