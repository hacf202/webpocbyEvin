import React from "react";
import { X } from "lucide-react";

/**
 * A reusable modal component.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open or not.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {string} props.title - The title of the modal.
 * @param {React.ReactNode} props.children - The content of the modal.
 * @param {string} [props.maxWidth="max-w-md"] - TailwindCSS class for max-width.
 */
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-md" }) => {
	if (!isOpen) return null;

	return (
		// Lớp phủ (overlay)
		<div
			className='fixed inset-0 bg-black/10 backdrop-blur-sm z-50 flex justify-center items-center p-4 transition-opacity duration-300' // <--- THÊM `bg-black/10` VÀO ĐÂY
			onClick={onClose}
			aria-modal='true'
			role='dialog'
		>
			{/* Nội dung Modal */}
			<div
				className={`bg-[var(--color-surface)] text-[var(--color-text-primary)] rounded-lg shadow-xl w-full ${maxWidth} relative border border-[var(--color-border)] transform transition-transform duration-300 scale-95 max-h-[95vh] flex flex-col`}
				onClick={e => e.stopPropagation()}
				style={{ animation: "scaleUp 0.3s ease-out forwards" }}
			>
				{/* Header */}
				<div className='flex justify-between items-center p-4 border-b border-[var(--color-border)] flex-shrink-0'>
					<h3 className='text-xl font-bold text-[var(--color-primary)]'>
						{title}
					</h3>
					<button
						onClick={onClose}
						className='text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] focus:ring-[var(--color-primary)]'
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
