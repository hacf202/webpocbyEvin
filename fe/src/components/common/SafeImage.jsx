// src/components/common/SafeImage.jsx
import React, { useState, useEffect } from "react";

const SafeImage = ({
	src,
	alt = "Image",
	className = "",
	fallback = "/fallback-image.svg",
	loading = "lazy",
}) => {
	const [imgSrc, setImgSrc] = useState(src || fallback);
	const [hasError, setHasError] = useState(false);

	useEffect(() => {
		if (src) {
			setImgSrc(src);
			setHasError(false);
		}
	}, [src]);

	const handleError = () => {
		if (!hasError && imgSrc !== fallback) {
			setImgSrc(fallback);
			setHasError(true);
		}
	};

	return (
		<img
			src={imgSrc}
			alt={alt}
			className={className}
			onError={handleError}
			loading={loading}
		/>
	);
};

export default SafeImage;
