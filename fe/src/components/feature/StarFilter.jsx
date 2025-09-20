import { memo, useState, useCallback } from "react";

function StarFilter({ uniqueStars, onStarChange }) {
	const [selectedStar, setSelectedStar] = useState(
		() => localStorage.getItem("championsSelectedStar") || ""
	);
	const [isOpen, setIsOpen] = useState(false);

	const saveToLocalStorage = useCallback((key, value) => {
		localStorage.setItem(key, value);
	}, []);

	const handleStarChange = useCallback(
		value => {
			setSelectedStar(value);
			saveToLocalStorage("championsSelectedStar", value);
			onStarChange(value);
			setIsOpen(false);
		},
		[saveToLocalStorage, onStarChange]
	);

	return (
		<div className='relative w-full sm:w-auto'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-md bg-gray-700 text-white w-full sm:w-30 flex items-center justify-between'
				aria-label='Chọn số sao của tướng'
			>
				<span>{selectedStar || "Tất cả sao"}</span>
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
				<div className='absolute z-10 mt-1 w-full sm:w-30 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					<button
						onClick={() => handleStarChange("")}
						className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
					>
						<span>Tất cả sao</span>
					</button>
					{uniqueStars.map((star, index) => (
						<button
							key={index}
							onClick={() => handleStarChange(star.toString())}
							className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
						>
							<span>{star}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default memo(StarFilter);
