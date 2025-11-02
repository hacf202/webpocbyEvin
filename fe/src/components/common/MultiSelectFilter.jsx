// src/components/common/MultiSelectFilter.jsx

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Star, Tag } from "lucide-react";

const MultiSelectFilter = ({
	label,
	options,
	selectedValues = [], // <<< THAY ĐỔI: Thêm giá trị mặc định là một mảng rỗng
	onChange,
	placeholder = "Chọn một hoặc nhiều",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const wrapperRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [wrapperRef]);

	const handleSelect = value => {
		const newSelectedValues = selectedValues.includes(value)
			? selectedValues.filter(v => v !== value)
			: [...selectedValues, value];
		onChange(newSelectedValues);
	};

	// --- Render option in dropdown ---
	const renderOptionContent = option => (
		<div className='flex items-center gap-2'>
			{option.iconComponent}
			{option.iconUrl && (
				<img src={option.iconUrl} alt={option.label} className='w-5 h-5' />
			)}
			{option.isCost && (
				<div className='w-5 h-5 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full'>
					{option.value}
				</div>
			)}
			{option.isStar && (
				<div className='flex items-center gap-1'>
					<span className='text-sm font-medium'>{option.value}</span>
					<Star size={16} className='text-yellow-500' />
				</div>
			)}
			{option.isTag && (
				<Tag size={16} className='text-[var(--color-text-secondary)]' />
			)}
			{option.label}
		</div>
	);

	// --- Render selected chip content ---
	const renderSelectedChip = option => (
		<div className='flex items-center gap-1 bg-[var(--color-background)] px-2 py-0.5 rounded'>
			{option.iconComponent}
			{option.iconUrl && (
				<img src={option.iconUrl} alt={option.label} className='w-4 h-4' />
			)}
			{option.isCost && (
				<div className='w-4 h-4 flex items-center justify-center bg-blue-500 text-white text-xs rounded-full'>
					{option.value}
				</div>
			)}
			{option.isStar && (
				<div className='flex items-center gap-1'>
					<span className='text-xs font-medium'>{option.value}</span>
					<Star size={12} className='text-yellow-500' />
				</div>
			)}
			{option.label && <span className='text-sm'>{option.label}</span>}
		</div>
	);

	// --- Phần còn lại của component không thay đổi ---
	const displayContent =
		selectedValues.length > 0 ? (
			<div className='flex items-center gap-x-2 flex-wrap'>
				{options
					.filter(o => selectedValues.includes(o.value))
					.map(option => (
						<div key={option.value}>{renderSelectedChip(option)}</div>
					))}
			</div>
		) : (
			<span className='text-[var(--color-text-secondary)]'>{placeholder}</span>
		);

	return (
		<div className='relative' ref={wrapperRef}>
			<label className='block text-sm font-medium mb-1 text-[var(--color-text-secondary)]'>
				{label}
			</label>
			<button
				onClick={() => setIsOpen(!isOpen)}
				className='w-full flex justify-between items-center p-2 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md text-left'
			>
				<div className='flex-grow'>{displayContent}</div>
				<ChevronDown
					size={20}
					className={`transition-transform flex-shrink-0 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && (
				<div className='absolute z-10 w-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg max-h-60 overflow-y-auto'>
					{options.map(option => (
						<div
							key={option.value}
							onClick={() => handleSelect(option.value)}
							className='flex items-center justify-between p-2 hover:bg-[var(--color-background)] cursor-pointer'
						>
							{renderOptionContent(option)}
							{selectedValues.includes(option.value) && (
								<Check size={20} className='text-blue-500' />
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MultiSelectFilter;
