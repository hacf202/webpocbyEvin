import { memo } from "react";

function ChampionCard({ champion }) {
	return (
		<div className='bg-transparent w-[140px] h-[210px] relative overflow-hidden cursor-pointer hover:brightness-90 transition-all'>
			<img
				className='absolute object-cover w-full h-full'
				src={
					champion.assets[0]?.M.gameAbsolutePath.S || "/images/placeholder.png"
				}
				alt={champion.name || "Unknown Champion"}
				loading='lazy'
			/>
		</div>
	);
}

export default memo(ChampionCard);
