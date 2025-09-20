import React from "react";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, buildId }) => {
	if (!isOpen) return null;

	return (
		<div
			className='modal fixed inset-0 flex items-center justify-center'
			style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 60 }}
		>
			<div className='modal-content bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[400px]'>
				<h2 className='text-xl font-bold text-white mb-4'>Xác nhận xóa</h2>
				<p className='text-gray-300 mb-6'>
					Bạn có chắc chắn muốn xóa build này?
				</p>
				<div className='flex justify-end gap-2'>
					<button
						onClick={onClose}
						className='bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600'
					>
						Hủy
					</button>
					<button
						onClick={() => onConfirm(buildId)}
						className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700'
					>
						Xóa
					</button>
				</div>
			</div>
		</div>
	);
};

export default ConfirmDeleteModal;
