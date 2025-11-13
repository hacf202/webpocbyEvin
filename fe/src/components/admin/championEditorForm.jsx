// src/pages/admin/championEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { XCircle, Plus } from "lucide-react";

const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	cachedData = {},
}) => {
	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = { S: newValue };
		onChange(newData);
	};

	const handleAddItem = () => {
		onChange([...data, { S: "" }]);
	};

	const handleRemoveItem = index => {
		onChange(data.filter((_, i) => i !== index));
	};

	const getItemData = name => cachedData[name] || {};

	// Xử lý DROP
	const handleDrop = (e, index) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const draggedData = JSON.parse(e.dataTransfer.getData("text/plain"));
			if (draggedData.name) {
				handleItemChange(index, draggedData.name);
			}
		} catch (err) {
			console.warn("Invalid drag data:", err);
		}
	};

	const handleDragOver = e => {
		e.preventDefault();
		e.dataTransfer.dropEffect = "copy";
	};

	const handleDragEnter = e => {
		e.currentTarget.classList.add("border-primary-500");
	};

	const handleDragLeave = e => {
		e.currentTarget.classList.remove("border-primary-500");
	};

	return (
		<div className='flex flex-col'>
			<div className='flex justify-between items-center mb-2'>
				<label className='font-semibold text-text-secondary'>{label}:</label>
				<Button
					onClick={handleAddItem}
					type='button'
					variant='outline'
					size='sm'
					iconLeft={<Plus size={14} />}
				>
					Thêm
				</Button>
			</div>
			<div className='flex flex-col gap-2'>
				{data.length > 0 ? (
					data.map((item, index) => {
						const itemData = getItemData(item?.S);
						return (
							<div
								key={index}
								className='flex items-center gap-2 p-3 bg-surface-hover rounded-md border border-border hover:bg-surface-hover-active transition-colors relative'
							>
								{/* Icon + Tooltip */}
								<div className='relative group flex-shrink-0'>
									{itemData.assetAbsolutePath ? (
										<img
											src={itemData.assetAbsolutePath}
											alt={itemData.name || ""}
											className='w-8 h-8 rounded border border-border object-contain bg-white'
											onError={e => (e.target.style.display = "none")}
										/>
									) : (
										<div className='w-8 h-8 bg-input-bg rounded border border-border flex items-center justify-center'>
											<span className='text-xs text-text-secondary'>?</span>
										</div>
									)}

									{itemData.descriptionRaw && (
										<div
											className='
											absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3
											w-80 max-w-[90vw] p-3 bg-black text-white text-xs leading-relaxed
											rounded-lg shadow-2xl opacity-0 group-hover:opacity-100
											transition-all duration-300 pointer-events-none z-50
											border border-gray-700
										'
										>
											<div className='font-bold text-sm text-yellow-300 mb-1'>
												{itemData.name}
											</div>
											<div className='whitespace-pre-wrap'>
												{itemData.descriptionRaw}
											</div>
											<div className='absolute top-full left-1/2 transform -translate-x-1/2 -mt-1'>
												<div className='w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black'></div>
											</div>
										</div>
									)}
								</div>

								{/* Input - DROP ZONE */}
								<div
									className='flex-grow relative border border-input-border rounded-md transition-colors'
									onDrop={e => handleDrop(e, index)}
									onDragOver={handleDragOver}
									onDragEnter={handleDragEnter}
									onDragLeave={handleDragLeave}
								>
									<InputField
										type='text'
										value={item?.S || ""}
										onChange={e => handleItemChange(index, e.target.value)}
										placeholder='Kéo thả vào đây...'
										className='w-full p-2 bg-input-bg text-input-text rounded-md border-0 focus:ring-0 focus:outline-none'
										style={{
											overflow: "hidden",
											textOverflow: "ellipsis",
											whiteSpace: "nowrap",
										}}
									/>
								</div>

								<button
									onClick={() => handleRemoveItem(index)}
									type='button'
									className='text-danger-500 hover:text-danger-600 transition-colors flex-shrink-0 ml-1'
									title='Xóa'
								>
									<XCircle size={20} />
								</button>
							</div>
						);
					})
				) : (
					<p className='text-sm text-center text-text-secondary bg-surface-hover p-3 rounded-md border border-dashed border-border'>
						Chưa có mục nào.
					</p>
				)}
			</div>
		</div>
	);
};

