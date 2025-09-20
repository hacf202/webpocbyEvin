import React, { useState } from "react";

const SearchComponent = ({
	builds,
	setFilteredBuilds,
	championsList,
	relicsList,
	powersList,
}) => {
	const [searchTerm, setSearchTerm] = useState("");
	const [searchType, setSearchType] = useState("champion"); // Default search type

	const handleSearch = () => {
		if (!searchTerm.trim()) {
			setFilteredBuilds(builds);
			return;
		}

		const lowerCaseTerm = searchTerm.toLowerCase();
		let filtered = builds;

		switch (searchType) {
			case "champion":
				filtered = builds.filter(build =>
					build.championName.toLowerCase().includes(lowerCaseTerm)
				);
				break;
			case "artifact":
				filtered = builds.filter(build =>
					build.artifacts.some(artifact =>
						artifact.toLowerCase().includes(lowerCaseTerm)
					)
				);
				break;
			case "power":
				filtered = builds.filter(build =>
					build.powers.some(power =>
						power.toLowerCase().includes(lowerCaseTerm)
					)
				);
				break;
			case "creator":
				filtered = builds.filter(build =>
					build.creator.toLowerCase().includes(lowerCaseTerm)
				);
				break;
			default:
				filtered = builds;
		}

		setFilteredBuilds(filtered);
	};

	const handleClear = () => {
		setSearchTerm("");
		setFilteredBuilds(builds); // Reset to full builds list
	};

	return (
		<div className='search-bar mb-6 flex flex-col sm:flex-row gap-4 py-6'>
			<div className='relative w-full'>
				<input
					type='text'
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
					placeholder='Nhập từ khóa tìm kiếm...'
					className='bg-gray-800 text-white p-2 pr-10 rounded-md w-full focus:outline-none'
				/>
				{searchTerm && (
					<button
						onClick={handleClear}
						className='absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white'
						title='Xóa nội dung'
					>
						<svg
							className='w-5 h-5'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
							xmlns='http://www.w3.org/2000/svg'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				)}
			</div>
			<select
				value={searchType}
				onChange={e => setSearchType(e.target.value)}
				className='bg-gray-800 text-white p-2 rounded-md focus:outline-none'
			>
				<option value='champion'>Tìm theo Tên Tướng</option>
				<option value='artifact'>Tìm theo Cổ Vật</option>
				<option value='power'>Tìm theo Sức Mạnh</option>
				<option value='creator'>Tìm theo Người Tạo</option>
			</select>
			<button
				onClick={handleSearch}
				className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-70 sm:w-50'
			>
				Tìm Kiếm
			</button>
		</div>
	);
};

export default SearchComponent;
