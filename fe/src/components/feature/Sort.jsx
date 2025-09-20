import { memo, useState, useCallback } from "react";

function SortFilter({ onSortChange }) {
	const [sortOrder, setSortOrder] = useState(
		() => localStorage.getItem("championsSortOrder") || "asc"
	);
	const [isOpen, setIsOpen] = useState(false);

	const saveToLocalStorage = useCallback((key, value) => {
		localStorage.setItem(key, value);
	}, []);

	const handleSortChange = useCallback(
		value => {
			setSortOrder(value);
			saveToLocalStorage("championsSortOrder", value);
			onSortChange(value);
			setIsOpen(false);
		},
		[saveToLocalStorage, onSortChange]
	);

	const sortOptions = [
		{ value: "asc", label: "A-Z" },
		{ value: "desc", label: "Z-A" },
	];

	return (
		<div className='relative w-full sm:w-auto'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-md bg-gray-700 text-white w-full sm:w-20 flex items-center justify-between'
				aria-label='Chọn thứ tự sắp xếp'
			>
				<span>
					{sortOptions.find(opt => opt.value === sortOrder)?.label || "A-Z"}
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
				<div className='absolute z-10 mt-1 w-full sm:w-20 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					{sortOptions.map(option => (
						<button
							key={option.value}
							onClick={() => handleSortChange(option.value)}
							className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
						>
							<span>{option.label}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default memo(SortFilter);
