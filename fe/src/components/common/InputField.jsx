import React from "react";

const InputField = React.forwardRef(
	({ label, id, error, className, ...props }, ref) => {
		return (
			<div className='w-full'>
				{label && (
					<label htmlFor={id} className='block text-sm font-medium mb-1'>
						{label}
					</label>
				)}
				<input
					id={id}
					ref={ref}
					className={`w-full p-2 bg-white rounded-md border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none transition ${className}`}
					{...props}
				/>
				{error && (
					<p className='text-sm text-[var(--color-danger)] mt-1'>{error}</p>
				)}
			</div>
		);
	}
);

export default InputField;
