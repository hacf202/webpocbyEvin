import { memo, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

function RuneDetail() {
	const { runeCode } = useParams();
	const [rune, setRune] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchRune = async () => {
			try {
				setLoading(true);
				setError(null);

				const decodedCode = decodeURIComponent(runeCode);
				const response = await fetch(`${apiUrl}/api/runes`);

				if (!response.ok) {
					throw new Error("Không thể tải dữ liệu ngọc bổ trợ.");
				}

				const runesData = await response.json();
				const foundRune = runesData.find(r => r.runeCode === decodedCode);

				if (!foundRune) {
					setError(`Không tìm thấy ngọc với mã: ${decodedCode}`);
					setRune(null);
				} else {
					setRune(foundRune);
				}
			} catch (err) {
				console.error("Lỗi khi tải ngọc:", err);
				setError(err.message || "Đã xảy ra lỗi khi tải dữ liệu.");
				setRune(null);
			} finally {
				setLoading(false);
			}
		};

		if (runeCode) {
			fetchRune();
		}
	}, [runeCode, apiUrl]);

	// Loading state
	if (loading) {
		return (
			<div className='flex flex-col items-center justify-center min-h-[400px] p-4 sm:p-6 text-text-secondary'>
				<Loader2 className='animate-spin text-primary-500' size={48} />
				<p className='mt-4 text-lg'>Đang tải thông tin ngọc...</p>
			</div>
		);
	}

	// Error state
	if (error || !rune) {
		return (
			<div className='p-6 sm:p-8 text-center text-danger-text-dark'>
				<p className='text-xl font-semibold'>Không tìm thấy ngọc bổ trợ</p>
				<p className='mt-2 text-sm opacity-80'>
					{runeCode && `Mã: ${decodeURIComponent(runeCode)}`}
				</p>
				{error && <p className='mt-4 text-sm'>{error}</p>}
			</div>
		);
	}

	// Success state
	return (
		<div className='relative mx-auto max-w-[1200px] border border-border  p-4 sm:p-6 rounded-lg mt-10 bg-surface-bg text-text-primary font-secondary '>
			<div className='flex flex-col md:flex-row gap-4 rounded-md p-2 bg-surface-hover'>
				<img
					className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg self-center md:self-start'
					src={rune.assetAbsolutePath || "/images/placeholder.png"}
					alt={rune.name || "Unknown Rune"}
					loading='lazy'
				/>
				<div className='flex-1 flex flex-col '>
					<div className='flex flex-col border border-border sm:flex-row sm:justify-between rounded-lg p-2 text-2xl sm:text-4xl font-bold m-1'>
						<h1 className='font-primary'>{rune.name}</h1>
						<h1 className='font-primary'>ĐỘ HIẾM: {rune.rarity}</h1>
					</div>
					{rune.description && (
						<div className='flex-1 mt-4'>
							<p className='text-base sm:text-xl rounded-lg overflow-y-auto p-4 h-full min-h-[150px] max-h-[300px] bg-surface-bg border text-text-secondary'>
								{rune.description}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(RuneDetail);
