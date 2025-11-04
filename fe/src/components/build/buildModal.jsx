// src/components/build/BuildModal.jsx
import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
// XÓA DÒNG NÀY:
// import championsData from "../../assets/data/champions.json";
import Modal from "../common/modal";
import Button from "../common/button";
import { Star, Eye, EyeOff, ChevronDown, AlertCircle, X } from "lucide-react";

// === Searchable Dropdown (giữ nguyên) ===
const SearchableDropdown = ({
	options,
	selectedValue,
	onChange,
	placeholder,
	disabled = false,
	loading = false,
	error = null,
	allowDuplicate = true,
	selectedValues = [],
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef(null);

	const selectedOption = useMemo(
		() => options.find(opt => opt.name === selectedValue),
		[options, selectedValue]
	);

	const filteredOptions = useMemo(
		() =>
			options
				.filter(opt =>
					opt.name.toLowerCase().includes(searchTerm.toLowerCase())
				)
				.filter(opt => {
					if (!allowDuplicate && selectedValues.includes(opt.name)) {
						return selectedValue === opt.name;
					}
					return true;
				}),
		[options, searchTerm, allowDuplicate, selectedValues, selectedValue]
	);

	useEffect(() => {
		const handleClickOutside = e => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = value => {
		if (
			!allowDuplicate &&
			selectedValues.includes(value) &&
			value !== selectedValue
		) {
			return;
		}
		onChange(value);
		setIsOpen(false);
		setSearchTerm("");
	};

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				type='button'
				onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
				disabled={disabled || loading}
				className={`w-full bg-input-bg border rounded-md p-2 flex justify-between items-center text-left transition-colors ${
					error
						? "border-input-error-border"
						: disabled || loading
						? "border-input-border opacity-50 cursor-not-allowed"
						: "border-input-border hover:border-primary-500"
				}`}
			>
				<div className='flex items-center truncate'>
					{selectedOption?.icon && (
						<img
							src={selectedOption.icon}
							alt={selectedOption.name}
							className='w-6 h-6 mr-2 rounded-full object-cover flex-shrink-0'
						/>
					)}
					<span
						className={`truncate ${
							selectedValue ? "text-text-primary" : "text-text-secondary"
						}`}
					>
						{loading ? "Đang tải..." : selectedValue || placeholder}
					</span>
				</div>
				<ChevronDown
					size={20}
					className={`text-text-secondary transition-transform flex-shrink-0 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && (
				<div
					className='absolute left-0 right-0 top-full mt-1 bg-surface-bg border border-border rounded-md shadow-2xl max-h-60 overflow-y-hidden z-[100]'
					style={{ minWidth: "100%" }}
				>
					<div className='p-2 sticky top-0 bg-surface-bg z-10 border-b border-border'>
						<input
							type='text'
							placeholder='Tìm kiếm...'
							className='w-full bg-surface-hover border border-border rounded-md p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>
					<ul className='max-h-48 overflow-y-auto'>
						{loading ? (
							<li className='p-3 text-center text-text-secondary text-sm'>
								Đang tải...
							</li>
						) : filteredOptions.length > 0 ? (
							filteredOptions.map(opt => {
								const isDisabled =
									!allowDuplicate &&
									selectedValues.includes(opt.name) &&
									opt.name !== selectedValue;
								return (
									<li
										key={opt.name}
										onClick={() => !isDisabled && handleSelect(opt.name)}
										className={`p-2 flex items-center transition-colors ${
											isDisabled
												? "opacity-40 cursor-not-allowed text-text-secondary"
												: "text-dropdown-item-text hover:bg-dropdown-item-hover-bg cursor-pointer"
										}`}
									>
										{opt.icon && (
											<img
												src={opt.icon}
												alt={opt.name}
												className='w-6 h-6 mr-2 rounded-full object-cover flex-shrink-0'
											/>
										)}
										<span className='truncate text-sm'>{opt.name}</span>
										{isDisabled && (
											<span className='ml-auto text-xs text-danger-text-dark'>
												Đã chọn
											</span>
										)}
									</li>
								);
							})
						) : (
							<li className='p-2 text-text-secondary text-sm'>
								Không tìm thấy
							</li>
						)}
					</ul>
				</div>
			)}

			{error && (
				<div className='mt-1 flex items-center gap-1 text-input-error-text text-xs'>
					<AlertCircle size={14} />
					<span>{error}</span>
				</div>
			)}
		</div>
	);
};

// === BuildModal ===
const BuildModal = ({
	isOpen,
	onClose,
	onConfirm,
	initialData = null,
	onChampionChange,
	maxStar = 7,
}) => {
	const { token } = useContext(AuthContext);
	const isEditMode = !!initialData;

	const [formData, setFormData] = useState(
		initialData || {
			championName: "",
			artifacts: [null, null, null],
			powers: [null, null, null, null, null, null],
			rune: [null],
			star: 3,
			description: "",
			display: false,
		}
	);

	const [selectedChampion, setSelectedChampion] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [hasChanges, setHasChanges] = useState(false);
	const [showConfirmClose, setShowConfirmClose] = useState(false);

	const [artifactErrors, setArtifactErrors] = useState([null, null, null]);
	const [powerErrors, setPowerErrors] = useState(Array(6).fill(null));

	const [relics, setRelics] = useState([]);
	const [powers, setPowers] = useState([]);
	const [runes, setRunes] = useState([]);
	const [champions, setChampions] = useState([]); // Thêm state cho champions
	const [loadingRelics, setLoadingRelics] = useState(true);
	const [loadingPowers, setLoadingPowers] = useState(true);
	const [loadingRunes, setLoadingRunes] = useState(true);
	const [loadingChampions, setLoadingChampions] = useState(true); // Thêm loading

	useEffect(() => {
		if (!isOpen) return;
		const fetchData = async () => {
			const baseURL = import.meta.env.VITE_API_URL;
			try {
				const [relicRes, powerRes, runeRes, championRes] = await Promise.all([
					fetch(`${baseURL}/api/relics`),
					fetch(`${baseURL}/api/generalPowers`),
					fetch(`${baseURL}/api/runes`),
					fetch(`${baseURL}/api/champions`), // Gọi API champions
				]);

				const relicData = await relicRes.json();
				const powerData = await powerRes.json();
				const runeData = await runeRes.json();
				const championData = await championRes.json();

				setRelics(
					relicData.map(r => ({
						name: r.name,
						icon: r.assetAbsolutePath,
						stack: r.stack,
					}))
				);
				setPowers(
					powerData.map(p => ({ name: p.name, icon: p.assetAbsolutePath }))
				);
				setRunes(
					runeData.map(r => ({ name: r.name, icon: r.assetAbsolutePath }))
				);
				setChampions(
					championData.map(c => ({
						name: c.name,
						icon: c.assets?.[0]?.M?.avatar?.S,
						regions: c.regions,
					}))
				);

				setLoadingRelics(false);
				setLoadingPowers(false);
				setLoadingRunes(false);
				setLoadingChampions(false); // Tắt loading
			} catch (err) {
				console.error("Lỗi tải dữ liệu:", err);
				setLoadingRelics(false);
				setLoadingPowers(false);
				setLoadingRunes(false);
				setLoadingChampions(false);
			}
		};
		fetchData();
	}, [isOpen]);

	// Sử dụng champions từ API thay vì championsData
	const championOptions = useMemo(() => champions, [champions]);

	const isChampionSelected = !!formData.championName;
	const isHoaLinhChampion =
		selectedChampion?.regions?.includes("Hoa Linh Lục Địa");

	const markChange = () => setHasChanges(true);

	const handleCloseAttempt = () => {
		if (hasChanges) {
			setShowConfirmClose(true);
		} else {
			onClose();
		}
	};

	const handleConfirmClose = () => {
		setShowConfirmClose(false);
		onClose();
	};

	const handleCancelClose = () => {
		setShowConfirmClose(false);
	};

	const handleArtifactChange = (value, index) => {
		const newArtifacts = [...formData.artifacts];
		newArtifacts[index] = value;
		setFormData(prev => ({ ...prev, artifacts: newArtifacts }));
		markChange();
		validateArtifacts();
	};

	const validateArtifacts = () => {
		const selected = formData.artifacts.filter(Boolean);
		const stack1Relics = relics.filter(r => r.stack === "1").map(r => r.name);
		const errors = [null, null, null];

		selected.forEach((name, idx) => {
			if (stack1Relics.includes(name) && selected.indexOf(name) !== idx) {
				errors[idx] = "Cổ vật này không thể chọn trùng";
			}
		});

		setArtifactErrors(errors);
		return errors.every(e => !e);
	};

	const handlePowerChange = (value, index) => {
		const newPowers = [...formData.powers];
		newPowers[index] = value;
		setFormData(prev => ({ ...prev, powers: newPowers }));
		markChange();
		validatePowers();
	};

	const validatePowers = () => {
		const selected = formData.powers.filter(Boolean);
		const errors = Array(6).fill(null);

		selected.forEach((name, idx) => {
			if (selected.indexOf(name) !== idx) {
				errors[idx] = "Sức mạnh đã được chọn";
			}
		});

		setPowerErrors(errors);
		return errors.every(e => !e);
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!isChampionSelected || formData.artifacts.filter(Boolean).length === 0)
			return;

		if (!validateArtifacts() || !validatePowers()) return;

		if (formData.star > maxStar) {
			alert(`Tối đa chỉ được chọn ${maxStar} sao cho tướng này!`);
			return;
		}

		setSubmitting(true);
		try {
			const url = isEditMode
				? `${import.meta.env.VITE_API_URL}/api/builds/${initialData._id}`
				: `${import.meta.env.VITE_API_URL}/api/builds`;

			const response = await fetch(url, {
				method: isEditMode ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					championName: formData.championName,
					description: formData.description,
					star: formData.star,
					display: formData.display,
					artifacts: formData.artifacts.filter(Boolean),
					powers: formData.powers.filter(Boolean),
					rune: formData.rune.filter(Boolean),
					like: initialData?.like || 0,
					favorite: initialData?.favorite || [],
				}),
			});

			const result = await response.json();
			if (response.ok) {
				onConfirm(result.build || result);
				onClose();
			}
		} catch (error) {
			console.error("Error:", error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<>
			<Modal
				isOpen={isOpen && !showConfirmClose}
				onClose={handleCloseAttempt}
				title={isEditMode ? "Chỉnh sửa Build" : "Tạo Build Mới"}
				maxWidth='max-w-3xl'
			>
				<form onSubmit={handleSubmit} className='space-y-5'>
					{/* Champion */}
					<div>
						<label className='block text-sm font-medium text-text-secondary mb-1'>
							Tướng (Bắt buộc):
						</label>
						<SearchableDropdown
							options={championOptions}
							selectedValue={formData.championName}
							onChange={v => {
								const champ = championOptions.find(c => c.name === v);
								setSelectedChampion(champ);
								setFormData(prev => ({
									...prev,
									championName: v,
									rune: champ?.regions?.includes("Hoa Linh Lục Địa")
										? prev.rune
										: [null],
								}));
								markChange();
								onChampionChange(v);
							}}
							placeholder='Chọn hoặc tìm kiếm tướng...'
							loading={loadingChampions} // Hiển thị loading
						/>
					</div>

					<fieldset disabled={!isChampionSelected} className='space-y-5'>
						{/* Star */}
						<div>
							<div className='flex items-center justify-between mb-2'>
								<label className='block text-sm font-medium text-text-secondary'>
									Xếp hạng sao:
								</label>
								<span className='text-xs text-text-secondary'>
									Tối đa: <strong>{maxStar} sao</strong>
								</span>
							</div>
							<div className='flex items-center gap-1'>
								{Array.from({ length: maxStar }, (_, i) => i + 1).map(s => (
									<Star
										key={s}
										size={28}
										className={`cursor-pointer transition-all ${
											formData.star >= s
												? "text-icon-star"
												: "text-border hover:text-text-secondary"
										}`}
										fill={formData.star >= s ? "currentColor" : "none"}
										onClick={() => {
											setFormData(prev => ({ ...prev, star: s }));
											markChange();
										}}
									/>
								))}
							</div>
						</div>

						{/* Artifacts, Rune, Powers */}
						<div>
							<label className='block text-sm font-medium text-text-secondary mb-2'>
								Cổ vật (Bắt buộc ít nhất 1):
							</label>
							<div className='grid grid-cols-3 gap-3'>
								{formData.artifacts.map((_, index) => (
									<SearchableDropdown
										key={`artifact-${index}`}
										options={relics}
										selectedValue={formData.artifacts[index]}
										onChange={v => handleArtifactChange(v, index)}
										placeholder={`Cổ vật ${index + 1}`}
										loading={loadingRelics}
										error={artifactErrors[index]}
										allowDuplicate={
											relics.find(r => r.name === formData.artifacts[index])
												?.stack !== "1"
										}
										selectedValues={formData.artifacts.filter(
											(_, i) => i !== index
										)}
									/>
								))}
							</div>
						</div>

						{isHoaLinhChampion && (
							<div>
								<label className='block text-sm font-medium text-text-secondary mb-2'>
									Ngọc bổ trợ:
								</label>
								<SearchableDropdown
									options={runes}
									selectedValue={formData.rune[0]}
									onChange={v => {
										setFormData(prev => ({ ...prev, rune: [v] }));
										markChange();
									}}
									placeholder='Chọn ngọc bổ trợ...'
									loading={loadingRunes}
								/>
							</div>
						)}

						<div>
							<label className='block text-sm font-medium text-text-secondary mb-2'>
								Sức mạnh:
							</label>
							<div className='grid grid-cols-3 gap-3'>
								{formData.powers.map((_, index) => (
									<SearchableDropdown
										key={`power-${index}`}
										options={powers}
										selectedValue={formData.powers[index]}
										onChange={v => handlePowerChange(v, index)}
										placeholder={`Sức mạnh ${index + 1}`}
										loading={loadingPowers}
										error={powerErrors[index]}
										allowDuplicate={false}
										selectedValues={formData.powers.filter(
											(_, i) => i !== index
										)}
									/>
								))}
							</div>
						</div>

						{/* Description */}
						<div>
							<label className='block text-sm font-medium text-text-secondary mb-2'>
								Ghi chú:
							</label>
							<textarea
								value={formData.description}
								onChange={e => {
									setFormData(prev => ({
										...prev,
										description: e.target.value,
									}));
									markChange();
								}}
								placeholder='Mô tả lối chơi, mẹo hay...'
								className='w-full bg-input-bg text-text-primary rounded-md h-28 p-3 border border-input-border
                placeholder:text-input-placeholder
                focus:border-input-focus-border focus:ring-0 focus:outline-none 
                transition-colors duration-200 resize-none'
							/>
						</div>

						{/* Display */}
						<div>
							<label className='block text-sm font-medium text-text-secondary mb-2'>
								Trạng thái hiển thị:
							</label>
							<button
								type='button'
								onClick={() => {
									setFormData(prev => ({ ...prev, display: !prev.display }));
									markChange();
								}}
								className='flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-bg border border-border 
                text-text-primary
                hover:bg-primary-500 hover:text-white hover:border-primary-500
                transition-all text-sm font-medium'
							>
								{formData.display ? <Eye size={18} /> : <EyeOff size={18} />}
								{formData.display ? "Công khai" : "Riêng tư"}
							</button>
						</div>
					</fieldset>

					<Button
						type='submit'
						variant='primary'
						className='w-full mt-6 py-3'
						disabled={submitting || !isChampionSelected || loadingChampions}
					>
						{submitting
							? "Đang xử lý..."
							: isEditMode
							? "Cập nhật Build"
							: "Tạo Build"}
					</Button>
				</form>
			</Modal>

			{/* Confirm Close Modal */}
			<Modal
				isOpen={showConfirmClose}
				onClose={handleCancelClose}
				title='Xác nhận đóng'
				maxWidth='max-w-sm'
			>
				<div className='flex items-center gap-2 mb-3'>
					<AlertCircle className='text-warning' size={20} />
					<p className='text-sm text-text-secondary'>
						Bạn có thay đổi chưa lưu. Đóng sẽ mất dữ liệu.
					</p>
				</div>
				<div className='flex gap-3 justify-end mt-4'>
					<Button variant='ghost' onClick={handleCancelClose}>
						Hủy
					</Button>
					<Button variant='danger' onClick={handleConfirmClose}>
						Đóng không lưu
					</Button>
				</div>
			</Modal>
		</>
	);
};

export default BuildModal;
