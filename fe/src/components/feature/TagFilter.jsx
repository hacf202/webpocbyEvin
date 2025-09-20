import { memo, useState, useCallback } from "react";

function TagFilter({ uniqueTags, onTagChange }) {
	const [selectedTag, setSelectedTag] = useState(
		() => localStorage.getItem("championsSelectedTag") || ""
	);
	const [isOpen, setIsOpen] = useState(false);

	const saveToLocalStorage = useCallback((key, value) => {
		localStorage.setItem(key, value);
	}, []);

	const handleTagChange = useCallback(
		value => {
			setSelectedTag(value);
			saveToLocalStorage("championsSelectedTag", value);
			onTagChange(value);
			setIsOpen(false);
		},
		[saveToLocalStorage, onTagChange]
	);

	return (
		<div className='relative w-full sm:w-auto'>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-md bg-gray-700 text-white w-full sm:w-36 flex items-center justify-between'
				aria-label='Chọn tag của tướng'
			>
				<span>{selectedTag || "Tất cả tag"}</span>
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
				<div className='absolute z-10 mt-1 w-full sm:w-36 bg-gray-700 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					<button
						onClick={() => handleTagChange("")}
						className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
					>
						<span>Tất cả tag</span>
					</button>
					{uniqueTags.map((tag, index) => (
						<button
							key={index}
							onClick={() => handleTagChange(tag)}
							className='w-full text-left px-4 py-2 text-white hover:bg-gray-600 flex items-center'
						>
							<span>{tag}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default memo(TagFilter);
