import { memo } from "react";
import { useParams } from "react-router-dom";
import runesData from "../assets/data/runes-vi_vn.json";

function RuneDetail() {
	const { runeCode } = useParams();
	const rune = runesData.find(
		rune => rune.runeCode === decodeURIComponent(runeCode)
	);

	if (!rune) {
		return (
			<div
				className='p-4 sm:p-6'
				style={{ color: "var(--color-text-primary)" }}
			>
				Không tìm thấy thông tin ngọc. runeCode: {runeCode}
			</div>
		);
	}

	return (
		<div
			className='relative mx-auto max-w-[1200px] p-4 sm:p-6 rounded-lg mt-10'
			style={{
				backgroundColor: "var(--color-surface)",
				color: "var(--color-text-primary)",
			}}
		>
			<div
				className='flex flex-col md:flex-row gap-4 rounded-md p-2'
				style={{ backgroundColor: "var(--color-background)" }}
			>
				<img
					className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
					src={rune.assetAbsolutePath || "/images/placeholder.png"}
					alt={rune.name || "Unknown Rune"}
					loading='lazy'
				/>
				<div className='flex-1'>
					<div
						className='rounded-lg p-2'
						style={{ backgroundColor: "var(--color-background)" }}
					>
						<h1 className='text-2xl sm:text-4xl font-bold m-1'>{rune.name}</h1>
					</div>
					{rune.description && (
						<p
							className='text-base sm:text-xl mt-4 mx-1 rounded-lg overflow-y-auto h-60 p-2'
							style={{
								backgroundColor: "var(--color-surface)",
								border: "1px solid var(--color-border)",
								color: "var(--color-text-secondary)",
							}}
						>
							{rune.description}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(RuneDetail);
