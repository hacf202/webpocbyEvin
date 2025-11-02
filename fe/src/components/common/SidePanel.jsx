// SidePanel.jsx (Shared component for Editors)
import { memo } from "react";
import InputField from "./InputField";
import MultiSelectFilter from "./MultiSelectFilter";
import DropdownFilter from "./DropdownFilter";
import Button from "./Button";
import { Search, Plus, RotateCw, XCircle } from "lucide-react";

// --- COMPONENT: SidePanel (Generic toolbar với search, add, filters, sort) ---
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
		multiFilterConfigs = [], // Array of { label, options, selectedValues, onChange, placeholder }
		sortOptions = [],
		sortSelectedValue,
		onSortChange,
	}) => {
		return (
			<div className='bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] p-4 sm:p-6 mb-6'>
				<div className='space-y-4'>
					{/* Search Block */}
					<div>
						<label className='block text-sm font-medium mb-1 text-[var(--color-text-secondary)]'>
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
									className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600'
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
