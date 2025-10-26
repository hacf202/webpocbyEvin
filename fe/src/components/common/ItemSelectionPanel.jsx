import React, { useState, useMemo } from "react";

const ItemSelectionPanel = ({
	title,
	items,
	selectedItems,
	onToggleItem,
	onToggleAll,
}) => {
	const [searchTerm, setSearchTerm] = useState("");

	// Lọc danh sách mục dựa trên từ khóa tìm kiếm
	const filteredItems = useMemo(() => {
		if (!searchTerm) {
			return items;
		}
		return items.filter(item =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [items, searchTerm]);

	// Xác định trạng thái của checkbox "Chọn tất cả"
	const areAllSelected = items.every(item => selectedItems[item.name]);

	return (
		<div className='bg-slate-900/50 p-4 rounded-xl border border-slate-700 w-full h-full flex flex-col'>
			{/* Tiêu đề */}
			<h3 className='text-xl font-bold text-white mb-4'>Tùy Chỉnh: {title}</h3>

			{/* Thanh công cụ */}
			<div className='flex flex-col sm:flex-row gap-4 mb-4'>
				{/* Chọn/Bỏ chọn tất cả */}
				<label className='flex-shrink-0 flex items-center text-white cursor-pointer'>
					<input
						type='checkbox'
						className='form-checkbox h-5 w-5 bg-slate-700 border-slate-500 text-blue-500 rounded focus:ring-blue-400'
						checked={areAllSelected}
						onChange={() => onToggleAll(!areAllSelected)}
					/>
					<span className='ml-3'>
						{areAllSelected ? "Bỏ chọn tất cả" : "Chọn tất cả"}
					</span>
				</label>
				{/* Ô tìm kiếm */}
				<input
					type='text'
					placeholder='Tìm kiếm...'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					className='w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500'
				/>
			</div>

			{/* Danh sách các mục */}
			<div className='overflow-y-auto flex-grow pr-2'>
				<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
					{filteredItems.map(item => (
						<label
							key={item.name}
							className='flex items-center p-2 rounded-md bg-slate-700/50 hover:bg-slate-700 transition-colors cursor-pointer'
						>
							<input
								type='checkbox'
								className='form-checkbox h-5 w-5 bg-slate-700 border-slate-500 text-blue-500 rounded focus:ring-blue-400'
								checked={!!selectedItems[item.name]}
								onChange={() => onToggleItem(item.name)}
							/>
							<span
								className='ml-3 text-gray-200 truncate flex-grow'
								title={item.name}
							>
								{item.name}
							</span>
						</label>
					))}
				</div>
			</div>
		</div>
	);
};

export default ItemSelectionPanel;
