import { useState, useEffect } from "react";

function PowerFilter({ onSearchChange }) {
	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("powersSearchTerm") || ""
	);

	// Đồng bộ với localStorage mỗi khi searchTerm thay đổi
	useEffect(() => {
		localStorage.setItem("powersSearchTerm", searchTerm);
		onSearchChange(searchTerm);
	}, [searchTerm, onSearchChange]);

	return (
		<input
			type='text'
			placeholder='Tìm theo tên sức mạnh...'
			value={searchTerm}
			onChange={e => setSearchTerm(e.target.value)}
			className='p-2 rounded-md text-white w-full'
		/>
	);
}

export default PowerFilter;
