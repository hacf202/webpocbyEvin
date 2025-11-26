// src/components/build/BuildCard.jsx
import { memo, useState, useEffect } from "react";
import {
	Star,
	Eye,
	ThumbsUp,
	Calendar,
	User,
	ToggleLeft,
	ToggleRight,
} from "lucide-react";
import { getChampionAvatar } from "../../utils/championAvatarCache.js"; // ĐÚNG ĐƯỜNG DẪN

const BuildCard = ({ build, onClick }) => {
	const {
		championName,
		star = 0,
		views = 0,
		like = 0,
		creatorName,
		creator,
		createdAt,
		display,
		relicSet = [],
		powers = [],
		rune = [],
	} = build;

	const [avatarUrl, setAvatarUrl] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const loadAvatar = async () => {
			if (!championName) {
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			const url = await getChampionAvatar(championName);
			setAvatarUrl(url);
			setIsLoading(false);
		};

		loadAvatar();
	}, [championName]);

	return (
		<div
			onClick={onClick}
			className='bg-[var(--color-background)] p-5 rounded-xl border border-[var(--color-border)] 
                     hover:shadow-lg hover:border-[var(--color-primary)] 
                     transition-all duration-200 cursor-pointer group relative'
		>
			{/* AVATAR */}
			{isLoading ? (
				<div className='absolute top-2 left-2 w-12 h-12 bg-gray-200 border-2 border-[var(--color-border)] rounded-full' />
			) : avatarUrl ? (
				<div className='absolute top-2 left-2 w-12 h-12 rounded-full overflow-hidden border-2 border-[var(--color-border)] shadow-md transition-transform duration-200'>
					<img
						src={avatarUrl}
						alt={championName}
						className='w-full h-full object-cover'
						loading='lazy'
						onError={e => {
							e.target.style.display = "none";
						}}
					/>
				</div>
			) : null}

			{/* Nội dung */}
			<div className='flex justify-between items-start mb-3 pl-11'>
				<h3 className='text-lg font-bold text-[var(--color-text-primary)] truncate'>
					{championName || "Không tên"}
				</h3>
				<div className='flex items-center gap-1 text-yellow-500'>
					<Star size={18} fill='currentColor' />
					<span className='font-semibold'>{star}</span>
				</div>
			</div>

			<div className='flex gap-4 text-sm text-[var(--color-text-secondary)] mb-3'>
				<div className='flex items-center gap-1'>
					<Eye size={16} />
					<span>{views}</span>
				</div>
				<div className='flex items-center gap-1'>
					<ThumbsUp size={16} />
					<span>{like}</span>
				</div>
				<div className='flex items-center gap-1'>
					{display ? (
						<ToggleRight size={16} className='text-green-500' />
					) : (
						<ToggleLeft size={16} className='text-gray-400' />
					)}
					<span className='text-xs'>{display ? "Công khai" : "Ẩn"}</span>
				</div>
			</div>

			<div className='text-xs space-y-1 text-[var(--color-text-secondary)]'>
				{relicSet.length > 0 && (
					<div className='flex items-center gap-1'>
						<span className='font-medium'>Cổ Vật:</span>
						<span className='truncate max-w-[180px]'>
							{relicSet.slice(0, 2).join(", ")}
							{relicSet.length > 2 && ` +${relicSet.length - 2}`}
						</span>
					</div>
				)}
				{powers.length > 0 && (
					<div className='flex items-center gap-1'>
						<span className='font-medium'>Sức mạnh:</span>
						<span className='truncate max-w-[180px]'>
							{powers.slice(0, 2).join(", ")}
							{powers.length > 2 && ` +${powers.length - 2}`}
						</span>
					</div>
				)}
				{rune.length > 0 && (
					<div className='flex items-center gap-1'>
						<span className='font-medium'>Ngọc:</span>
						<span>{rune.length} mục</span>
					</div>
				)}
			</div>

			<div className='flex justify-between items-center mt-4 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]'>
				<div className='flex items-center gap-1'>
					<User size={14} />
					<span className='truncate max-w-[100px]'>
						{creatorName || creator || "Ẩn danh"}
					</span>
				</div>
				<div className='flex items-center gap-1'>
					<Calendar size={14} />
					<span>{new Date(createdAt).toLocaleDateString("vi-VN")}</span>
				</div>
			</div>

			<div className='absolute inset-0 rounded-xl ring-2 ring-transparent group-hover:ring-[var(--color-primary)] transition-all pointer-events-none' />
		</div>
	);
};

export default memo(BuildCard);
