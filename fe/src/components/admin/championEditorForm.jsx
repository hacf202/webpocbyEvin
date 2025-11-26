// src/pages/admin/championEditorForm.jsx
import { useState, memo } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { XCircle, Plus, Link2 } from "lucide-react";

const ArrayInputComponent = ({
	label,
	data = [],
	onChange,
	cachedData = {},
	placeholder = "Nhập tên hoặc kéo thả vào đây",
}) => {
	const handleItemChange = (index, newValue) => {
		const newData = [...data];
		newData[index] = newValue.trim();
		onChange(newData.filter(Boolean));
	};

	const handleAddItem = () => {
		onChange([...data, ""]);
	};

	const handleRemoveItem = index => {
		onChange(data.filter((_, i) => i !== index));
	};

	const getItemData = name => cachedData[name] || {};

	const handleDrop = (e, index) => {
		e.preventDefault();
		e.stopPropagation();
		try {
			const dragged = JSON.parse(e.dataTransfer.getData("text/plain"));
			if (dragged.name) handleItemChange(index, dragged.name);
		} catch (err) {
			console.warn("Drag data không hợp lệ");
		}
	};

	const handleDragOver = e => e.preventDefault();

	return (
		<div className='flex flex-col gap-3'>
			<div className='flex justify-between items-center'>
				<label className='font-semibold text-text-primary'>{label}</label>
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={handleAddItem}
					iconLeft={<Plus size={16} />}
				>
					Thêm
				</Button>
			</div>

			<div className='space-y-2'>
				{data.length === 0 ? (
					<p className='text-center text-sm text-text-secondary py-4 bg-surface-hover/50 rounded-lg border border-dashed border-border'>
						Chưa có dữ liệu
					</p>
				) : (
					data.map((value, index) => {
						const item = getItemData(value);
						return (
							<div
								key={index}
								className='flex items-center gap-3 p-3 bg-surface-hover rounded-lg border border-border hover:border-primary-500 transition-all'
								onDrop={e => handleDrop(e, index)}
								onDragOver={handleDragOver}
							>
								<div className='relative group flex-shrink-0'>
									{item.assetAbsolutePath ? (
										<img
											src={item.assetAbsolutePath}
											alt={item.name}
											className='w-10 h-10 rounded object-contain bg-white border border-border'
										/>
									) : (
										<div className='w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center'>
											<span className='text-xs text-gray-500'>?</span>
										</div>
									)}

									{item.description && (
										<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-black text-white text-xs rounded-lg shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none border border-gray-600'>
											<div className='font-bold text-yellow-400 mb-1'>
												{item.name}
											</div>
											<div className='whitespace-pre-wrap text-gray-200'>
												{item.description}
											</div>
											<div className='absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-black'></div>
										</div>
									)}
								</div>

								<InputField
									value={value}
									onChange={e => handleItemChange(index, e.target.value)}
									placeholder={placeholder}
									className='flex-1'
								/>

								<button
									type='button'
									onClick={() => handleRemoveItem(index)}
									className='text-red-500 hover:text-red-600 transition'
									title='Xóa'
								>
									<XCircle size={20} />
								</button>
							</div>
						);
					})
				)}
			</div>
		</div>
	);
};

