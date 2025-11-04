// src/components/common/Modal.jsx (ĐÃ REFACTOR)

import React from "react";
import { X } from "lucide-react";

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
	if (!isOpen) return null;

	return (
		// Lớp phủ (overlay)
		<div
			className='fixed inset-0 bg-modal-overlay-bg backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300'
			onClick={onClose}
			aria-modal='true'
			role='dialog'
		>
			{/* Nội dung Modal */}
			<div
				className={`bg-surface-bg text-text-primary rounded-lg shadow-xl w-full ${maxWidth} 
        relative border border-border max-h-[95vh] flex flex-col
        animate-scale-up`} // Sử dụng animation
				onClick={e => e.stopPropagation()}
			>
				{/* Header */}
				<div className='flex justify-between items-center p-4 border-b border-border flex-shrink-0'>
					{/* Tiêu đề Modal giờ dùng màu Primary */}
					<h3 className='text-xl font-bold text-primary-500 font-primary'>
						{title}
					</h3>
					<button
						onClick={onClose}
						className='text-text-secondary hover:text-text-primary transition-colors 
            rounded-full p-1 focus:outline-none focus:ring-2 
            focus:ring-offset-surface-bg focus:ring-primary-500'
						aria-label='Close modal'
					>
						<X size={24} />
					</button>
				</div>

				{/* Body (có thể cuộn) */}
				<div className='p-6 overflow-y-auto'>{children}</div>
			</div>
		</div>
	);
};

export default Modal;
