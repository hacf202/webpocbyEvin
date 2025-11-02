import React, { useState, useRef, useEffect } from "react";

function DropdownFilter({
	label,
	options,
	selectedValue,
	onChange,
	placeholder = "Chọn một tùy chọn...",
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
		(selectedValue &&
			options.find(opt => opt.value === selectedValue)?.label) ||
		placeholder;

	return (
		<div className='flex flex-col gap-1 w-full' ref={dropdownRef}>
			{label && (
				<label className='block text-sm font-medium mb-1 text-[var(--color-text-secondary)]'>
					{label}
				</label>
			)}
			<button
				type='button'
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex justify-between items-center p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-left transition-colors hover:bg-[var(--color-surface)] cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent'
			>
				<span className='truncate text-[var(--color-text-primary)]'>
					{displayedLabel}
				</span>
				<svg
					className={`h-4 w-4 transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
					fill='none'
					stroke='currentColor'
					viewBox='0 0 24 24'
				>
					<path
						strokeLinecap='round'
						strokeLinejoin='round'
						strokeWidth={2}
						d='M19 9l-7 7-7-7'
					/>
				</svg>
			</button>
			{isOpen && (
				<div className='absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg max-h-60 overflow-y-auto'>
					{selectedValue && (
						<button
							type='button'
							onClick={() => handleSelect("")}
							className='w-full text-left p-2 hover:bg-[var(--color-background)] cursor-pointer text-sm text-[var(--color-text-secondary)]'
						>
							Đặt lại
						</button>
					)}
					{options.map((option, index) => (
						<button
							type='button'
							key={`${option.value}-${index}`}
							onClick={() => handleSelect(option.value)}
							className={`w-full text-left p-2 hover:bg-[var(--color-background)] cursor-pointer flex items-center justify-between ${
								selectedValue === option.value
									? "bg-[var(--color-primary)] text-white"
									: ""
							}`}
						>
							<span
								className={`text-[var(--color-text-primary)] ${
									selectedValue === option.value ? "text-white" : ""
								}`}
							>
								{renderOption ? renderOption(option) : option.label}
							</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export default DropdownFilter;
