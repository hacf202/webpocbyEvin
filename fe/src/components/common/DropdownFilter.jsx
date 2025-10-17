import React, { useState, useRef, useEffect } from "react";

function DropdownFilter({
	options,
	selectedValue,
	onChange,
	placeholder,
	renderOption,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	const handleSelect = value => {
		onChange(value);
		setIsOpen(false);
	};

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [dropdownRef]);

	const displayedLabel =
		options.find(opt => opt.value === selectedValue)?.label || placeholder;

	return (
		<div className='relative w-full' ref={dropdownRef}>
			<button
				type='button' // Thêm type để tránh submit form
				onClick={() => setIsOpen(!isOpen)}
				className='p-2 rounded-md bg-[var(--color-background)] text-[var(--color-text-primary)] border border-[var(--color-border)] w-full flex items-center justify-between text-left'
			>
				<span className='truncate'>{displayedLabel}</span>
				{/* ... SVG Icon ... */}
			</button>
			{isOpen && (
				<div className='absolute z-10 mt-1 w-full bg-[var(--color-background)] rounded-md shadow-lg max-h-60 overflow-y-auto border border-[var(--color-border)]'>
					{/* ... Nút reset ... */}

					{/* SỬA LỖI: Sử dụng index trong key để đảm bảo tính duy nhất */}
					{options.map((option, index) => (
						<button
							type='button' // Thêm type để tránh submit form
							key={`${option.value}-${index}`} // Kết hợp value và index
							onClick={() => handleSelect(option.value)}
							className='w-full text-left px-4 py-2 text-[var(--color-text-primary)] hover:bg-[var(--color-surface)]'
						>
							{renderOption ? renderOption(option) : option.label}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default DropdownFilter;
