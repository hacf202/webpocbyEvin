import React, { useEffect, useState, useMemo, useContext, useRef } from "react";
import championsData from "../assets/data/champions.json";
import relicsData from "../assets/data/relics-vi_vn.json";
import powersData from "../assets/data/powers-vi_vn.json";
import BuildSummary from "../components/build/BuildSummary";
import BuildCreation from "../components/build/BuildCreation";
import BuildEdit from "../components/build/BuildEdit";
import MyBuilds from "../components/build/MyBuilds";
import ConfirmDeleteModal from "../components/build/ConfirmDeleteModal";
import SearchComponent from "../components/build/SearchComponent"; // Import new SearchComponent
import { AuthContext } from "../context/AuthContext";
import Login from "../components/auth/Login";

const Builds = () => {
	const { user, token } = useContext(AuthContext);
	const [builds, setBuilds] = useState([]);
	const [filteredBuilds, setFilteredBuilds] = useState([]); // State for filtered builds
	const [showModal, setShowModal] = useState(false);
	const [showLogin, setShowLogin] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [showMyBuilds, setShowMyBuilds] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);
	const [editingBuild, setEditingBuild] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	const updateMyBuildsRef = useRef(null); // Ref để lưu hàm cập nhật từ MyBuilds

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
		const fetchBuilds = async () => {
			try {
				setIsLoading(true);
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/builds`
				);
				if (!response.ok) {
					throw new Error(`HTTP error! Status: ${response.status}`);
				}
				const data = await response.json();
				const normalizedBuilds = Array.isArray(data.items)
					? data.items.map(normalizeBuild)
					: [];
				setBuilds(normalizedBuilds);
				setFilteredBuilds(normalizedBuilds); // Initialize filtered builds
				setError(null);
			} catch (err) {
				console.error("Lỗi khi lấy dữ liệu builds:", err);
				setError("Không thể tải dữ liệu builds. Vui lòng thử lại sau.");
			} finally {
				setIsLoading(false);
			}
		};

		fetchBuilds();
	}, []);

	const championsList = useMemo(() => {
		return Array.isArray(championsData)
			? championsData.map(champion => ({
					name: champion.name || "",
					image:
						champion.assets?.[0]?.M?.avatar?.S || "/images/placeholder.png",
			  }))
			: [];
	}, []);

	const relicsList = useMemo(() => {
		return Array.isArray(relicsData)
			? relicsData.map(relic => ({
					name: relic.name || "",
					image: relic.assetAbsolutePath || "/images/placeholder.png",
			  }))
			: [];
	}, []);

	const powersList = useMemo(() => {
		return Array.isArray(powersData)
			? powersData.map(power => ({
					name: power.name || "",
					image: power.assetAbsolutePath || "/images/placeholder.png",
			  }))
			: [];
	}, []);

	const itemsList = relicsList;

	const handleAddBuild = newBuild => {
		const normalizedBuild = normalizeBuild(newBuild);
		setBuilds(prevBuilds => [...prevBuilds, normalizedBuild]);
		setFilteredBuilds(prevBuilds => [...prevBuilds, normalizedBuild]); // Update filtered builds
		setShowModal(false);
		setError(null);
	};

	const handleDeleteBuild = id => {
		setBuilds(prev => prev.filter(b => b.id !== id));
		setFilteredBuilds(prev => prev.filter(b => b.id !== id)); // Update filtered builds
		setShowDeleteModal(false);
		setBuildToDelete(null);
	};

	const handleEditBuild = build => {
		setEditingBuild(normalizeBuild(build));
		setShowEditModal(true);
	};

	const handleUpdateBuild = updatedBuild => {
		const normalizedBuild = normalizeBuild(updatedBuild);
		setBuilds(prev =>
			prev.map(b => (b.id === normalizedBuild.id ? normalizedBuild : b))
		);
		setFilteredBuilds(prev =>
			prev.map(b => (b.id === normalizedBuild.id ? normalizedBuild : b))
		); // Update filtered builds
		if (updateMyBuildsRef.current) {
			updateMyBuildsRef.current(normalizedBuild); // Gọi hàm cập nhật myBuilds
		}
		setShowEditModal(false);
		setEditingBuild(null);
	};

	const openDeleteModal = id => {
		setBuildToDelete(id);
		setShowDeleteModal(true);
	};

	return (
		<div className='builds-page bg-gray-900 p-6 rounded-lg shadow-lg'>
			<h1 className='text-2xl font-bold text-white mb-4'>Builds</h1>
			<p className='text-gray-300 mb-6'>
				Chào mừng bạn đến với trang builds. Tại đây bạn có thể tìm và quản lý
				các build của mình.
			</p>

			{user ? (
				<>
					<p className='text-white'>Xin chào, {user.username}!</p>

					<button
						onClick={() => setShowModal(true)}
						className='bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 ml-2'
					>
						Thêm Build Mới
					</button>
					<button
						onClick={() => setShowMyBuilds(true)}
						className='bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 ml-2'
					>
						Build Của Tôi
					</button>
				</>
			) : (
				<p
					className='text-blue-400 hover:text-blue-300 text-sm cursor-pointer'
					onClick={() => setShowLogin(true)}
				>
					Đăng nhập để tạo build
				</p>
			)}

			{showModal && user && (
				<div
					className='modal fixed inset-0 flex items-center justify-center'
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
				>
					<div className='modal-content bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[800px]'>
						<button
							onClick={() => setShowModal(false)}
							className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mb-4'
						>
							Đóng
						</button>
						<BuildCreation onConfirm={handleAddBuild} />
					</div>
				</div>
			)}

			{showEditModal && user && editingBuild && (
				<div
					className='modal fixed inset-0 flex items-center justify-center'
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 60 }}
				>
					<div className='modal-content bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[800px]'>
						<button
							onClick={() => setShowEditModal(false)}
							className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mb-4'
						>
							Đóng
						</button>
						<BuildEdit
							build={editingBuild}
							onConfirm={handleUpdateBuild}
							onClose={() => setShowEditModal(false)}
						/>
					</div>
				</div>
			)}

			{showLogin && (
				<div
					className='modal fixed inset-0 flex items-center justify-center'
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
				>
					<div className='modal-content bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[400px]'>
						<button
							onClick={() => setShowLogin(false)}
							className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mb-4'
						>
							Đóng
						</button>
						<Login onClose={() => setShowLogin(false)} />
					</div>
				</div>
			)}

			{showMyBuilds && user && (
				<div
					className='modal fixed inset-0 flex items-center justify-center'
					style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", zIndex: 50 }}
				>
					<div className='modal-content bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-[1500px] max-h-[90vh] overflow-y-auto'>
						<button
							onClick={() => setShowMyBuilds(false)}
							className='bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 mb-4'
						>
							Đóng
						</button>
						<MyBuilds
							token={token}
							onDeleteBuild={handleDeleteBuild}
							onEditBuild={handleEditBuild}
							onUpdateBuild={updateMyBuildsRef}
							championsList={championsList}
							relicsList={relicsList}
							itemsList={itemsList}
							powersList={powersList}
						/>
					</div>
				</div>
			)}

			{showDeleteModal && (
				<ConfirmDeleteModal
					isOpen={showDeleteModal}
					onClose={() => setShowDeleteModal(false)}
					onConfirm={handleDeleteBuild}
					buildId={buildToDelete}
				/>
			)}
			<SearchComponent
				builds={builds}
				setFilteredBuilds={setFilteredBuilds}
				championsList={championsList}
				relicsList={relicsList}
				powersList={powersList}
			/>
			{isLoading && <p className='text-white'>Đang tải dữ liệu...</p>}
			{error && <p className='text-red-500'>{error}</p>}
			{!isLoading && !error && filteredBuilds.length === 0 && (
				<p className='text-gray-300'>Không có builds nào để hiển thị.</p>
			)}
			{!isLoading && !error && filteredBuilds.length > 0 && (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6'>
					{filteredBuilds.map(build => (
						<div key={build.id}>
							<BuildSummary
								build={build}
								championsList={championsList}
								relicsList={relicsList}
								itemsList={itemsList}
								powersList={powersList}
								style={{ zIndex: 10 }}
							/>
							{user && build.creator_name === user.username && (
								<>
									<button
										onClick={() => handleEditBuild(build)}
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
								</>
							)}
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default Builds;
