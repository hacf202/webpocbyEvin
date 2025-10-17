import React from "react";
import { X } from "lucide-react";

/**
 * A reusable modal component.
 * @param {object} props - The component props.
 * @param {boolean} props.isOpen - Whether the modal is open or not.
 * @param {function} props.onClose - Function to call when the modal should be closed.
 * @param {string} props.title - The title of the modal.
 * @param {React.ReactNode} props.children - The content of the modal.
 */
const Modal = ({ isOpen, onClose, title, children }) => {
	if (!isOpen) return null;

	return (
		// Modal overlay
		<div
			className='fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300'
			onClick={onClose} // Close modal on overlay click
			aria-modal='true'
			role='dialog'
		>
			{/* Modal content */}
			<div
				className='bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 relative border border-gray-700 transform transition-transform duration-300 scale-95'
				onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal content
				style={{ animation: "scaleUp 0.3s ease-out forwards" }}
			>
				<div className='flex justify-between items-center mb-4 border-b border-gray-700 pb-3'>
					<h3 className='text-xl font-bold text-white'>{title}</h3>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-white transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500'
						aria-label='Close modal'
					>
						<X size={24} />
					</button>
				</div>
				<div>{children}</div>
			</div>
			<style>
				{`
          @keyframes scaleUp {
            from {
              transform: scale(0.95);
              opacity: 0;
            }
            to {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
			</style>
		</div>
	);
};

export default Modal;
