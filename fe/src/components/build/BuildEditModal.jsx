import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import relicsData from "../../assets/data/relics-vi_vn.json";
import powersData from "../../assets/data/general_powers.json";
import runesData from "../../assets/data/runes-vi_vn.json";
import { Star, Eye, EyeOff, ChevronDown, X, Loader2 } from "lucide-react";

// --- Searchable Dropdown Component ---
const SearchableDropdown = ({
	options,
	selectedValue,
	onChange,
	placeholder,
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef(null);

	const selectedOption = useMemo(
		() => options.find(option => option.name === selectedValue),
		[options, selectedValue]
	);

	const filteredOptions = useMemo(
		() =>
			options.filter(option =>
				option.name.toLowerCase().includes(searchTerm.toLowerCase())
			),
		[options, searchTerm]
	);

	useEffect(() => {
		const handleClickOutside = event => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = value => {
		onChange(value);
		setIsOpen(false);
		setSearchTerm("");
	};

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				type='button'
				onClick={() => !disabled && setIsOpen(!isOpen)}
				className={`w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md p-2 flex justify-between items-center text-left ${
					disabled ? "opacity-50 cursor-not-allowed" : ""
				}`}
				disabled={disabled}
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
						{selectedValue || placeholder}
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
				<div className='absolute z-20 top-full mt-1 w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-lg max-h-60 overflow-y-auto'>
					<div className='p-2 sticky top-0 bg-[var(--color-surface)]'>
						<input
							type='text'
							placeholder='Tìm kiếm...'
							className='w-full bg-[var(--color-background)] border border-[var(--color-border)] rounded-md p-2 text-[var(--color-text-primary)]'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>
					<ul className='overflow-y-auto'>
						{filteredOptions.length > 0 ? (
							filteredOptions.map(opt => (
								<li
									key={opt.name}
									onClick={() => handleSelect(opt.name)}
									className='p-2 hover:bg-[var(--color-primary)] hover:text-white cursor-pointer flex items-center'
								>
									{opt.icon && (
										<img
											src={opt.icon}
											alt={opt.name}
											className='w-6 h-6 mr-2 rounded-full object-cover flex-shrink-0'
										/>
									)}
									<span className='truncate'>{opt.name}</span>
								</li>
							))
						) : (
							<li className='p-2 text-[var(--color-text-secondary)]'>
								Không tìm thấy
							</li>
						)}
					</ul>
				</div>
			)}
		</div>
	);
};

