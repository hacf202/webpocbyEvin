import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import championsData from "../../assets/data/champions.json";
import relicsData from "../../assets/data/relics-vi_vn.json";
import powersData from "../../assets/data/powers-vi_vn.json";
import runesData from "../../assets/data/runes-vi_vn.json";
import { AuthContext } from "../../context/AuthContext";
import { Star, Eye, EyeOff, ChevronDown } from "lucide-react";
import Modal from "../common/Modal"; // Giả sử đường dẫn là ../common/Modal.jsx

// --- Searchable Dropdown Component (Không thay đổi) ---
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

// --- Main Build Creation Component ---
const BuildCreation = ({ onConfirm, onClose }) => {
	const { token } = useContext(AuthContext);

	const [formData, setFormData] = useState({
		championName: "",
		artifacts: [null, null, null],
		powers: [null, null, null, null, null, null],
		rune: [null],
		star: 3,
		description: "",
		display: false,
	});
	const [selectedChampion, setSelectedChampion] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	// Memoize options
	const championOptions = useMemo(
		() =>
			championsData.map(c => ({
				name: c.name,
				icon: c.assets?.[0]?.M?.avatar?.S,
				regions: c.regions,
			})),
		[]
	);

	// Lọc bỏ các Cổ vật trùng tên
	const relicOptions = useMemo(
		() =>
			relicsData
				.filter(
					(relic, index, self) =>
						index === self.findIndex(r => r.name === relic.name)
				)
				.map(r => ({ name: r.name, icon: r.assetAbsolutePath })),
		[]
	);

	// Lọc bỏ các Ngọc bổ trợ trùng tên
	const runeOptions = useMemo(
		() =>
			runesData
				.filter(
					(rune, index, self) =>
						index === self.findIndex(r => r.name === rune.name)
				)
				.map(r => ({ name: r.name, icon: r.assetAbsolutePath })),
		[]
	);

	// Lọc bỏ các Sức mạnh trùng tên (đây là nguyên nhân chính của lỗi)
	const powerOptions = useMemo(
		() =>
			powersData
				.filter(
					(power, index, self) =>
						index === self.findIndex(p => p.name === power.name)
				)
				.map(p => ({ name: p.name, icon: p.assetAbsolutePath })),
		[]
	);

	const isChampionSelected = !!formData.championName;
	const isHoaLinhChampion =
		selectedChampion?.regions?.includes("Hoa Linh Lục Địa");

	const handleChampionChange = championName => {
		const champion = championOptions.find(c => c.name === championName) || null;
		setSelectedChampion(champion);
		setFormData(prev => ({
			...prev,
			championName: championName,
			rune: champion?.regions?.includes("Hoa Linh Lục Địa")
				? prev.rune
				: [null],
		}));
	};

	const handleStarChange = newRating => {
		setFormData(prev => ({ ...prev, star: newRating }));
	};

	const handleDropdownChange = (type, value, index) => {
		const newValues = [...formData[type]];
		newValues[index] = value;
		setFormData(prev => ({ ...prev, [type]: newValues }));
	};

	const toggleDisplay = () => {
		setFormData(prev => ({ ...prev, display: !prev.display }));
	};

	const handleSubmit = async e => {
		e.preventDefault();
		setMessage("");

		if (
			!isChampionSelected ||
			formData.artifacts.filter(Boolean).length === 0
		) {
			setMessage("Vui lòng chọn Tướng và ít nhất một Cổ vật.");
			return;
		}

		setSubmitting(true);

		const buildData = {
			championName: formData.championName,
			description: formData.description,
			star: formData.star,
			display: formData.display,
			artifacts: formData.artifacts.filter(Boolean),
			powers: formData.powers.filter(Boolean),
			rune: formData.rune.filter(Boolean),
			like: 0,
			favorite: [],
		};

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/builds`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(buildData),
				}
			);
			const result = await response.json();
			if (response.ok) {
				setMessage("Build đã được tạo thành công!");
				setTimeout(() => onConfirm(result.build), 1000);
			} else {
				setMessage(`Lỗi: ${result.error || "Không thể tạo build"}`);
			}
		} catch (error) {
			setMessage("Lỗi kết nối đến server.");
			console.error("Error creating build:", error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={true}
			onClose={onClose}
			title='Tạo Build Mới'
			maxWidth='max-w-3xl'
		>
			<form onSubmit={handleSubmit}>
				<div className='mb-4'>
					<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-1'>
						Tướng (Bắt buộc):
					</label>
					<SearchableDropdown
						options={championOptions}
						selectedValue={formData.championName}
						onChange={handleChampionChange}
						placeholder='Chọn hoặc tìm kiếm tướng...'
					/>
				</div>

				<fieldset disabled={!isChampionSelected} className='space-y-4'>
					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)] mb-2'>
							Xếp hạng sao:
						</label>
						<div className='flex items-center'>
							{[1, 2, 3, 4, 5].map(s => (
								<Star
									key={s}
									size={30}
									className={`cursor-pointer transition-colors ${
										formData.star >= s
											? "text-[var(--color-warning)]"
											: "text-[var(--color-border)] hover:text-gray-500"
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
							{formData.artifacts.map((_, index) => (
								<div key={`artifact-${index}`}>
									<SearchableDropdown
										options={relicOptions}
										selectedValue={formData.artifacts[index]}
										onChange={value =>
											handleDropdownChange("artifacts", value, index)
										}
										placeholder={`Cổ vật ${index + 1}`}
									/>
								</div>
							))}
						</div>
					</div>

					{isHoaLinhChampion && (
						<div>
							<label className='block text-sm font-medium text-[var(--color-text-secondary)]'>
								Ngọc bổ trợ (Chỉ dành cho tướng Hoa Linh):
							</label>
							<div className='mt-1'>
								<SearchableDropdown
									options={runeOptions}
									selectedValue={formData.rune[0]}
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
							{formData.powers.map((_, index) => (
								<div key={`power-${index}`}>
									<SearchableDropdown
										options={powerOptions}
										selectedValue={formData.powers[index]}
										onChange={value =>
											handleDropdownChange("powers", value, index)
										}
										placeholder={`Sức mạnh ${index + 1}`}
									/>
								</div>
							))}
						</div>
					</div>

					<div>
						<label className='block text-sm font-medium text-[var(--color-text-secondary)]'>
							Ghi chú:
						</label>
						<textarea
							value={formData.description}
							onChange={e =>
								setFormData(prev => ({
									...prev,
									description: e.target.value,
								}))
							}
							placeholder='Mô tả lối chơi, mẹo...'
							className='mt-1 block w-full bg-[var(--color-background)] text-[var(--color-text-primary)] rounded-md h-24 p-2 border border-[var(--color-border)]'
						></textarea>
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
				</fieldset>

				<div className='mt-6'>
					<button
						type='submit'
						disabled={submitting || !isChampionSelected}
						className='w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold py-2 px-4 rounded disabled:opacity-50 transition-colors'
					>
						{submitting ? "Đang tạo..." : "Tạo Build"}
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
		</Modal>
	);
};

export default BuildCreation;
