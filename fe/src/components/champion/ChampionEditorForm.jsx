// ChampionEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/Button";

// --- Component con: Dành cho việc chỉnh sửa mảng (giữ nguyên) ---
const ArrayInputComponent = ({ label, data = [], onChange }) => {
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

	return (
		<div className='flex flex-col'>
			<div className='flex justify-between items-center mb-2'>
				<label className='font-semibold text-[var(--color-text-secondary)]'>
					{label}:
				</label>
				<button
					onClick={handleAddItem}
					type='button'
					className='px-3 py-1 text-xs font-semibold text-white bg-[var(--color-primary)] rounded hover:bg-[var(--color-primary-hover)] transition-colors'
				>
					+ Thêm
				</button>
			</div>
			<div className='flex flex-col gap-2'>
				{data.length > 0 ? (
					data.map((item, index) => (
						<div key={index} className='flex items-center gap-2'>
							<span className='font-bold text-[var(--color-text-secondary)]'>
								{index + 1}.
							</span>
							<input
								type='text'
								value={item?.S || ""}
								onChange={e => handleItemChange(index, e.target.value)}
								className='flex-grow p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
							<button
								onClick={() => handleRemoveItem(index)}
								type='button'
								className='text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors'
							>
								<svg
									xmlns='http://www.w3.org/2000/svg'
									className='h-5 w-5'
									viewBox='0 0 20 20'
									fill='currentColor'
								>
									<path
										fillRule='evenodd'
										d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
										clipRule='evenodd'
									/>
								</svg>
							</button>
						</div>
					))
				) : (
					<p className='text-sm text-center text-[var(--color-text-secondary)] bg-[var(--color-background)] p-2 rounded-md'>
						Chưa có mục nào.
					</p>
				)}
			</div>
		</div>
	);
};