// --- Build Edit Modal Component ---
const BuildEditModal = ({ build, isOpen, onClose, onConfirm }) => {
	const { token } = useAuth();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [formData, setFormData] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	useEffect(() => {
		if (build) {
			const artifactsLen = build.artifacts?.length || 0;
			const powersLen = build.powers?.length || 0;
			const runeLen = build.rune?.length || 0;

			setFormData({
				description: build.description || "",
				star: build.star || 3,
				display: build.display !== undefined ? build.display : true,
				artifacts: [
					...(build.artifacts || []).slice(0, 3),
					...Array(Math.max(0, 3 - artifactsLen)).fill(null),
				],
				powers: [
					...(build.powers || []).slice(0, 6),
					...Array(Math.max(0, 6 - powersLen)).fill(null),
				],
				rune: [
					...(build.rune || []).slice(0, 1),
					...Array(Math.max(0, 1 - runeLen)).fill(null),
				],
			});
			setMessage("");
			setSubmitting(false);
		}
	}, [build]);

	const relicOptions = useMemo(
		() => relicsData.map(r => ({ name: r.name, icon: r.assetAbsolutePath })),
		[]
	);
	const powerOptions = useMemo(
		() => powersData.map(p => ({ name: p.name, icon: p.assetAbsolutePath })),
		[]
	);
	const runeOptions = useMemo(
		() => runesData.map(r => ({ name: r.name, icon: r.assetAbsolutePath })),
		[]
	);

	const handleDropdownChange = (field, value, index) => {
		const newValues = [...formData[field]];
		newValues[index] = value;
		setFormData(prev => ({ ...prev, [field]: newValues }));
	};

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleStarChange = newRating => {
		setFormData(prev => ({ ...prev, star: newRating }));
	};

	const toggleDisplay = () => {
		setFormData(prev => ({ ...prev, display: !prev.display }));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setMessage("");

		if (formData.artifacts.filter(Boolean).length === 0) {
			setMessage("Vui lòng chọn ít nhất một Cổ vật.");
			return;
		}

		setSubmitting(true);
		const payload = {
			description: formData.description,
			star: formData.star,
			display: formData.display,
			artifacts: formData.artifacts.filter(Boolean),
			powers: formData.powers.filter(Boolean),
			rune: formData.rune.filter(Boolean),
		};

		try {
			const response = await fetch(`${apiUrl}/api/builds/${build.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			const result = await response.json();
			if (response.ok) {
				setMessage("Cập nhật build thành công!");
				setTimeout(() => {
					onConfirm(result.build);
					onClose();
				}, 1000);
			} else {
				setMessage(`Lỗi: ${result.error || "Không thể cập nhật build."}`);
				setSubmitting(false);
			}
		} catch (error) {
			console.error("Lỗi cập nhật build:", error);
			setMessage("Lỗi kết nối đến server.");
			setSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 backdrop-blur-sm flex justify-center items-center z-50'>
			<div className='bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-2xl font-bold text-[var(--color-primary)]'>
						Chỉnh sửa Build cho {build?.championName}
					</h2>
					<button
						onClick={onClose}
						className='text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
					>
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
							Xếp hạng sao:
						</label>
						<div className='flex items-center'>
							{[1, 2, 3, 4, 5, 6, 7].map(s => (
								<Star
									key={s}
									size={30}
									className={`cursor-pointer transition-colors ${
										formData.star >= s
											? "text-[var(--color-warning)]"
											: "text-[var(--color-border)] hover:text-[var(--color-text-secondary)]"
									}`}
									fill={formData.star >= s ? "currentColor" : "none"}
									onClick={() => handleStarChange(s)}
								/>
							))}
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)]'>
							Cổ vật (Bắt buộc ít nhất 1):
						</label>
						<div className='grid grid-cols-3 gap-2 mt-1'>
							{formData.artifacts?.map((_, index) => (
								<SearchableDropdown
									key={`artifact-${index}`}
									options={relicOptions}
									selectedValue={formData.artifacts[index]}
									onChange={value =>
										handleDropdownChange("artifacts", value, index)
									}
									placeholder={`Cổ vật ${index + 1}`}
								/>
							))}
						</div>
					</div>

					{build?.regions?.includes("Hoa Linh Lục Địa") && (
						<div>
							<label className='block text-sm font-medium text-[var(--color-text-secondary)]'>
								Ngọc bổ trợ (Chỉ dành cho tướng Hoa Linh):
							</label>
							<div className='mt-1'>
								<SearchableDropdown
									options={runeOptions}
									selectedValue={formData.rune?.[0]}
									onChange={value => handleDropdownChange("rune", value, 0)}
									placeholder={`Ngọc bổ trợ`}
								/>
							</div>
						</div>
					)}

					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)]'>
							Sức mạnh:
						</label>
						<div className='grid grid-cols-3 gap-2 mt-1'>
							{formData.powers?.map((_, index) => (
								<SearchableDropdown
									key={`power-${index}`}
									options={powerOptions}
									selectedValue={formData.powers[index]}
									onChange={value =>
										handleDropdownChange("powers", value, index)
									}
									placeholder={`Sức mạnh ${index + 1}`}
								/>
							))}
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)]'>
							Ghi chú:
						</label>
						<textarea
							name='description'
							value={formData.description || ""}
							onChange={e => handleInputChange("description", e.target.value)}
							className='mt-1 block w-full bg-[var(--color-background)] text-[var(--color-text-primary)] rounded-md h-24 p-2 border border-[var(--color-border)]'
							placeholder='Mô tả lối chơi, mẹo...'
						/>
					</div>

					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-1'>
							Trạng thái hiển thị:
						</label>
						<button
							type='button'
							onClick={toggleDisplay}
							className='flex items-center gap-2 px-3 py-2 rounded bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-border)] transition-colors text-sm'
						>
							{formData.display ? <Eye size={18} /> : <EyeOff size={18} />}
							{formData.display ? "Công khai" : "Riêng tư"}
						</button>
					</div>

					<div className='pt-4'>
						<button
							type='submit'
							disabled={submitting}
							className='w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors flex items-center justify-center'
						>
							{submitting ? (
								<>
									<Loader2 className='animate-spin mr-2' size={20} />
									Đang cập nhật...
								</>
							) : (
								"Lưu thay đổi"
							)}
						</button>
					</div>

					{message && (
						<p
							className={`mt-4 text-center ${
								message.startsWith("Lỗi")
									? "text-[var(--color-danger)]"
									: "text-green-500"
							}`}
						>
							{message}
						</p>
					)}
				</form>
			</div>
		</div>
	);
};

export default BuildEditModal;
