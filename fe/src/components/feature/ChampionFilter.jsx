import { memo, useState, useCallback } from "react";

function ChampionFilter({ onSearchChange }) {
	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("championsSearchTerm") || ""
	);

	const saveToLocalStorage = useCallback((key, value) => {
		localStorage.setItem(key, value);
	}, []);

	const handleSearchChange = useCallback(
		e => {
			const value = e.target.value;
			setSearchTerm(value);
			saveToLocalStorage("championsSearchTerm", value);
			onSearchChange(value);
		},
		[saveToLocalStorage, onSearchChange]
	);

	return (
		<input
			type='text'
			placeholder='Tìm kiếm theo tên...'
			value={searchTerm}
			onChange={handleSearchChange}
			className='p-2 rounded-md text-white w-full'
			aria-label='Tìm kiếm tướng theo tên'
		/>
	);
}

export default memo(ChampionFilter);