// --- COMPONENT: ChampionEditorForm (giữ nguyên) ---
const ChampionEditorForm = memo(
	({ champion, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState(champion);

		useEffect(() => {
			setFormData(champion);
		}, [champion]);

		const handleInputChange = event => {
			const { name, value, type } = event.target;
			setFormData(previousData => ({
				...previousData,
				[name]: type === "number" ? parseInt(value, 10) || 0 : value,
			}));
		};

		const handleArrayChange = (fieldName, newArray) => {
			setFormData(previousData => ({ ...previousData, [fieldName]: newArray }));
		};

		const handleStringArrayChange = (fieldName, stringValue) => {
			const newArray = stringValue
				.split(",")
				.map(item => item.trim())
				.filter(item => item);
			setFormData(previousData => ({ ...previousData, [fieldName]: newArray }));
		};

		const handleAssetLinkChange = (assetIndex, assetKey, newValue) => {
			const updatedAssets = JSON.parse(JSON.stringify(formData.assets));
			if (updatedAssets[assetIndex]?.M[assetKey]) {
				updatedAssets[assetIndex].M[assetKey].S = newValue;
				setFormData(p => ({ ...p, assets: updatedAssets }));
			}
		};

		const renderTextareaForStringArray = (label, fieldName, data = []) => (
			<div className='flex flex-col gap-1'>
				<label className='font-semibold text-[var(--color-text-secondary)]'>
					{label} (phân cách bởi dấu phẩy):
				</label>
				<textarea
					rows={2}
					defaultValue={(data || []).join(", ")}
					onChange={event =>
						handleStringArrayChange(fieldName, event.target.value)
					}
					className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
				/>
			</div>
		);

		return (
			<div className='p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]'>
				{/* Header của Form */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-4 border-b border-[var(--color-border)]'>
					<div className='flex items-center gap-2 mb-2 sm:mb-0'>
						<h3 className='text-xl font-bold text-[var(--color-text-primary)]'>
							{champion.isNew ? "Tạo Tướng Mới" : `Chỉnh sửa: ${champion.name}`}
						</h3>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
						{!champion.isNew && (
							<button
								onClick={onDelete}
								className='px-4 py-2 text-sm font-semibold text-white bg-[var(--color-danger)] rounded-md hover:bg-[var(--color-danger-hover)] transition-colors'
							>
								Xóa Tướng
							</button>
						)}
						<button
							onClick={onCancel}
							className='px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)] bg-transparent border border-[var(--color-border)] rounded-md hover:bg-[var(--color-background)] transition-colors'
						>
							Hủy
						</button>
						<button
							onClick={() => onSave(formData)}
							className='px-4 py-2 text-sm font-semibold text-white bg-[var(--color-primary)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
							disabled={isSaving}
						>
							{isSaving ? "Đang lưu..." : "Lưu thay đổi"}
						</button>
					</div>
				</div>

				{/* Grid Layout cho Form */}
				<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
					{/* Section: Thông tin cơ bản */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							1. Thông tin cơ bản
						</h4>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Tên Tướng:
							</label>
							<input
								type='text'
								name='name'
								value={formData.name || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Giá (Cost):
							</label>
							<input
								type='number'
								name='cost'
								value={formData.cost || 0}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Sao tối đa (Max Star):
							</label>
							<input
								type='number'
								name='maxStar'
								value={formData.maxStar || 0}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							/>
						</div>
						<div className='flex flex-col gap-1'>
							<label className='font-semibold text-[var(--color-text-secondary)]'>
								Mô tả:
							</label>
							<textarea
								name='description'
								rows={8}
								value={formData.description || ""}
								onChange={handleInputChange}
								className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
							></textarea>
						</div>
					</div>

					{/* Section: Khu vực & Thẻ */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							2. Khu vực & Thẻ
						</h4>
						{renderTextareaForStringArray(
							"Khu vực (Regions)",
							"regions",
							formData.regions
						)}
						{renderTextareaForStringArray(
							"Tham chiếu Khu vực (Region Refs)",
							"regionRefs",
							formData.regionRefs
						)}
						{renderTextareaForStringArray("Thẻ (Tags)", "tag", formData.tag)}
					</div>

					{/* Section: Sức mạnh & Nâng cấp */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							3. Sức mạnh & Nâng cấp
						</h4>
						<ArrayInputComponent
							label='Chòm sao (Power Stars)'
							data={formData.powerStars || []}
							onChange={newData => handleArrayChange("powerStars", newData)}
						/>
						<ArrayInputComponent
							label='Sao thưởng (Bonus Stars)'
							data={formData.bonusStars || []}
							onChange={newData => handleArrayChange("bonusStars", newData)}
						/>
						<ArrayInputComponent
							label='Sức mạnh Phiêu lưu (Adventure Powers)'
							data={formData.adventurePowers || []}
							onChange={newData =>
								handleArrayChange("adventurePowers", newData)
							}
						/>
					</div>

					{/* Section: Trang bị & Cổ vật */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							4. Trang bị & Cổ vật
						</h4>
						<ArrayInputComponent
							label='Vật phẩm mặc định (Default Items)'
							data={formData.defaultItems || []}
							onChange={newData => handleArrayChange("defaultItems", newData)}
						/>
						{[1, 2, 3, 4, 5, 6].map(num => (
							<ArrayInputComponent
								key={`relic${num}`}
								label={`Bộ Cổ vật ${num}`}
								data={formData[`defaultRelicsSet${num}`] || []}
								onChange={newData =>
									handleArrayChange(`defaultRelicsSet${num}`, newData)
								}
							/>
						))}
					</div>

					{/* Section: Ngọc & Bộ bài */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							5. Ngọc & Bộ bài
						</h4>
						<ArrayInputComponent
							label='Ngọc (Runes)'
							data={formData.rune || []}
							onChange={newData => handleArrayChange("rune", newData)}
						/>
						<ArrayInputComponent
							label='Bộ bài khởi đầu (Starting Deck)'
							data={formData.startingDeck || []}
							onChange={newData => handleArrayChange("startingDeck", newData)}
						/>
					</div>

					{/* Section: Dữ liệu Tài nguyên (Assets) */}
					<div className='p-4 border border-[var(--color-border)] rounded-lg flex flex-col gap-4 bg-[var(--color-background)]'>
						<h4 className='text-lg font-semibold text-[var(--color-text-link)] border-b border-[var(--color-border)] pb-2'>
							6. Dữ liệu Tài nguyên (Assets)
						</h4>
						{(formData.assets || []).map((asset, index) => (
							<div key={index} className='flex flex-col gap-4'>
								{Object.entries(asset?.M || {}).map(([key, value]) => (
									<div key={key} className='flex flex-col gap-1'>
										<label className='font-semibold text-[var(--color-text-secondary)] text-sm'>
											{key}:
										</label>
										<input
											type='text'
											value={value?.S || ""}
											onChange={e =>
												handleAssetLinkChange(index, key, e.target.value)
											}
											className='p-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md text-[var(--color-text-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none'
										/>
										<img
											src={value?.S || ""}
											alt={`${key} preview`}
											className='mt-2 rounded border border-[var(--color-border)] max-w-[60px] h-auto'
											onError={e => {
												e.target.style.display = "none";
											}}
											onLoad={e => {
												e.target.style.display = "block";
											}}
										/>
									</div>
								))}
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}
);

export default ChampionEditorForm;