const ChampionEditorForm = memo(
	({
		champion,
		videoLinks,
		cachedData,
		onSave,
		onCancel,
		onDelete,
		isSaving,
	}) => {
		const [formData, setFormData] = useState(champion);
		const [stringArrays, setStringArrays] = useState({
			regions: "",
			regionRefs: "",
			tag: "",
		});

		// === LOAD DỮ LIỆU ===
		useEffect(() => {
			if (!champion) return;
			const videoData = videoLinks?.find(v => v.name === champion.name);
			const newFormData = {
				...champion,
				videoLink: videoData?.link || "",
				musicVideo: videoData?.MusicVideo || "",
			};
			setFormData(newFormData);

			// SỬA LỖI: Tự động load string array
			setStringArrays({
				regions: (newFormData.regions || []).join(", "),
				regionRefs: (newFormData.regionRefs || []).join(", "),
				tag: (newFormData.tag || []).join(", "),
			});
		}, [champion, videoLinks]);

		const handleInputChange = event => {
			const { name, value, type } = event.target;
			setFormData(prev => ({
				...prev,
				[name]: type === "number" ? parseInt(value, 10) || 0 : value,
			}));
		};

		const handleArrayChange = (fieldName, newArray) => {
			setFormData(prev => ({ ...prev, [fieldName]: newArray }));
		};

		const handleStringArrayChange = (fieldName, stringValue) => {
			const newArray = stringValue
				.split(",")
				.map(item => item.trim())
				.filter(item => item); // Bỏ .map(s => ({ S: s }))
			setFormData(prev => ({ ...prev, [fieldName]: newArray }));
			setStringArrays(prev => ({ ...prev, [fieldName]: stringValue }));
		};

		const handleAssetLinkChange = (assetIndex, assetKey, newValue) => {
			const updatedAssets = JSON.parse(JSON.stringify(formData.assets));
			if (updatedAssets[assetIndex]?.M[assetKey]) {
				updatedAssets[assetIndex].M[assetKey].S = newValue;
				setFormData(p => ({ ...p, assets: updatedAssets }));
			}
		};

		// === TEXTAREA CONTROLLED ===
		const renderTextareaForStringArray = (label, fieldName) => (
			<div className='flex flex-col gap-1'>
				<label className='font-semibold text-text-secondary'>
					{label} (phân cách bởi dấu phẩy):
				</label>
				<textarea
					rows={2}
					value={stringArrays[fieldName] || ""}
					onChange={e => handleStringArrayChange(fieldName, e.target.value)}
					className='w-full p-2 bg-input-bg text-input-text rounded-md border border-input-border
            placeholder:text-input-placeholder
            focus:border-input-focus-border focus:ring-0 focus:outline-none 
            transition-colors duration-200 resize-y'
				/>
			</div>
		);

		// === CACHE LOOKUP ===
		const dataLookup = {
			runes: Object.fromEntries((cachedData.runes || []).map(r => [r.name, r])),
			relics: Object.fromEntries(
				(cachedData.relics || []).map(r => [r.name, r])
			),
			powers: Object.fromEntries(
				(cachedData.powers || []).map(p => [p.name, p])
			),
			items: Object.fromEntries((cachedData.items || []).map(i => [i.name, i])),
		};

		return (
			<div className='p-4 bg-surface-bg rounded-lg border border-border'>
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-4 border-b border-border'>
					<h3 className='text-xl font-bold text-text-primary font-primary'>
						{champion.isNew ? "Tạo Tướng Mới" : `Chỉnh sửa: ${champion.name}`}
					</h3>
					<div className='flex items-center gap-2 flex-wrap mt-2 sm:mt-0'>
						{!champion.isNew && (
							<Button variant='danger' onClick={onDelete}>
								Xóa Tướng
							</Button>
						)}
						<Button variant='outline' onClick={onCancel}>
							Hủy
						</Button>
						<Button
							variant='primary'
							onClick={() => onSave(formData)}
							disabled={isSaving}
						>
							{isSaving ? "Đang lưu..." : "Lưu thay đổi"}
						</Button>
					</div>
				</div>

				<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
					{/* 1. Thông tin cơ bản */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							1. Thông tin cơ bản
						</h4>
						<InputField
							label='Tên Tướng:'
							type='text'
							name='name'
							value={formData.name || ""}
							onChange={handleInputChange}
						/>
						<InputField
							label='Giá (Cost):'
							type='number'
							name='cost'
							value={formData.cost || 0}
							onChange={handleInputChange}
						/>
						<InputField
							label='Sao tối đa (Max Star):'
							type='number'
							name='maxStar'
							value={formData.maxStar || 0}
							onChange={handleInputChange}
						/>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-text-secondary'>
								Mô tả:
							</label>
							<textarea
								name='description'
								rows={8}
								value={formData.description || ""}
								onChange={handleInputChange}
								className='w-full p-2 bg-input-bg text-input-text rounded-md border border-input-border
                  placeholder:text-input-placeholder focus:border-input-focus-border focus:ring-0 focus:outline-none 
                  transition-colors duration-200 resize-y'
							/>
						</div>
					</div>

					{/* 2. Khu vực & Thẻ – ĐÃ SỬA LOAD */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						{/* ... (Nội dung mục 2 không đổi) ... */}
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							2. Khu vực & Thẻ
						</h4>
						{renderTextareaForStringArray("Khu vực (Regions)", "regions")}
						{renderTextareaForStringArray(
							"Tham chiếu Khu vực (Region Refs)",
							"regionRefs"
						)}
						{renderTextareaForStringArray("Thẻ (Tags)", "tag")}
						<div>
							<h5 className='font-semibold text-text-secondary'>
								Hình ảnh (Assets):
							</h5>
							{(formData.assets || []).map((asset, index) => (
								<div
									key={index}
									className='flex flex-col gap-3 p-3 bg-surface rounded border border-border'
								>
									{Object.entries(asset?.M || {}).map(([key, value]) => (
										<div key={key} className='flex flex-col gap-1'>
											<label className='text-sm font-medium text-text-secondary'>
												{key}:
											</label>
											<InputField
												type='text'
												value={value?.S || ""}
												onChange={e =>
													handleAssetLinkChange(index, key, e.target.value)
												}
											/>
											{value?.S && (
												<img
													src={value.S}
													alt={`${key} preview`}
													className='mt-2 rounded border border-border max-w-[80px] h-auto'
													onError={e => {
														e.target.style.display = "none";
													}}
													onLoad={e => {
														e.target.style.display = "block";
													}}
												/>
											)}
										</div>
									))}
								</div>
							))}
						</div>

						{/* Video Links */}
						<div className='flex flex-col gap-4'>
							<h5 className='font-semibold text-text-secondary'>
								Video liên kết:
							</h5>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<div className='flex flex-col gap-3'>
									<InputField
										label='Video giới thiệu (YouTube embed URL):'
										type='text'
										name='videoLink'
										value={formData.videoLink || ""}
										onChange={handleInputChange}
										placeholder='https://www.youtube.com/embed/...'
									/>
									{formData.videoLink && (
										<div className='aspect-video rounded overflow-hidden border border-border'>
											<iframe
												src={formData.videoLink}
												title='Preview'
												className='w-full h-full'
												allowFullScreen
											/>
										</div>
									)}
								</div>
								<div className='flex flex-col gap-3'>
									<InputField
										label='Music Video (YouTube embed URL):'
										type='text'
										name='musicVideo'
										value={formData.musicVideo || ""}
										onChange={handleInputChange}
										placeholder='https://www.youtube.com/embed/...'
									/>
									{formData.musicVideo && (
										<div className='aspect-video rounded overflow-hidden border border-border'>
											<iframe
												src={formData.musicVideo}
												title='Music Preview'
												className='w-full h-full'
												allowFullScreen
											/>
										</div>
									)}
								</div>
							</div>
						</div>
					</div>

					{/* 3. Sức mạnh & Nâng cấp */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							3. Sức mạnh & Nâng cấp
						</h4>
						<ArrayInputComponent
							label='Chòm sao (Power Stars)'
							data={formData.powerStars || []}
							onChange={d => handleArrayChange("powerStars", d)}
							cachedData={dataLookup.powers}
						/>
						<ArrayInputComponent
							label='Sao thưởng (Bonus Stars)'
							data={formData.bonusStars || []}
							onChange={d => handleArrayChange("bonusStars", d)}
							cachedData={dataLookup.powers}
						/>
						<ArrayInputComponent
							label='Sức mạnh Phiêu lưu (Adventure Powers)'
							data={formData.adventurePowers || []}
							onChange={d => handleArrayChange("adventurePowers", d)}
							cachedData={dataLookup.powers}
						/>
					</div>

					{/* 4. Cổ vật (ĐÃ SỬA LAYOUT) */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover xl:col-span-3'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							4. Cổ vật
						</h4>
						{/* Grid 3 cột cho các bộ cổ vật */}
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{[1, 2, 3, 4, 5, 6].map(num => (
								<ArrayInputComponent
									key={`relic${num}`}
									label={`Bộ Cổ vật ${num}`}
									data={formData[`defaultRelicsSet${num}`] || []}
									onChange={d => handleArrayChange(`defaultRelicsSet${num}`, d)}
									cachedData={dataLookup.relics}
								/>
							))}
						</div>
					</div>
					{/* 5. Ngọc (Runes) */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							5. Ngọc (Runes)
						</h4>
						<ArrayInputComponent
							label='Ngọc (Runes)'
							data={formData.rune || []}
							onChange={d => handleArrayChange("rune", d)}
							cachedData={dataLookup.runes}
						/>
					</div>

					{/* 6. Vật phẩm mặc định */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							6. Vật phẩm mặc định
						</h4>
						<ArrayInputComponent
							label='Vật phẩm mặc định (Default Items)'
							data={formData.defaultItems || []}
							onChange={d => handleArrayChange("defaultItems", d)}
							cachedData={dataLookup.items}
						/>
					</div>

					{/* 7. Bộ bài khởi đầu */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							7. Bộ bài khởi đầu
						</h4>
						<ArrayInputComponent
							label='Bộ bài khởi đầu (Starting Deck)'
							data={formData.startingDeck || []}
							onChange={d => handleArrayChange("startingDeck", d)}
							cachedData={dataLookup.items}
						/>
					</div>
				</div>
			</div>
		);
	}
);

export default ChampionEditorForm;
