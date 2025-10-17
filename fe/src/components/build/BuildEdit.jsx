import React, { useState, useContext } from "react";
import championsData from "../../assets/data/champions.json";
import relicsData from "../../assets/data/relics-vi_vn.json";
import powersData from "../../assets/data/powers-vi_vn.json";
import runesData from "../../assets/data/runes-vi_vn.json";
import { AuthContext } from "../../context/AuthContext";
import { Star, Eye, EyeOff, X } from "lucide-react";

const BuildEdit = ({ build, onConfirm, onClose }) => {
	const { token } = useContext(AuthContext);

	const [formData, setFormData] = useState({
		championName: build.championName || "",
		description: build.description || "",
		star: build.star || 0,
		display: build.display !== undefined ? build.display : true,
		artifacts: build.artifacts
			? [...build.artifacts, ...Array(3 - build.artifacts.length).fill(null)]
			: [null, null, null],
		powers: build.powers
			? [...build.powers, ...Array(6 - build.powers.length).fill(null)]
			: Array(6).fill(null),
		rune: build.rune
			? [...build.rune, ...Array(2 - build.rune.length).fill(null)]
			: [null, null],
	});

	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");

	const handleInputChange = (field, value) => {
		setFormData(prev => ({ ...prev, [field]: value }));
	};

	const handleDropdownChange = (type, value, index) => {
		const newValues = [...formData[type]];
		newValues[index] = value;
		setFormData(prev => ({ ...prev, [type]: newValues }));
	};

	const handleConfirm = async e => {
		e.preventDefault();
		if (formData.artifacts.filter(Boolean).length === 0) {
			setMessage("Phải có ít nhất một cổ vật.");
			return;
		}
		setSubmitting(true);
		setMessage("");

		const updatedData = {
			description: formData.description,
			star: formData.star,
			display: formData.display,
			artifacts: formData.artifacts.filter(Boolean),
			powers: formData.powers.filter(Boolean),
			rune: formData.rune.filter(Boolean),
		};

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/builds/${build.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(updatedData),
				}
			);

			const result = await response.json();
			if (response.ok) {
				setMessage("Cập nhật build thành công!");
				setTimeout(() => {
					onConfirm(result.build);
				}, 1000);
			} else {
				setMessage(`Lỗi: ${result.error || "Không thể cập nhật"}`);
			}
		} catch (error) {
			setMessage("Lỗi kết nối đến server.");
		} finally {
			setSubmitting(false);
		}
	};

	const handleStarChange = newRating => {
		setFormData(prev => ({ ...prev, star: newRating }));
	};

	const handleToggleDisplay = () => {
		setFormData(prev => ({ ...prev, display: !prev.display }));
	};

	const renderDropdown = (type, options, placeholder, index) => {
		const selectedValue = formData[type][index];
		return (
			<div className='relative'>
				<select
					value={selectedValue || ""}
					onChange={e => handleDropdownChange(type, e.target.value, index)}
					className='w-full bg-gray-700 border border-gray-600 rounded-md p-2 appearance-none'
				>
					<option value=''>{placeholder}</option>
					{options.map((opt, optIndex) => (
						<option key={`${opt.name}-${optIndex}`} value={opt.name}>
							{opt.name}
						</option>
					))}
				</select>
			</div>
		);
	};

	return (
		<div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
			<div className='bg-gray-800 text-white rounded-lg p-6 w-full max-w-3xl max-h-[95vh] overflow-y-auto'>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-2xl font-bold text-cyan-400'>Chỉnh Sửa Build</h2>
					<button onClick={onClose} className='text-gray-400 hover:text-white'>
						<X size={24} />
					</button>
				</div>

				<form onSubmit={handleConfirm}>
					{/* Champion Name (Read-only) */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-gray-300 mb-1'>
							Tướng:
						</label>
						<input
							type='text'
							readOnly
							value={formData.championName}
							className='w-full bg-gray-700 p-2 rounded-md cursor-not-allowed'
						/>
					</div>

					{/* Star Rating */}
					<div className='mb-4'>
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

					{/* Artifacts, Runes, Powers... */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-gray-300'>
							Cổ vật (Bắt buộc ít nhất 1):
						</label>
						<div className='grid grid-cols-3 gap-2 mt-1'>
							{formData.artifacts.map((_, index) => (
								<div key={`artifact-${index}`}>
									{renderDropdown(
										"artifacts",
										relicsData,
										`Cổ vật ${index + 1}`,
										index
									)}
								</div>
							))}
						</div>
					</div>
					<div className='mb-4'>
						<label className='block text-sm font-medium text-gray-300'>
							Ngọc bổ trợ:
						</label>
						<div className='grid grid-cols-2 gap-2 mt-1'>
							{formData.rune.map((_, index) => (
								<div key={`rune-${index}`}>
									{renderDropdown(
										"rune",
										runesData,
										`Ngọc ${index + 1}`,
										index
									)}
								</div>
							))}
						</div>
					</div>
					<div className='mb-4'>
						<label className='block text-sm font-medium text-gray-300'>
							Sức mạnh:
						</label>
						<div className='grid grid-cols-3 gap-2 mt-1'>
							{formData.powers.map((_, index) => (
								<div key={`power-${index}`}>
									{renderDropdown(
										"powers",
										powersData,
										`Sức mạnh ${index + 1}`,
										index
									)}
								</div>
							))}
						</div>
					</div>

					{/* Display Toggle */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Trạng thái hiển thị:
						</label>
						<button
							type='button'
							onClick={handleToggleDisplay}
							className='flex items-center gap-2 px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors'
						>
							{formData.display ? <Eye size={20} /> : <EyeOff size={20} />}
							{formData.display ? "Công khai" : "Riêng tư"}
						</button>
					</div>

					{/* Description */}
					<div className='mb-4'>
						<label className='block text-sm font-medium text-gray-300'>
							Ghi chú:
						</label>
						<textarea
							name='description'
							value={formData.description}
							onChange={e => handleInputChange("description", e.target.value)}
							className='mt-1 block w-full bg-gray-700 text-white rounded-md h-24 p-2 border border-gray-600'
						></textarea>
					</div>

					<div className='flex justify-end gap-4 mt-6'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 rounded bg-gray-600 hover:bg-gray-700 transition-colors'
						>
							Hủy
						</button>
						<button
							type='submit'
							disabled={submitting}
							className='px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-500 transition-colors'
						>
							{submitting ? "Đang lưu..." : "Lưu thay đổi"}
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

export default BuildEdit;
