// ChampionEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField"; // <-- NÊN DÙNG InputField
import { XCircle, Plus } from "lucide-react";

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
				<label className='font-semibold text-text-secondary'>{label}:</label>
				<Button
					onClick={handleAddItem}
					type='button'
					variant='outline' // Dùng variant 'outline'
					size='sm' // Giả sử Button hỗ trợ size
					iconLeft={<Plus size={14} />}
				>
					Thêm
				</Button>
			</div>
			<div className='flex flex-col gap-2'>
				{data.length > 0 ? (
					data.map((item, index) => (
						<div key={index} className='flex items-center gap-2'>
							<span className='font-bold text-text-secondary'>
								{index + 1}.
							</span>
							{/* Sử dụng InputField component cho nhất quán */}
							<InputField
								type='text'
								value={item?.S || ""}
								onChange={e => handleItemChange(index, e.target.value)}
								className='flex-grow'
							/>
							<button
								onClick={() => handleRemoveItem(index)}
								type='button'
								className='text-text-secondary hover:text-danger-500 transition-colors'
							>
								<XCircle size={20} />
							</button>
						</div>
					))
				) : (
					<p className='text-sm text-center text-text-secondary bg-surface-hover p-2 rounded-md'>
						Chưa có mục nào.
					</p>
				)}
			</div>
		</div>
	);
};

// --- COMPONENT: ChampionEditorForm (ĐÃ ĐỒNG BỘ) ---
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

		// Component con cho Textarea (ĐÃ ĐỒNG BỘ)
		const renderTextareaForStringArray = (label, fieldName, data = []) => (
			<div className='flex flex-col gap-1'>
				<label className='font-semibold text-text-secondary'>
					{label} (phân cách bởi dấu phẩy):
				</label>
				<textarea
					rows={2}
					defaultValue={(data || []).join(", ")}
					onChange={event =>
						handleStringArrayChange(fieldName, event.target.value)
					}
					// Đồng bộ style với InputField
					className='w-full p-2 bg-input-bg text-input-text rounded-md border border-input-border
            placeholder:text-input-placeholder
            focus:border-input-focus-border focus:ring-0 focus:outline-none 
            transition-colors duration-200 resize-y'
				/>
			</div>
		);

		return (
			// Sử dụng class ngữ nghĩa
			<div className='p-4 bg-surface-bg rounded-lg border border-border'>
				{/* Header của Form */}
				<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 mb-4 border-b border-border'>
					<div className='flex items-center gap-2 mb-2 sm:mb-0'>
						<h3 className='text-xl font-bold text-text-primary font-primary'>
							{champion.isNew ? "Tạo Tướng Mới" : `Chỉnh sửa: ${champion.name}`}
						</h3>
					</div>
					<div className='flex items-center gap-2 flex-wrap'>
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

				{/* Grid Layout cho Form */}
				<div className='grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6'>
					{/* Section: Thông tin cơ bản */}
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
                  placeholder:text-input-placeholder
                  focus:border-input-focus-border focus:ring-0 focus:outline-none 
                  transition-colors duration-200 resize-y'
							></textarea>
						</div>
					</div>

					{/* Section: Khu vực & Thẻ */}
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
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
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
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
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
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
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
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
					<div className='p-4 border border-border rounded-lg flex flex-col gap-4 bg-surface-hover'>
						<h4 className='text-lg font-semibold text-link border-b border-border pb-2'>
							6. Dữ liệu Tài nguyên (Assets)
						</h4>
						{(formData.assets || []).map((asset, index) => (
							<div key={index} className='flex flex-col gap-4'>
								{Object.entries(asset?.M || {}).map(([key, value]) => (
									<div key={key} className='flex flex-col gap-1'>
										<label className='font-semibold text-text-secondary text-sm'>
											{key}:
										</label>
										<InputField
											type='text'
											value={value?.S || ""}
											onChange={e =>
												handleAssetLinkChange(index, key, e.target.value)
											}
										/>
										<img
											src={value?.S || ""}
											alt={`${key} preview`}
											className='mt-2 rounded border border-border max-w-[60px] h-auto'
											onError={e => {
												e.targe.style.display = "none";
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
