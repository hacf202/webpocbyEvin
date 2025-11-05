import { memo, useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { Loader2, ChevronLeft } from "lucide-react";
import PageTitle from "../common/pageTitle";
import Button from "../common/button";
import SafeImage from "../common/SafeImage";

function PowerDetail() {
	const { powerCode } = useParams();
	const navigate = useNavigate(); // <-- Thêm useNavigate
	const [power, setPower] = useState(null);
	const [champions, setChampions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	// Tải dữ liệu từ API
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				setError(null);

				const decodedCode = decodeURIComponent(powerCode);

				const [powersRes, championsRes] = await Promise.all([
					fetch(`${apiUrl}/api/powers`),
					fetch(`${apiUrl}/api/champions`),
				]);

				if (!powersRes.ok || !championsRes.ok) {
					throw new Error("Không thể tải dữ liệu từ server.");
				}

				const powersData = await powersRes.json();
				const championsData = await championsRes.json();

				const foundPower = powersData.find(p => p.powerCode === decodedCode);

				if (!foundPower) {
					setError(`Không tìm thấy sức mạnh với mã: ${decodedCode}`);
					setPower(null);
				} else {
					setPower(foundPower);
				}

				setChampions(championsData);
			} catch (err) {
				console.error("Lỗi tải dữ liệu:", err);
				setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
			} finally {
				setLoading(false);
			}
		};

		if (powerCode) fetchData();
	}, [powerCode, apiUrl]);

	// Tính toán tướng tương thích
	const compatibleChampions = power
		? champions
				.filter(champion => {
					const powerStarsMatch = champion.powerStars?.some(
						p => p.S === power.name
					);
					const adventurePowersMatch = champion.adventurePowers?.some(
						p => p.S === power.name
					);
					return powerStarsMatch || adventurePowersMatch;
				})
				.map(champion => ({
					name: champion.name,
					image:
						champion.assets?.[0]?.M?.avatar?.S || "/images/placeholder.png",
				}))
		: [];

	// Loading state
	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[500px] p-6 text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg'>Đang tải thông tin sức mạnh...</p>
			</div>
		);
	}

	// Error state
	if (error || !power) {
		return (
			<div className='p-6 sm:p-8 text-center text-danger-text-dark'>
				<p className='text-xl font-semibold'>Không tìm thấy sức mạnh</p>
				<p className='mt-2 text-sm opacity-80'>
					{powerCode && `Mã: ${decodeURIComponent(powerCode)}`}
				</p>
				{error && <p className='mt-4 text-sm'>{error}</p>}
			</div>
		);
	}

	// Success state
	return (
		<div>
			<PageTitle
				title={power.name}
				description={`GUIDE POC: chi tiết sức mạnh ${power.name}`}
			/>

			{/* --------------------------------------------------- */}
			{/* NÚT QUAY LẠI – ĐỒNG BỘ 100% VỚI ChampionDetail */}
			{/* --------------------------------------------------- */}
			<div className='max-w-[1200px] mx-auto p-4 md:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} />
					Quay lại
				</Button>

				<div className='relative mx-auto max-w-[1200px] border border-border p-4 sm:p-6 rounded-lg bg-surface-bg text-text-primary font-secondary'>
					{/* Thông tin sức mạnh */}
					<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
						<SafeImage
							className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg self-center md:self-start'
							src={power.assetAbsolutePath || "/images/placeholder.png"}
							alt={power.name}
							loading='lazy'
						/>
						<div className='flex-1 flex flex-col'>
							<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1'>
								<h1 className='font-primary'>{power.name}</h1>
								<h1 className='font-primary'>ĐỘ HIẾM: {power.rarity}</h1>
							</div>

							{power.descriptionRaw && (
								<div className='flex-1 mt-4'>
									<p className='text-base sm:text-xl rounded-lg overflow-y-auto p-4 h-full min-h-[150px] max-h-[300px] bg-surface-bg border text-text-secondary'>
										{power.descriptionRaw}
									</p>
								</div>
							)}
						</div>
					</div>

					{/* Danh sách tướng tương thích */}
					<h2 className='text-xl sm:text-3xl font-semibold mt-8 mb-4 font-primary'>
						Các tướng có thể dùng sức mạnh
					</h2>

					{compatibleChampions.length > 0 ? (
						<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 rounded-md p-4 bg-surface-hover'>
							{compatibleChampions.map((champion, index) => (
								<Link
									key={index}
									to={`/champion/${encodeURIComponent(champion.name)}`}
									className='group rounded-lg p-4 transition-all hover:shadow-lg hover:scale-105 bg-surface-bg border border-border'
								>
									<SafeImage
										className='w-full max-w-[120px] h-auto mx-auto rounded-full object-cover border-2 border-border group-hover:border-primary-500 transition-colors'
										src={champion.image}
										alt={champion.name}
										loading='lazy'
									/>
									<h3 className='text-base sm:text-lg font-semibold text-center mt-3 text-text-primary group-hover:text-primary-500 transition-colors'>
										{champion.name}
									</h3>
								</Link>
							))}
						</div>
					) : (
						<div className='text-center p-8 rounded-md bg-surface-hover text-text-secondary'>
							<p className='text-lg'>
								Không có tướng nào sử dụng sức mạnh này.
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(PowerDetail);
