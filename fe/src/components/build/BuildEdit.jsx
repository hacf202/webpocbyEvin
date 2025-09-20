import React, {
	useState,
	useEffect,
	useMemo,
	useCallback,
	useRef,
	useContext,
} from "react";
import championsData from "../../assets/data/champions.json";
import relicsData from "../../assets/data/relics-vi_vn.json";
import powersData from "../../assets/data/powers-vi_vn.json";
import { AuthContext } from "../../context/AuthContext";

const BuildEdit = ({ build, onConfirm, onClose }) => {
	const { user, token } = useContext(AuthContext);
	const [champions, setChampions] = useState([]);
	const [relics, setRelics] = useState([]);
	const [powers, setPowers] = useState([]);
	const [formData, setFormData] = useState({
		championName: build.championName || "",
		championImage: "",
		relics: build.artifacts
			? [
					...build.artifacts,
					...Array(3 - (build.artifacts.length || 0)).fill(null),
			  ]
			: [null, null, null],
		powers: build.powers
			? [...build.powers, ...Array(6 - (build.powers.length || 0)).fill(null)]
			: [null, null, null, null, null, null],
		notes: build.description || "",
	});
	const [searchTerm, setSearchTerm] = useState("");
	const [openDropdownId, setOpenDropdownId] = useState(null);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [message, setMessage] = useState("");
	const isSubmittingRef = useRef(false);

	useEffect(() => {
		setChampions(championsData);
		setRelics(relicsData);
		setPowers(powersData);
	}, []);

	const handleInputChange = useCallback(
		(name, value, index = null) => {
			if ((name === "relics" || name === "powers") && index !== null) {
				const updatedArray = [...formData[name]];
				updatedArray[index] = value;
				setFormData({ ...formData, [name]: updatedArray });
			} else {
				setFormData({ ...formData, [name]: value });
			}
		},
		[formData]
	);

	const handleConfirm = async () => {
		if (isSubmittingRef.current) return;
		isSubmittingRef.current = true;
		setSubmitting(true);

		if (!token || !user) {
			setMessage("❌ Vui lòng đăng nhập để chỉnh sửa build");
			isSubmittingRef.current = false;
			setSubmitting(false);
			return;
		}

		// Kiểm tra bắt buộc chọn champion
		if (!formData.championName) {
			setMessage("❌ Vui lòng chọn một tướng");
			isSubmittingRef.current = false;
			setSubmitting(false);
			return;
		}

		// Kiểm tra ít nhất một relic được chọn
		const selectedRelics = formData.relics.filter(Boolean);
		if (selectedRelics.length === 0) {
			setMessage("❌ Vui lòng chọn ít nhất một cổ vật");
			isSubmittingRef.current = false;
			setSubmitting(false);
			return;
		}

		const payload = {
			id: build.id,
			championName: formData.championName,
			description: formData.notes || "",
			artifacts: selectedRelics,
			powers: formData.powers.filter(Boolean),
			creator_name: user.username,
		};

		try {
			setLoading(true);
			setMessage("");
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/builds/${build.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				}
			);
			const data = await response.json();
			if (response.ok) {
				setMessage("✅ Build đã được cập nhật thành công!");
				if (onConfirm) onConfirm({ ...data.build, id: build.id });
				onClose();
			} else {
				setMessage("❌ Lỗi: " + (data.error || "Không thể cập nhật build"));
			}
		} catch (error) {
			console.error("Fetch error:", error);
			setMessage("❌ Lỗi kết nối server");
		} finally {
			isSubmittingRef.current = false;
			setLoading(false);
			setSubmitting(false);
		}
	};

	const handleToggleDropdown = useCallback(dropdownId => {
		setOpenDropdownId(prev => (prev === dropdownId ? null : dropdownId));
	}, []);

	const filteredOptions = useMemo(() => {
		return options =>
			options.filter(option =>
				option.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
	}, [searchTerm]);

	const renderDropdown = (name, options, placeholder, index = null) => {
		const dropdownId = `${name}-${index !== null ? index : "single"}`;
		return (
			<div key={`${dropdownId}`} className='relative w-full'>
				<button
					type='button'
					onClick={() => handleToggleDropdown(dropdownId)}
					className='p-2 rounded-md text-black bg-white w-full text-left flex items-center justify-between shadow-sm border border-gray-300 hover:bg-gray-50 transition duration-150'
				>
					<span className='truncate flex-1'>
						{index !== null
							? formData[name][index] || placeholder
							: formData[name] || placeholder}
					</span>
					<svg
						className='w-4 h-4 text-gray-600'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth='2'
							d='M19 9l-7 7-7-7'
						/>
					</svg>
				</button>
				{openDropdownId === dropdownId && (
					<div className='absolute z-20 mt-1 w-full bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto overflow-x-hidden border border-gray-600'>
						<input
							type='text'
							placeholder='Search...'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							className='p-2 m-2 rounded-md text-white w-[calc(100%-16px)] text-sm'
						/>
						<ul className='py-1'>
							{filteredOptions(options).map((option, idx) => (
								<li
									key={option.id || `${dropdownId}-${option.name}-${idx}`} // Sử dụng id nếu có
									className='flex items-center px-3 py-2 text-white hover:bg-gray-700 cursor-pointer'
									onClick={() => {
										handleInputChange(name, option.name, index);
										handleToggleDropdown(dropdownId);
									}}
								>
									{option.image && (
										<img
											src={option.image}
											alt={option.name}
											className='w-6 h-6 mr-2 object-cover rounded'
										/>
									)}
									<span>{option.name}</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		);
	};

	return (
		<div className='build-creation bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-[1400px]'>
			<h1 className='text-2xl font-bold text-white mb-4'>Chỉnh Sửa Build</h1>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Tướng:
				</label>
				{renderDropdown(
					"championName",
					champions.map(champion => ({
						id: champion.id || champion.name, // Sử dụng id nếu có
						name: champion.name,
						image: champion.assets[0].M.avatar.S,
					})),
					"Chọn một tướng"
				)}
			</div>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Cổ Vật:
				</label>
				<div className='grid grid-cols-3 gap-2'>
					{formData.relics.map((artifact, index) =>
						renderDropdown(
							"relics",
							relics.map(relic => ({
								id: relic.id || relic.name, // Sử dụng id nếu có
								name: relic.name,
								image: relic.assetAbsolutePath,
							})),
							`Cổ vật ${index + 1}`,
							index
						)
					)}
				</div>
			</div>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Sức Mạnh:
				</label>
				<div className='grid grid-cols-3 gap-2'>
					{formData.powers.map((power, index) =>
						renderDropdown(
							"powers",
							powers.map(p => ({
								id: p.id || p.name, // Sử dụng id nếu có
								name: p.name,
								image: p.assetAbsolutePath,
							})),
							`Sức mạnh ${index + 1}`,
							index
						)
					)}
				</div>
			</div>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Ghi Chú Gameplay:
				</label>
				<textarea
					name='notes'
					value={formData.notes}
					onChange={e => handleInputChange("notes", e.target.value)}
					placeholder='Nhập ghi chú gameplay...'
					className='mt-1 block w-full bg-gray-800 text-white rounded-md h-30'
				></textarea>
			</div>
			<div className='mt-4'>
				<button
					onClick={handleConfirm}
					disabled={loading || submitting}
					className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
				>
					{loading ? "Đang lưu..." : "Cập Nhật Build"}
				</button>
				{message && <p className='mt-2 text-white'>{message}</p>}
			</div>
		</div>
	);
};

export default BuildEdit;
