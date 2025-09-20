// ItemFilter.jsx
import { memo, useState, useCallback } from "react";

function ItemFilter({ onSearchChange }) {
	const [searchTerm, setSearchTerm] = useState(
		() => localStorage.getItem("itemsSearchTerm") || ""
	);

	const handleSearchChange = useCallback(
		value => {
			setSearchTerm(value);
			localStorage.setItem("itemsSearchTerm", value);
			onSearchChange(value);
		},
		[onSearchChange]
	);

	return (
		<input
			type='text'
			value={searchTerm}
			onChange={e => handleSearchChange(e.target.value)}
			placeholder='Tìm kiếm vật phẩm...'
			className='p-2 rounded-md text-white w-full'
			aria-label='Tìm kiếm vật phẩm'
		/>
	);
}

export default memo(ItemFilter);
