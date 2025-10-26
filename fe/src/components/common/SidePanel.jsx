import React, { useState, useMemo } from "react";

// --- ĐÃ CẬP NHẬT: Thêm nhãn cho các bộ lọc của Sức Mạnh ---
const filterLabels = {
	regions: "Khu vực",
	maxStar: "Sao tối đa",
	tags: "Nhãn",
	cost: "Tiêu hao",
	rarity: "Độ hiếm", // Thêm nhãn cho độ hiếm
	type: "Loại",
};

const SidePanel = ({
	wheelsData,
	activeWheelKey,
	onSelectWheel,
	setIsOpen,
	customItemsText,
	onCustomItemsChange,
	originalItems,
	checkedItems,
	onCheckboxChange,
	onSelectAll,
	onDeselectAll,
	filters,
	activeFilter,
	onFilterChange,
}) => {
	const [activeTab, setActiveTab] = useState("select");
	const [searchTerm, setSearchTerm] = useState("");

	// --- ĐÃ SỬA LỖI: Đơn giản hóa logic lọc ---
	// Component cha (RandomizerPage) đã lọc theo dropdown.
	// Component này chỉ cần lọc thêm theo thanh tìm kiếm.
	const searchFilteredItems = useMemo(() => {
		if (!originalItems) {
			return [];
		}
		if (!searchTerm) {
			return originalItems;
		}
		return originalItems.filter(item =>
			item.name.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [originalItems, searchTerm]);

	const renderFilters = () => {
		if (!filters) return null;

		// Hiển thị bộ lọc đa cấp (dạng dropdown) cho Tướng và Sức Mạnh
		if (typeof filters === "object" && !Array.isArray(filters)) {
			return (
				<div className='grid grid-cols-2 gap-x-4 gap-y-2 mb-2'>
					{Object.entries(filters).map(([type, options]) => (
						<div key={type}>
							<label className='block text-sm font-medium text-slate-300 mb-1'>
								{filterLabels[type] ||
									type.charAt(0).toUpperCase() + type.slice(1)}
							</label>
							<select
								value={activeFilter[type]}
								onChange={e =>
									onFilterChange(activeWheelKey, type, e.target.value)
								}
								className='w-full px-2 py-1 text-sm bg-slate-700 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-1 focus:ring-blue-500'
							>
								{options.map(option => (
									<option key={option} value={option}>
										{option}
									</option>
								))}
							</select>
						</div>
					))}
				</div>
			);
		}

		// Hiển thị bộ lọc đơn (dạng nút) cho Cổ vật và Vật phẩm
		return (
			<div className='flex items-center space-x-2 my-1 pt-2 mb-4 pb-2'>
				{filters.map(filter => (
					<button
						key={filter}
						onClick={() => onFilterChange(activeWheelKey, null, filter)}
						className={`px-3 py-1 text-sm font-semibold rounded-full whitespace-nowrap transition-colors ${
							activeFilter === filter
								? "bg-blue-600 text-white"
								: "bg-slate-700 text-slate-300 hover:bg-slate-600"
						}`}
					>
						{filter}
					</button>
				))}
			</div>
		);
	};

	return (
		<div className='bg-slate-900/70 backdrop-blur-sm p-4 rounded-l-xl border-l border-t border-b border-slate-700 w-full h-full flex flex-col'>
			<div className='flex justify-between items-center mb-4'>
				<h3 className='text-xl font-bold text-white'>Bảng Điều Khiển</h3>
				<button
					onClick={() => setIsOpen(false)}
					className='text-slate-300 hover:text-white'
					title='Đóng bảng điều khiển'
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-6 w-6'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
						strokeWidth={2}
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							d='M13 5l7 7-7 7M5 5l7 7-7 7'
						/>
					</svg>
				</button>
			</div>
			<div className='flex border-b border-slate-700 mb-4'>
				<button
					onClick={() => setActiveTab("select")}
					className={`py-2 px-4 font-semibold transition-colors ${
						activeTab === "select"
							? "border-b-2 border-blue-500 text-white"
							: "text-slate-400 hover:text-white"
					}`}
				>
					Chọn Vòng Quay
				</button>
				<button
					onClick={() => setActiveTab("customize")}
					className={`py-2 px-4 font-semibold transition-colors ${
						activeTab === "customize"
							? "border-b-2 border-blue-500 text-white"
							: "text-slate-400 hover:text-white"
					}`}
				>
					Tùy Chỉnh
				</button>
			</div>
			<div className='flex-grow overflow-y-auto'>
				{activeTab === "select" && (
					<div className='grid grid-cols-2 gap-4'>
						{Object.values(wheelsData).map(wheel => (
							<button
								key={wheel.key}
								onClick={() => onSelectWheel(wheel.key)}
								className={`p-4 flex items-center justify-center text-lg font-bold rounded-lg cursor-pointer transition-all duration-300 transform border-2 ${
									activeWheelKey === wheel.key
										? "bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/40"
										: "bg-slate-700 text-slate-300 border-transparent hover:bg-slate-600 hover:scale-105"
								}`}
							>
								{wheel.title}
							</button>
						))}
					</div>
				)}
				{activeTab === "customize" && (
					<div className='flex flex-col space-y-4 h-full'>
						<div>
							<label
								htmlFor='custom-items-textarea'
								className='text-white mb-2 font-semibold block'
							>
								Thêm các giá trị mới (mỗi giá trị một dòng):
							</label>
							<textarea
								id='custom-items-textarea'
								value={customItemsText}
								onChange={event =>
									onCustomItemsChange(activeWheelKey, event.target.value)
								}
								placeholder='Nhập các giá trị tùy chỉnh...'
								className='w-full h-24 px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y'
							/>
						</div>
						<div className='flex-grow flex flex-col min-h-0'>
							<div className='flex justify-between items-center mb-2'>
								<h4 className='text-white font-semibold'>
									Chọn các giá trị có sẵn:
								</h4>
								<div className='flex items-center space-x-2'>
									<button
										onClick={() =>
											onSelectAll(activeWheelKey, searchFilteredItems)
										}
										className='text-blue-400 hover:text-blue-300 p-1'
										title='Chọn tất cả (hiển thị)'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-6 w-6'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
											strokeWidth={2}
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
									</button>
									<button
										onClick={() =>
											onDeselectAll(activeWheelKey, searchFilteredItems)
										}
										className='text-slate-400 hover:text-slate-300 p-1'
										title='Bỏ chọn tất cả (hiển thị)'
									>
										<svg
											xmlns='http://www.w3.org/2000/svg'
											className='h-6 w-6'
											fill='none'
											viewBox='0 0 24 24'
											stroke='currentColor'
											strokeWidth={2}
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												d='M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
									</button>
								</div>
							</div>
							{renderFilters()}
							<input
								type='text'
								placeholder='Tìm kiếm giá trị...'
								value={searchTerm}
								onChange={event => setSearchTerm(event.target.value)}
								className='w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2'
							/>
							<div className='flex-grow overflow-y-auto bg-slate-800 border border-slate-600 rounded-md p-2 space-y-2'>
								{searchFilteredItems.map(item => (
									<label
										key={item.name}
										className='flex items-center space-x-3 p-2 rounded-md hover:bg-slate-700 cursor-pointer'
									>
										<input
											type='checkbox'
											checked={checkedItems[item.name] || false}
											onChange={event =>
												onCheckboxChange(
													activeWheelKey,
													item.name,
													event.target.checked
												)
											}
											className='h-5 w-5 rounded bg-slate-700 border-slate-500 text-blue-500 focus:ring-blue-500'
										/>
										<span className='text-slate-200'>{item.name}</span>
									</label>
								))}
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default React.memo(SidePanel);
