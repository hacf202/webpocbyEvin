import React, { useState, useEffect, useRef } from "react";
import BuildSummary from "./BuildSummary";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

const MyBuilds = ({
	token,
	onDeleteBuild,
	onEditBuild,
	onUpdateBuild,
	championsList = [],
	relicsList = [],
	itemsList = [],
	powersList = [],
}) => {
	const [myBuilds, setMyBuilds] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);
	const updateRef = useRef(null);

	const normalizeBuild = build => ({
		...build,
		championName:
			typeof build.championName === "object" && build.championName?.S
				? build.championName.S
				: build.championName || "",
		artifacts: Array.isArray(build.artifacts)
			? build.artifacts.map(artifact =>
					typeof artifact === "object" && artifact?.S
						? artifact.S
						: artifact || ""
			  )
			: [],
		items: Array.isArray(build.items)
			? build.items.map(item =>
					typeof item === "object" && item?.S ? item.S : item || ""
			  )
			: [],
		powers: Array.isArray(build.powers)
			? build.powers.map(power =>
					typeof power === "object" && power?.S ? power.S : power || ""
			  )
			: [],
		description:
			typeof build.description === "object" && build.description?.S
				? build.description.S
				: build.description || "",
		creator:
			typeof build.creator === "object" && build.creator?.S
				? build.creator.S
				: build.creator || "",
		creator_name:
			typeof build.creator_name === "object" && build.creator_name?.S
				? build.creator_name.S
				: build.creator_name || "",
	});

	useEffect(() => {
		if (token) {
			const fetchMyBuilds = async () => {
				try {
					setIsLoading(true);
					const response = await fetch(
						`${import.meta.env.VITE_API_URL}/api/my-builds`,
						{
							headers: { Authorization: `Bearer ${token}` },
						}
					);
					if (!response.ok) {
						throw new Error(`HTTP error! Status: ${response.status}`);
					}
					const data = await response.json();
					setMyBuilds(
						Array.isArray(data.items) ? data.items.map(normalizeBuild) : []
					);
					setError(null);
				} catch (err) {
					console.error("Lỗi khi lấy my builds:", err);
					setError("Không thể tải dữ liệu my builds.");
				} finally {
					setIsLoading(false);
				}
			};
			fetchMyBuilds();
		}
	}, [token]);

	const handleDelete = async id => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/builds/${id}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (response.ok) {
				setMyBuilds(prev => prev.filter(b => b.id !== id));
				setShowDeleteModal(false);
				setBuildToDelete(null);
				onDeleteBuild(id); // Cập nhật Builds.jsx
			} else {
				setError("Không thể xóa build");
			}
		} catch (err) {
			setError("Lỗi kết nối server");
		}
	};

	const handleUpdate = updatedBuild => {
		setMyBuilds(prev =>
			prev.map(b =>
				b.id === updatedBuild.id ? normalizeBuild(updatedBuild) : b
			)
		);
	};

	useEffect(() => {
		if (onUpdateBuild) {
			onUpdateBuild.current = handleUpdate; // Đăng ký hàm cập nhật
		}
	}, [onUpdateBuild]);

	const openDeleteModal = id => {
		setBuildToDelete(id);
		setShowDeleteModal(true);
	};

	if (isLoading) {
		return <p className='text-white'>Đang tải my builds...</p>;
	}

	if (error) {
		return <p className='text-red-500'>{error}</p>;
	}

	return (
		<div className='my-builds'>
			<h2 className='text-xl font-bold text-white mb-4'>Build Của Tôi</h2>
			{myBuilds.length === 0 ? (
				<p className='text-gray-300'>Bạn chưa có build nào.</p>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
					{myBuilds.map(build => (
						<div key={build.id}>
							<BuildSummary
								build={build}
								championsList={championsList}
								relicsList={relicsList}
								itemsList={itemsList}
								powersList={powersList}
								style={{ zIndex: 10 }}
							/>
							<button
								onClick={() => onEditBuild(build)}
								className='bg-yellow-600 text-white px-2 py-1 rounded mt-2'
							>
								Sửa
							</button>
							<button
								onClick={() => openDeleteModal(build.id)}
								className='bg-red-600 text-white px-2 py-1 rounded mt-2 ml-2'
							>
								Xóa
							</button>
						</div>
					))}
				</div>
			)}
			{showDeleteModal && (
				<ConfirmDeleteModal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
					onConfirm={handleDelete}
					buildId={buildToDelete}
				/>
			)}
		</div>
	);
};

export default MyBuilds;
