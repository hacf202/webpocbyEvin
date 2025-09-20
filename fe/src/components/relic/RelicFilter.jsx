import { memo, useState, useCallback } from "react";

function RelicFilter({ onSearchChange }) {
	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("relicsSearchTerm") || ""
	);

	const handleSearchChange = useCallback(
		value => {
			setSearchTerm(value);
			localStorage.setItem("relicsSearchTerm", value);
			onSearchChange(value);
		},
		[onSearchChange]
	);

	return (
		<input
			type='text'
			value={searchTerm}
			onChange={e => handleSearchChange(e.target.value)}
			placeholder='Tìm kiếm di vật...'
			className='p-2 rounded-md text-white w-full'
			aria-label='Tìm kiếm di vật'
		/>
	);
}

export default memo(RelicFilter);