const ChampionEditorForm = memo(
	({ champion, cachedData, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState(champion || {});

		const handleInputChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleNumberChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
		};

		const handleArrayChange = (field, newArray) => {
			setFormData(prev => ({ ...prev, [field]: newArray }));
		};

		const handleAssetChange = (index, field, value) => {
			setFormData(prev => {
				const newAssets = [...(prev.assets || [])];
				newAssets[index] = { ...newAssets[index], [field]: value };
				return { ...prev, assets: newAssets };
			});
		};

		const handleAddAsset = () => {
			setFormData(prev => ({
				...prev,
				assets: [
					...(prev.assets || []),
					{ fullAbsolutePath: "", gameAbsolutePath: "", avatar: "" },
				],
			}));
		};

		const handleRemoveAsset = index => {
			setFormData(prev => ({
				...prev,
				assets: prev.assets.filter((_, i) => i !== index),
			}));
		};

		const handleSubmit = e => {
			e.preventDefault();
			onSave(formData);
		};

		const dataLookup = {
			powers: Object.fromEntries(
				(cachedData.powers || []).map(p => [p.name, p])
			),
			relics: Object.fromEntries(
				(cachedData.relics || []).map(r => [r.name, r])
			),
			items: Object.fromEntries((cachedData.items || []).map(i => [i.name, i])),
			runes: Object.fromEntries((cachedData.runes || []).map(r => [r.name, r])),
		};

		return (
			<form onSubmit={handleSubmit} className='space-y-8'>
				{/* ==================== 1. THÔNG TIN CƠ BẢN ==================== */}
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-surface-bg border border-border rounded-xl'>
					<div className='space-y-5'>
						<InputField
							label='Champion ID (VD: C056)'
							name='championID'
							value={formData.championID || ""}
							onChange={handleInputChange}
							required
							disabled={!formData.isNew}
							placeholder='C056, TFT9_Jinx...'
						/>
						<InputField
							label='Tên tướng'
							name='name'
							value={formData.name || ""}
							onChange={handleInputChange}
							required
						/>
						<div className='grid grid-cols-2 gap-4'>
							<InputField
								label='Năng lượng (Cost)'
								name='cost'
								type='number'
								value={formData.cost || ""}
								onChange={handleNumberChange}
								min='1'
								max='10'
							/>
							<InputField
								label='Sao tối đa'
								name='maxStar'
								type='number'
								value={formData.maxStar || ""}
								onChange={handleNumberChange}
								min='1'
								max='7'
							/>
						</div>
					</div>

					<div className='flex flex-col items-center justify-center'>
						<p className='text-sm font-medium text-text-secondary mb-3'>
							Avatar Preview
						</p>
						{formData.assets?.[0]?.avatar ? (
							<img
								src={formData.assets[0].avatar}
								alt='Avatar'
								className='w-48 h-48 object-contain rounded-xl border-4 border-primary-500/20 shadow-xl'
							/>
						) : (
							<div className='w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-xl flex items-center justify-center text-6xl text-gray-400'>
								?
							</div>
						)}
					</div>
				</div>

				{/* ==================== 2. MÔ TẢ + VÙNG + VIDEO ==================== */}
				<div className='grid grid-cols-1 xl:grid-cols-3 gap-6'>
					<div className='xl:col-span-2 space-y-8'>
						{/* MÔ TẢ CHI TIẾT – ĐÃ SỬA XUỐNG DÒNG HOÀN HẢO */}

						<div>
							<label className='block font-semibold text-text-primary mb-2'>
								Mô tả chi tiết
							</label>

							<textarea
								name='description'
								value={(formData.description || "")
									.replace(/\\\\n/g, "\n")
									.replace(/\\n/g, "\n")}
								onChange={handleInputChange}
								className='w-full p-4 rounded-lg border border-border bg-surface-bg text-text-primary placeholder:text-text-secondary focus:border-primary-500 resize-none font-mono text-sm'
								rows={12}
								placeholder='Nhấn Enter để xuống dòng...'
							/>
						</div>
						<ArrayInputComponent
							label='Vùng (Regions)'
							data={formData.regions || []}
							onChange={d => handleArrayChange("regions", d)}
							cachedData={cachedData.regions || {}}
						/>
					</div>

					{/* VIDEO – CHỈ DÙNG videoLink */}
					<div>
						<label className='block font-semibold text-text-primary mb-2'>
							Video giới thiệu
						</label>
						<InputField
							name='videoLink'
							value={formData.videoLink || ""}
							onChange={handleInputChange}
							placeholder='https://www.youtube.com/embed/...'
						/>
						{formData.videoLink && (
							<div className='mt-4 aspect-video rounded-xl overflow-hidden border border-border shadow-lg'>
								<iframe
									src={formData.videoLink}
									title='Video Preview'
									className='w-full h-full'
									allowFullScreen
								/>
							</div>
						)}
					</div>
				</div>

				{/* ==================== CÁC PHẦN CÒN LẠI GIỮ NGUYÊN ==================== */}
				<div>
					<h4 className='text-lg font-bold text-text-primary mb-4 flex items-center gap-2'>
						<Link2 size={20} /> Assets (Ảnh)
					</h4>
					{formData.assets?.map((asset, index) => (
						<div
							key={index}
							className='flex items-center gap-4 p-4 bg-surface-hover rounded-lg border border-border mb-3'
						>
							<div className='grid grid-cols-3 gap-3 flex-1'>
								{["avatar", "fullAbsolutePath", "gameAbsolutePath"].map(
									field => (
										<div key={field}>
											<InputField
												label={field === "avatar" ? "Avatar URL" : field}
												value={asset[field] || ""}
												onChange={e =>
													handleAssetChange(index, field, e.target.value)
												}
												placeholder='https://...'
											/>
											{asset[field] && (
												<img
													src={asset[field]}
													alt={field}
													className='mt-2 w-full max-w-24 h-auto rounded border'
													onError={e => (e.target.style.display = "none")}
												/>
											)}
										</div>
									)
								)}
							</div>
							{formData.assets.length > 1 && (
								<button
									type='button'
									onClick={() => handleRemoveAsset(index)}
									className='text-red-500'
								>
									<XCircle size={22} />
								</button>
							)}
						</div>
					))}
					<Button type='button' variant='outline' onClick={handleAddAsset}>
						Thêm Asset
					</Button>
				</div>

				<div className='space-y-6'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						<ArrayInputComponent
							label='Chòm sao (Power Stars)'
							data={formData.powerStars || []}
							onChange={d => handleArrayChange("powerStars", d)}
							cachedData={dataLookup.powers}
						/>
						<ArrayInputComponent
							label='Sức mạnh Phiêu lưu'
							data={formData.adventurePowers || []}
							onChange={d => handleArrayChange("adventurePowers", d)}
							cachedData={dataLookup.powers}
						/>
						<ArrayInputComponent
							label='Vật phẩm mặc định'
							data={formData.defaultItems || []}
							onChange={d => handleArrayChange("defaultItems", d)}
							cachedData={dataLookup.items}
						/>
					</div>

					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{[1, 2, 3, 4, 5, 6].map(n => (
							<ArrayInputComponent
								key={n}
								label={`Bộ Cổ vật ${n}`}
								data={formData[`defaultRelicsSet${n}`] || []}
								onChange={d => handleArrayChange(`defaultRelicsSet${n}`, d)}
								cachedData={dataLookup.relics}
							/>
						))}
					</div>

					<ArrayInputComponent
						label='Ngọc (Runes)'
						data={formData.rune || []}
						onChange={d => handleArrayChange("rune", d)}
						cachedData={dataLookup.runes}
					/>
				</div>

				{/* NÚT HÀNH ĐỘNG */}
				<div className='flex justify-end gap-4 pt-6 border-t border-border'>
					<Button type='button' variant='ghost' onClick={onCancel}>
						Hủy
					</Button>
					{champion && !champion.isNew && (
						<Button type='button' variant='danger' onClick={onDelete}>
							Xóa tướng
						</Button>
					)}
					<Button type='submit' variant='primary' disabled={isSaving}>
						{isSaving ? "Đang lưu..." : champion?.isNew ? "Tạo mới" : "Lưu"}
					</Button>
				</div>
			</form>
		);
	}
);

export default ChampionEditorForm;
