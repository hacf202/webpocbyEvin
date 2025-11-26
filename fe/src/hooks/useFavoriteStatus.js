// src/hooks/useFavoriteStatus.js
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export const useFavoriteStatus = (buildIds = []) => {
	const { token } = useAuth();
	const [status, setStatus] = useState({}); // { buildId: true/false }
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!token || buildIds.length === 0) {
			setStatus({});
			return;
		}

		setLoading(true);
		const idsStr = buildIds.join(",");

		fetch(
			`${
				import.meta.env.VITE_API_URL
			}/api/builds/favorites/batch?ids=${idsStr}`,
			{
				headers: { Authorization: `Bearer ${token}` },
			}
		)
			.then(r => r.json())
			.then(data => {
				setStatus(data);
			})
			.finally(() => setLoading(false));
	}, [buildIds.join(","), token]);

	return { status, loading };
};
