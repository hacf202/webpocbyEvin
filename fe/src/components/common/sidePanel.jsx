// src/components/common/SidePanel.jsx (ĐÃ ĐỒNG BỘ)

import { memo } from "react";
import InputField from "./inputField";
import MultiSelectFilter from "./multiSelectFilter";
import DropdownFilter from "./dropdownFilter";
import Button from "./button";
import { Search, Plus, RotateCw, XCircle } from "lucide-react";

const SidePanel = memo(
	({
		searchPlaceholder = "Tìm kiếm...",
		addLabel = "Thêm Mới",
		resetLabel = "Đặt lại bộ lọc",
		searchInput,
		onSearchInputChange,
		onSearch,
		onClearSearch,
		onAddNew,
		onResetFilters,
		multiFilterConfigs = [],
		sortOptions = [],
		sortSelectedValue,
		onSortChange,
	}) => {
		return (
			// Sử dụng class ngữ nghĩa
			<div className='bg-surface-bg rounded-lg border border-border p-4 sm:p-6 mb-6'>
				<div className='space-y-4'>
					{/* Search Block */}
					<div>
						<label className='block text-sm font-medium mb-1 text-text-secondary'>
							Tìm kiếm
						</label>
						<div className='relative'>
							<InputField
								value={searchInput}
								onChange={onSearchInputChange}
								onKeyPress={e => e.key === "Enter" && onSearch()}
								placeholder={searchPlaceholder}
							/>
							{searchInput && (
								<button
									onClick={onClearSearch}
									// Sử dụng class ngữ nghĩa
									className='absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary'
								>
									<XCircle size={18} />
								</button>
							)}
						</div>
						<Button onClick={onSearch} className='w-full mt-2'>
							<Search size={16} className='mr-2' />
							Tìm kiếm
						</Button>
					</div>

					{/* Action Buttons Block */}
					<div className='flex flex-col gap-4'>
						<Button onClick={onAddNew} className='w-full'>
							<Plus size={16} className='mr-2' />
							{addLabel}
						</Button>
						<Button
							variant='outline'
							onClick={onResetFilters}
							iconLeft={<RotateCw size={16} />}
							className='w-full'
						>
							{resetLabel}
						</Button>
					</div>

					{/* Filters Block */}
					<div className='flex flex-col gap-4'>
						{multiFilterConfigs.map((config, index) => (
							<MultiSelectFilter
								key={index}
								label={config.label}
								options={config.options}
								selectedValues={config.selectedValues}
								onChange={config.onChange}
								placeholder={config.placeholder}
							/>
						))}
					</div>

					{/* Sort Dropdown Block */}
					<div>
						<DropdownFilter
							label='Sắp xếp'
							options={sortOptions}
							selectedValue={sortSelectedValue}
							onChange={onSortChange}
						/>
					</div>
				</div>
			</div>
		);
	}
);

export default SidePanel;
