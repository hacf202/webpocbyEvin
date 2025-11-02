// src/components/build/BuildModal.jsx
import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext";
import championsData from "../../assets/data/champions.json";
import Modal from "../common/Modal"; // Dùng Modal chung
import { Star, Eye, EyeOff, ChevronDown, AlertCircle, X } from "lucide-react";

// === Searchable Dropdown ===
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
				className={`w-full bg-[var(--color-surface)] border rounded-md p-2 flex justify-between items-center text-left transition-colors ${
					error
						? "border-[var(--color-danger)]"
						: disabled || loading
						? "border-[var(--color-border)] opacity-50 cursor-not-allowed"
						: "border-[var(--color-border)] hover:border-[var(--color-primary)]"
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
							selectedValue
								? "text-[var(--color-text-primary)]"
								: "text-[var(--color-text-secondary)]"
						}`}
					>
						{loading ? "Đang tải..." : selectedValue || placeholder}
					</span>
				</div>
				<ChevronDown
					size={20}
					className={`transition-transform flex-shrink-0 ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && (
				<div
					className='absolute left-0 right-0 top-full mt-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-2xl max-h-60 overflow-y-hidden z-[100]'
					style={{ minWidth: "100%" }}
				>
					<div className='p-2 sticky top-0 bg-[var(--color-surface)] z-10 border-b border-[var(--color-border)]'>
						<input
							type='text'
							placeholder='Tìm kiếm...'
							className='w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>
					<ul className='max-h-48 overflow-y-auto'>
						{loading ? (
							<li className='p-3 text-center text-[var(--color-text-secondary)] text-sm'>
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
												? "opacity-40 cursor-not-allowed text-[var(--color-text-secondary)]"
												: "hover:bg-[var(--color-primary)] hover:text-white cursor-pointer"
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
											<span className='ml-auto text-xs text-[var(--color-danger)]'>
												Đã chọn
											</span>
										)}
									</li>
								);
							})
						) : (
							<li className='p-2 text-[var(--color-text-secondary)] text-sm'>
								Không tìm thấy
							</li>
						)}
					</ul>
				</div>
			)}

			{error && (
				<div className='mt-1 flex items-center gap-1 text-[var(--color-danger)] text-xs'>
					<AlertCircle size={14} />
					<span>{error}</span>
				</div>
			)}
		</div>
	);
};

// === BuildModal ===
const BuildModal = ({ isOpen, onClose, onConfirm, initialData = null }) => {
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
	const [loadingRelics, setLoadingRelics] = useState(true);
	const [loadingPowers, setLoadingPowers] = useState(true);
	const [loadingRunes, setLoadingRunes] = useState(true);

	// === Load API ===
	useEffect(() => {
		if (!isOpen) return;
		const fetchData = async () => {
			const baseURL = import.meta.env.VITE_API_URL;
			try {
				const [relicRes, powerRes, runeRes] = await Promise.all([
					fetch(`${baseURL}/api/relics`),
					fetch(`${baseURL}/api/generalPowers`),
					fetch(`${baseURL}/api/runes`),
				]);
				const relicData = await relicRes.json();
				const powerData = await powerRes.json();
				const runeData = await runeRes.json();

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

				setLoadingRelics(false);
				setLoadingPowers(false);
				setLoadingRunes(false);
			} catch (err) {
				console.error("Lỗi tải dữ liệu:", err);
				setLoadingRelics(false);
				setLoadingPowers(false);
				setLoadingRunes(false);
			}
		};
		fetchData();
	}, [isOpen]);

	const championOptions = useMemo(
		() =>
			championsData.map(c => ({
				name: c.name,
				icon: c.assets?.[0]?.M?.avatar?.S,
				regions: c.regions,
			})),
		[]
	);

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
			{/* Main Form Modal */}
			<Modal
				isOpen={isOpen && !showConfirmClose}
				onClose={handleCloseAttempt}
				title={isEditMode ? "Chỉnh sửa Build" : "Tạo Build Mới"}
				maxWidth='max-w-3xl'
			>
				<form onSubmit={handleSubmit} className='space-y-5'>
					{/* Champion */}
					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-1'>
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
							}}
							placeholder='Chọn hoặc tìm kiếm tướng...'
						/>
					</div>

					<fieldset disabled={!isChampionSelected} className='space-y-5'>
						{/* Star */}
						<div>
							<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
								Xếp hạng sao:
							</label>
							<div className='flex items-center gap-1'>
								{[1, 2, 3, 4, 5, 6, 7].map(s => (
									<Star
										key={s}
										size={28}
										className={`cursor-pointer transition-all ${
											formData.star >= s
												? "text-[var(--color-warning)]"
												: "text-[var(--color-border)] hover:text-[var(--color-text-secondary)]"
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

						{/* Artifacts */}
						<div>
							<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
								Cổ vật (Bắt buộc ít nhất 1):
							</label>
							<div className='grid grid-cols-3 gap-3'>
								{formData.artifacts.map((_, index) => {
									const otherValues = formData.artifacts.filter(
										(_, i) => i !== index
									);
									return (
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
											selectedValues={otherValues}
										/>
									);
								})}
							</div>
						</div>

						{/* Rune */}
						{isHoaLinhChampion && (
							<div>
								<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
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

						{/* Powers */}
						<div>
							<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
								Sức mạnh:
							</label>
							<div className='grid grid-cols-3 gap-3'>
								{formData.powers.map((_, index) => {
									const otherValues = formData.powers.filter(
										(_, i) => i !== index
									);
									return (
										<SearchableDropdown
											key={`power-${index}`}
											options={powers}
											selectedValue={formData.powers[index]}
											onChange={v => handlePowerChange(v, index)}
											placeholder={`Sức mạnh ${index + 1}`}
											loading={loadingPowers}
											error={powerErrors[index]}
											allowDuplicate={false}
											selectedValues={otherValues}
										/>
									);
								})}
							</div>
						</div>

						{/* Description */}
						<div>
							<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
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
								className='w-full bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-md h-28 p-3 border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] resize-none'
							/>
						</div>

						{/* Display */}
						<div>
							<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
								Trạng thái hiển thị:
							</label>
							<button
								type='button'
								onClick={() => {
									setFormData(prev => ({ ...prev, display: !prev.display }));
									markChange();
								}}
								className='flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-primary)] hover:text-white transition-all text-sm font-medium'
							>
								{formData.display ? <Eye size={18} /> : <EyeOff size={18} />}
								{formData.display ? "Công khai" : "Riêng tư"}
							</button>
						</div>
					</fieldset>

					<button
						type='submit'
						disabled={submitting || !isChampionSelected}
						className='w-full mt-6 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-3 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all'
					>
						{submitting
							? "Đang xử lý..."
							: isEditMode
							? "Cập nhật Build"
							: "Tạo Build"}
					</button>
				</form>
			</Modal>

			{/* Confirm Close Modal – Tích hợp trực tiếp, dùng Modal chung */}
			<Modal
				isOpen={showConfirmClose}
				onClose={handleCancelClose}
				title='Xác nhận đóng'
				maxWidth='max-w-sm'
			>
				<div className='flex items-center gap-2 mb-3'>
					<AlertCircle className='text-[var(--color-warning)]' size={20} />
					<p className='text-sm text-[var(--color-text-secondary)]'>
						Bạn có thay đổi chưa lưu. Đóng sẽ mất dữ liệu.
					</p>
				</div>
				<div className='flex gap-3 justify-end mt-4'>
					<button
						onClick={handleCancelClose}
						className='px-4 py-2 text-sm font-medium text-[var(--color-text-secondary)] bg-[var(--color-background)] border border-[var(--color-border)] rounded hover:bg-[var(--color-surface)] transition'
					>
						Hủy
					</button>
					<button
						onClick={handleConfirmClose}
						className='px-4 py-2 text-sm font-medium text-white bg-[var(--color-danger)] rounded hover:bg-red-700 transition'
					>
						Đóng không lưu
					</button>
				</div>
			</Modal>
		</>
	);
};

export default BuildModal;
