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
import { v4 as uuidv4 } from "uuid";
import { AuthContext } from "../../context/AuthContext";

const BuildCreation = ({ onConfirm }) => {
	const { user, token } = useContext(AuthContext);
	const [champions, setChampions] = useState([]);
	const [relics, setRelics] = useState([]);
	const [powers, setPowers] = useState([]);
	const [formData, setFormData] = useState({
		championName: "",
		championImage: "",
		relics: [null, null, null],
		powers: [null, null, null, null, null, null],
		notes: "",
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
			setMessage("❌ Vui lòng đăng nhập để tạo build");
			isSubmittingRef.current = false;
			setSubmitting(false);
			return;
		}

		const payload = {
			id: uuidv4(),
			championName: formData.championName,
			description: formData.notes,
			artifacts: formData.relics.filter(Boolean),
			powers: formData.powers.filter(Boolean),
		};

		// console.log("Token before sending:", token);
		// console.log("Payload sent:", payload);

		try {
			setLoading(true);
			setMessage("");
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/builds`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				}
			);
			const data = await response.json();
			if (response.ok) {
				setMessage("✅ Build đã được lưu thành công!");
				if (onConfirm) onConfirm(data.build);
			} else {
				setMessage("❌ Lỗi: " + (data.error || "Không thể lưu build"));
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
			<div className='relative w-full'>
				<button
					type='button'
					onClick={() => handleToggleDropdown(dropdownId)}
					className='p-1 rounded-md text-black bg-white w-full text-left flex items-center justify-between shadow-sm border border-gray-300 hover:bg-gray-50 transition duration-150'
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
							className='p-1 m-2 rounded-md text-white w-[calc(100%-16px)] text-sm'
						/>
						<ul className='py-1'>
							{filteredOptions(options).map((option, idx) => (
								<li
									key={idx}
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
		<div className='build-creation bg-gray-900 p-2 rounded-lg shadow-lg w-full max-w-[1400px]'>
			<h1 className='text-md font-bold text-white mb-1'>Create a Build</h1>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Champion:
				</label>
				{renderDropdown(
					"championName",
					champions.map(champion => ({
						name: champion.name,
						image: champion.assets[0].M.avatar.S,
					})),
					"Select a Champion"
				)}
			</div>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Relics:
				</label>
				<div className='grid md:grid-cols-3 gap-2'>
					{formData.relics.map((artifact, index) => (
						<div key={`relic-${index}`}>
							{renderDropdown(
								"relics",
								relics.map(relic => ({
									name: relic.name,
									image: relic.assetAbsolutePath,
								})),
								`Relic ${index + 1}`,
								index
							)}
						</div>
					))}
				</div>
			</div>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Powers:
				</label>
				<div className='grid md:grid-cols-3 gap-2 grid-cols-2'>
					{formData.powers.map((power, index) => (
						<div key={`power-${index}`}>
							{renderDropdown(
								"powers",
								powers.map(p => ({
									name: p.name,
									image: p.assetAbsolutePath,
								})),
								`Power ${index + 1}`,
								index
							)}
						</div>
					))}
				</div>
			</div>
			<div className='mb-4'>
				<label className='block text-sm font-medium text-gray-300'>
					Gameplay Notes:
				</label>
				<textarea
					name='notes'
					value={formData.notes}
					onChange={e => handleInputChange("notes", e.target.value)}
					placeholder='Enter gameplay notes...'
					className='mt-1 block w-full bg-gray-800 text-white rounded-md h-30'
				></textarea>
			</div>
			<div className='mt-4'>
				<button
					onClick={handleConfirm}
					disabled={loading || submitting}
					className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50'
				>
					{loading ? "Saving..." : "Confirm Build"}
				</button>
				{message && <p className='mt-2 text-white'>{message}</p>}
			</div>
		</div>
	);
};

export default BuildCreation;
