// src/hooks/useSafeImage.js
import { useState, useEffect, useRef } from "react";

export function useSafeImage(
	src,
<<<<<<< HEAD
	fallbackSrc = "/fallback-image.svg",
=======
	fallbackSrc = "/fallback-image.svg", // ← DÙNG CHUNG
>>>>>>> c47b8f082094c4b0e23aa9c03fdd972679f520ef
	maxRetries = 1
) {
	const [imgSrc, setImgSrc] = useState(src);
	const [loading, setLoading] = useState(true);
	const retryCount = useRef(0);

	useEffect(() => {
		if (!src) {
			setImgSrc(fallbackSrc);
			setLoading(false);
			return;
		}

		const img = new Image();

		img.onload = () => {
			setImgSrc(src);
			setLoading(false);
			retryCount.current = 0;
		};

		img.onerror = () => {
			if (retryCount.current < maxRetries) {
				retryCount.current++;
				img.src = `${src}?retry=${retryCount.current}&t=${Date.now()}`;
			} else {
				setImgSrc(fallbackSrc);
				setLoading(false);
			}
		};

		img.src = src;

		return () => {
			img.onload = null;
			img.onerror = null;
		};
	}, [src, fallbackSrc, maxRetries]);

	return { imgSrc, loading };
}
