import { useState, useEffect } from "react";

export const useBatchFavoriteData = (builds, token) => {
	const [favoriteStatus, setFavoriteStatus] = useState({});
	const [favoriteCounts, setFavoriteCounts] = useState({});

	useEffect(() => {
		if (!builds || builds.length === 0) return;

		const buildIds = builds.map(b => b.id).join(",");
		const apiUrl = import.meta.env.VITE_API_URL;

		// 1. Batch Count (Luôn gọi)
		fetch(`${apiUrl}/api/builds/favorites/count/batch?ids=${buildIds}`)
			.then(res => res.json())
			.then(data => setFavoriteCounts(data))
			.catch(err => console.error("Batch count error:", err));

		// 2. Batch Status (Chỉ gọi nếu đã đăng nhập)
		if (token) {
			fetch(`${apiUrl}/api/builds/favorites/batch?ids=${buildIds}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
				.then(res => res.json())
				.then(data => setFavoriteStatus(data))
				.catch(err => console.error("Batch status error:", err));
		}
	}, [builds, token]); // Chạy lại khi danh sách build thay đổi

	return { favoriteStatus, favoriteCounts };
};
