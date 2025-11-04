import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Trash2, Loader2, X } from "lucide-react";
import Modal from "../common/modal";
import Button from "../common/button";

const BuildDelete = ({ build, isOpen, onClose, onConfirm }) => {
	const { token } = useAuth();
	const [isDeleting, setIsDeleting] = useState(false);
	const [message, setMessage] = useState("");

	const handleDelete = async () => {
		if (!build || !build.id) return;

		setIsDeleting(true);
		setMessage("");

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/builds/${build.id}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const result = await response.json();
				setMessage(result.message || "Build đã được xóa thành công!");
				setTimeout(() => {
					onConfirm(build.id);
					handleClose();
				}, 1500);
			} else {
				const result = await response.json();
				setMessage(`Lỗi: ${result.error || "Không thể xóa build."}`);
				setIsDeleting(false);
			}
		} catch (error) {
			console.error("Lỗi khi xóa build:", error);
			setMessage("Lỗi kết nối đến server.");
			setIsDeleting(false);
		}
	};

	const handleClose = () => {
		if (isDeleting) return;
		setMessage("");
		setIsDeleting(false);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} onClose={handleClose} title='Xác nhận xóa Build'>
			<div>
				<p className='text-text-secondary mb-6'>
					Bạn có chắc chắn muốn xóa build cho tướng{" "}
					<strong className='font-semibold text-text-primary'>
						{build?.championName}
					</strong>
					?
					<br />
					Hành động này không thể hoàn tác.
				</p>

				{message && (
					<p
						className={`mb-4 text-center text-sm font-medium ${
							message.startsWith("Lỗi")
								? "text-danger-text-dark"
								: "text-success"
						}`}
					>
						{message}
					</p>
				)}

				<div className='flex justify-end gap-4'>
					<Button variant='ghost' onClick={handleClose} disabled={isDeleting}>
						Hủy
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? (
							<>
								<Loader2 className='animate-spin' size={18} />
								Đang xóa...
							</>
						) : (
							"Xóa vĩnh viễn"
						)}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default BuildDelete;
