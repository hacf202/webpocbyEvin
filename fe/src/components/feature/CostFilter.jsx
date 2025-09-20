import { memo, useState, useCallback } from "react";

function CostFilter({ uniqueCosts, onCostChange }) {
	const [selectedCost, setSelectedCost] = useState(
		() => localStorage.getItem("championsSelectedCost") || ""
	);
	const [isOpen, setIsOpen] = useState(false);

	const saveToLocalStorage = useCallback((key, value) => {
		localStorage.setItem(key, value);
	}, []);

	const handleCostChange = useCallback(
		value => {
			setSelectedCost(value);
			saveToLocalStorage("championsSelectedCost", value);
			onCostChange(value);
			setIsOpen(false);
		},
		[saveToLocalStorage, onCostChange]
	);

	return (
		<div className='relative w-full sm:w-auto'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-md bg-gray-700 text-white w-full sm:w-44 flex items-center justify-between'
				aria-label='Chọn tiêu hao của tướng'
			>
				<span>{selectedCost || "Tất cả tiêu hao"}</span>
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
				<div className='absolute z-10 mt-1 w-full sm:w-44 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					<button
						onClick={() => handleCostChange("")}
						className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
					>
						<span>Tất cả tiêu hao</span>
					</button>
					{uniqueCosts.map((cost, index) => (
						<button
							key={index}
							onClick={() => handleCostChange(cost.toString())}
							className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
						>
							<span>{cost}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default memo(CostFilter);
