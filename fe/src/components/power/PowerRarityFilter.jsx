import { memo, useState, useCallback } from "react";

function RarityFilter({ uniqueRarities, onRarityChange }) {
	const [selectedRarity, setSelectedRarity] = useState(
		() => localStorage.getItem("powersSelectedRarity") || ""
	);
	const [isOpen, setIsOpen] = useState(false);

	const saveToLocalStorage = useCallback((key, value) => {
		localStorage.setItem(key, value);
	}, []);

	const handleRarityChange = useCallback(
		value => {
			setSelectedRarity(value);
			saveToLocalStorage("powersSelectedRarity", value);
			onRarityChange(value);
			setIsOpen(false);
		},
		[saveToLocalStorage, onRarityChange]
	);

	return (
		<div className='relative w-full sm:w-auto'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-md bg-gray-700 text-white w-full sm:w-38 flex items-center justify-between'
				aria-label='Chọn độ hiếm của sức mạnh'
			>
				<span>{selectedRarity || "Tất cả độ hiếm"}</span>
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
				<div className='absolute z-10 mt-1 w-full sm:w-38 bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					<button
						onClick={() => handleRarityChange("")}
						className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
					>
						<span>Tất cả độ hiếm</span>
					</button>
					{uniqueRarities.map((rarity, index) => (
						<button
							key={index}
							onClick={() => handleRarityChange(rarity)}
							className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
						>
							<span>{rarity}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default memo(RarityFilter);
