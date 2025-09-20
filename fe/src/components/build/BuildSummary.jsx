import React, { memo, useMemo } from "react";

const BuildSummary = ({
	build,
	championsList = [],
	relicsList = [],
	itemsList = [],
	powersList = [],
	style,
}) => {
	// Helper để chuẩn hóa tên
	const normalizeName = val => {
		if (!val) return "";
		if (typeof val === "string") return val;
		if (typeof val === "object" && val !== null && "S" in val)
			return val.S || "";
		console.warn("Unexpected value in normalizeName:", val);
		return String(val); // Fallback to string conversion
	};

	// Memoize champion lookup
	const championImage = useMemo(() => {
		const championName = normalizeName(build?.championName);
		return (
			(Array.isArray(championsList) &&
				championsList.find(champ => champ?.name === championName)?.image) ||
			"/images/placeholder.png"
		);
	}, [championsList, build?.championName]);

	// Memoize artifacts, items, and powers lookups
	const artifactImages = useMemo(() => {
		return Array.isArray(build?.artifacts)
			? build.artifacts.map((artifact, index) => {
					const artifactName = normalizeName(artifact);
					return artifactName
						? (Array.isArray(relicsList) &&
								relicsList.find(relic => relic?.name === artifactName)
									?.image) ||
								"/images/placeholder.png"
						: null;
			  })
			: [];
	}, [relicsList, build?.artifacts]);

	const itemImages = useMemo(() => {
		return Array.isArray(build?.items)
			? build.items.map((item, index) => {
					const itemName = normalizeName(item);
					return itemName
						? (Array.isArray(itemsList) &&
								itemsList.find(i => i?.name === itemName)?.image) ||
								"/images/placeholder.png"
						: null;
			  })
			: [];
	}, [itemsList, build?.items]);

	const powerImages = useMemo(() => {
		return Array.isArray(build?.powers)
			? build.powers.map((power, index) => {
					const powerName = normalizeName(power);
					return powerName
						? (Array.isArray(powersList) &&
								powersList.find(p => p?.name === powerName)?.image) ||
								"/images/placeholder.png"
						: null;
			  })
			: [];
	}, [powersList, build?.powers]);

	// Kiểm tra build hợp lệ
	if (!build || !build.championName) {
		return (
			<div
				className='build-summary bg-gray-600 p-4 sm:p-5 rounded-lg shadow-md text-white transition duration-200'
				style={style}
			>
				Invalid build data
			</div>
		);
	}

	return (
		<div
			className='build-summary bg-gray-600 p-4 sm:p-5 rounded-lg shadow-md text-white transition duration-200 h-125'
			style={style}
		>
			<div className='flex items-center gap-3 mb-3 h-16 bg-gray-500 rounded-md'>
				<div className='relative group'>
					<img
						src={championImage}
						alt={normalizeName(build.championName) || "Champion"}
						className='w-16 h-16 object-contain rounded'
						loading='lazy'
						aria-label={normalizeName(build.championName) || "Champion"}
					/>
					<span className='text-center w-[110px] absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 bg-opacity-30 text-white text-xs rounded px-2 py-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100'>
						{normalizeName(build.championName) || "Unknown Champion"}
					</span>
				</div>
				<h2 className='text-base sm:text-lg font-bold truncate'>
					{normalizeName(build.championName) || "Unknown Champion"}
				</h2>
			</div>

			{Array.isArray(build.artifacts) &&
				build.artifacts.some(artifact => artifact) && (
					<div className='mb-3'>
						<p className='text-gray-300 text-sm sm:text-base'>Cổ vật:</p>
						<div className='flex gap-2 mt-1'>
							{build.artifacts.map((artifact, index) => {
								const artifactName = normalizeName(artifact);
								return artifactName ? (
									<div
										key={`${build.id}-artifact-${index}`}
										className='relative group'
									>
										<img
											src={artifactImages[index]}
											alt={artifactName}
											className='w-10 h-10 sm:w-12 sm:h-12 object-cover bg-gray-500 rounded-md'
											loading='lazy'
											aria-label={artifactName}
										/>
										<span className='text-center w-[140px] absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 bg-opacity-30 text-white text-xs rounded px-2 py-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100'>
											{artifactName}
										</span>
									</div>
								) : null;
							})}
						</div>
					</div>
				)}

			{Array.isArray(build.items) && build.items.some(item => item) && (
				<div className='mb-3'>
					<p className='text-gray-300 text-sm sm:text-base'>Vật phẩm:</p>
					<div className='flex flex-wrap gap-2 mt-1'>
						{build.items.map((item, index) => {
							const itemName = normalizeName(item);
							return itemName ? (
								<div
									key={`${build.id}-item-${index}`}
									className='relative group'
								>
									<img
										src={itemImages[index]}
										alt={itemName}
										className='w-10 h-10 sm:w-12 sm:h-12 object-cover bg-gray-500 rounded-md'
										loading='lazy'
										aria-label={itemName}
									/>
									<span className='text-center w-[140px] absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 bg-opacity-30 text-white text-xs rounded px-2 py-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100'>
										{itemName}
									</span>
								</div>
							) : null;
						})}
					</div>
				</div>
			)}

			{Array.isArray(build.powers) && build.powers.some(power => power) && (
				<div className='mb-3'>
					<p className='text-gray-300 text-sm sm:text-base'>Sức mạnh:</p>
					<div className='flex flex-wrap gap-2 mt-1'>
						{build.powers.map((power, index) => {
							const powerName = normalizeName(power);
							return powerName ? (
								<div
									key={`${build.id}-power-${index}`}
									className='relative group'
								>
									<img
										src={powerImages[index]}
										alt={powerName}
										className='w-10 h-10 sm:w-12 sm:h-12 object-cover bg-gray-500 rounded-md'
										loading='lazy'
										aria-label={powerName}
									/>
									<span className='text-center w-[140px] absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-gray-800 bg-opacity-30 text-white text-xs rounded px-2 py-1 transition-opacity duration-200 opacity-0 group-hover:opacity-100'>
										{powerName}
									</span>
								</div>
							) : null;
						})}
					</div>
				</div>
			)}

			{build.description && (
				<p className='text-gray-300 text-sm sm:text-base mb-2 bg-gray-500 rounded-md p-2 max-h-40 overflow-y-auto'>
					Mô tả: {normalizeName(build.description)}
				</p>
			)}

			{build.creator && (
				<p className='text-gray-300 text-sm sm:text-base mb-2 bg-gray-500 rounded-md p-2'>
					Chủ sở hữu: {normalizeName(build.creator)}
				</p>
			)}
		</div>
	);
};

export default memo(BuildSummary);
