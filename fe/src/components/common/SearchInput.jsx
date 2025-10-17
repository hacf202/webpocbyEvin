import React from "react";

function SearchInput({ value, onChange, placeholder, ariaLabel }) {
	return (
		<input
			type='text'
			placeholder={placeholder}
			value={value}
			onChange={e => onChange(e.target.value)}
			className='p-2 rounded-md bg-white text-[var(--color-text-primary)] border border-[var(--color-border)] w-full focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]'
			aria-label={ariaLabel}
		/>
	);
}

export default React.memo(SearchInput);
