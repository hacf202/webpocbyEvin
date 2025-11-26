// src/components/build/BuildEditModal.jsx
import React, { useState, useEffect } from "react";
import BuildModal from "./buildModal";

const BuildEditModal = ({ build, isOpen, onClose, onConfirm }) => {
	const [maxStar, setMaxStar] = useState(7);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Lấy maxStar khi mở modal
	useEffect(() => {
		if (!isOpen || !build?.championName) return;

		const fetchMaxStar = async () => {
			try {
				const apiUrl = import.meta.env.VITE_API_URL;
				const res = await fetch(
					`${apiUrl}/api/champions/search?name=${encodeURIComponent(
						build.championName.trim()
					)}`
				);
				const data = await res.json();
				const champion = data.items?.[0];
				setMaxStar(champion?.maxStar ?? 7);
			} catch (err) {
				console.error("Lỗi lấy maxStar:", err);
				setMaxStar(7);
			}
		};

		fetchMaxStar();
		setIsModalOpen(true);
	}, [isOpen, build?.championName]);

	// Đóng modal
	const handleClose = () => {
		setIsModalOpen(false);
		onClose?.();
	};

	// Xác nhận thành công
	const handleConfirm = updatedBuild => {
		onConfirm(updatedBuild);
		handleClose();
	};

	// Không cho thay đổi tướng khi edit
	const handleChampionChange = () => {
		// Không làm gì cả – không cho đổi tướng
	};

	if (!isOpen || !build) return null;

	return (
		<BuildModal
			isOpen={isModalOpen}
			onClose={handleClose}
			onConfirm={handleConfirm}
			initialData={{
				_id: build.id,
				championName: build.championName,
				description: build.description || "",
				star: build.star || 3,
				display: build.display ?? true,
				relicSet: [...(build.relicSet || []), null, null, null].slice(0, 3),
				powers: [
					...(build.powers || []),
					null,
					null,
					null,
					null,
					null,
					null,
				].slice(0, 6),
				rune: [...(build.rune || []), null].slice(0, 1),
				regions: build.regions, // để check Hoa Linh
			}}
			onChampionChange={handleChampionChange} // không cho đổi
			maxStar={maxStar}
		/>
	);
};

export default BuildEditModal;
