// src/components/build/BuildCreation.jsx
import React, { useState } from "react";
import BuildModal from "./BuildModal";

const BuildCreation = ({ onConfirm, onClose }) => {
	const [isOpen, setIsOpen] = useState(true);

	const handleConfirm = build => {
		onConfirm(build);
		setIsOpen(false);
	};

	const handleClose = () => {
		setIsOpen(false);
		onClose?.();
	};

	return (
		<BuildModal
			isOpen={isOpen}
			onClose={handleClose}
			onConfirm={handleConfirm}
		/>
	);
};

export default BuildCreation;
