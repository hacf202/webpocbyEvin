import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import championsData from "../../assets/data/champions.json";
import relicsData from "../../assets/data/relics-vi_vn.json";
import powersData from "../../assets/data/powers-vi_vn.json";
import runesData from "../../assets/data/runes-vi_vn.json";
import { AuthContext } from "../../context/AuthContext";
import { Star, X, ChevronDown } from "lucide-react";

// --- Searchable Dropdown Component with Icons ---
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
				className={`w-full bg-gray-700 border border-gray-600 rounded-md p-2 flex justify-between items-center text-left ${
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
							selectedValue ? "text-white" : "text-gray-400"
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
				<div className='absolute z-20 top-full mt-1 w-full bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto'>
					<div className='p-2 sticky top-0 bg-gray-800'>
						<input
							type='text'
							placeholder='Tìm kiếm...'
							className='w-full bg-gray-900 border border-gray-700 rounded-md p-2 text-white'
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
									className='p-2 hover:bg-cyan-600 cursor-pointer flex items-center'
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
							<li className='p-2 text-gray-500'>Không tìm thấy</li>
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
		rune: [null], // Only one rune
		star: 3,
		description: "",
	});
	const [selectedChampion, setSelectedChampion] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	// Memoize options to prevent re-computation on every render
	const championOptions = useMemo(
		() =>
			championsData.map(c => ({
				name: c.name,
				icon: c.assets?.[0]?.M?.avatar?.S,
				regions: c.regions,
			})),
		[]
	);
	const relicOptions = useMemo(
		() => relicsData.map(r => ({ name: r.name, icon: r.assetAbsolutePath })),
		[]
	);
	const runeOptions = useMemo(
		() => runesData.map(r => ({ name: r.name, icon: r.assetAbsolutePath })),
		[]
	);
	const powerOptions = useMemo(
		() => powersData.map(p => ({ name: p.name, icon: p.assetAbsolutePath })),
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
			// Reset rune if the new champion is not from Hoa Linh
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
		<div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
			<div className='bg-gray-800 text-white rounded-lg p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-2xl font-bold text-cyan-400'>Tạo Build Mới</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						<X size={24} />
					</button>
				</div>
				<form onSubmit={handleSubmit}>
					<div className='mb-4'>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
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
							<label className='block text-sm font-medium text-gray-300 mb-2'>
								Xếp hạng sao:
							</label>
							<div className='flex items-center'>
								{[1, 2, 3, 4, 5].map(s => (
									<Star
										key={s}
										size={30}
										className={`cursor-pointer transition-colors ${
											formData.star >= s
												? "text-yellow-400"
												: "text-gray-600 hover:text-gray-500"
										}`}
										fill={formData.star >= s ? "currentColor" : "none"}
										onClick={() => handleStarChange(s)}
									/>
								))}
							</div>
						</div>

						<div>
							<label className='block text-sm font-medium text-gray-300'>
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
								<label className='block text-sm font-medium text-gray-300'>
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
							<label className='block text-sm font-medium text-gray-300'>
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
							<label className='block text-sm font-medium text-gray-300'>
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
								className='mt-1 block w-full bg-gray-700 text-white rounded-md h-24 p-2 border border-gray-600'
							></textarea>
						</div>
					</fieldset>

					<div className='mt-6'>
						<button
							type='submit'
							disabled={submitting || !isChampionSelected}
							className='w-full bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded disabled:bg-gray-500 transition-colors'
						>
							{submitting ? "Đang tạo..." : "Tạo Build"}
						</button>
					</div>
					{message && (
						<p
							className={`mt-4 text-center ${
								message.startsWith("Lỗi") ? "text-red-500" : "text-green-500"
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

export default BuildCreation;
