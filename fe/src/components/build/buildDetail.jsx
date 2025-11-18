// src/components/build/BuildDetail.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, ThumbsUp, Heart, Trash2, Edit, ChevronLeft } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import Modal from "../common/modal";
import Button from "../common/button";
import BuildEditModal from "./buildEditModal";
import BuildDelete from "./buildDelete";
import CommentsSection from "../comment/commentsSection";
import PageTitle from "../common/pageTitle.jsx";

// === CHỈ regionsData DÙNG IMPORT JSON ===
import regionsData from "../../assets/data/iconRegions.json";
import SafeImage from "../common/SafeImage.jsx";

const BuildDetail = () => {
	const { buildId } = useParams();
	const navigate = useNavigate();
	const { user, token } = useAuth();
	const apiUrl = import.meta.env.VITE_API_URL;

	const [build, setBuild] = useState(null);
	const [loadingBuild, setLoadingBuild] = useState(true);
	const [error, setError] = useState(null);
	const [creatorDisplayName, setCreatorDisplayName] = useState("");

	const [likeCount, setLikeCount] = useState(0);
	const [isLiked, setIsLiked] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoriteList, setFavoriteList] = useState([]);
	const [showLoginModal, setShowLoginModal] = useState(false);

	const [showEditModal, setShowEditModal] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);

	// Dữ liệu động từ API
	const [champions, setChampions] = useState([]);
	const [relics, setRelics] = useState([]);
	const [runes, setRunes] = useState([]);
	const [powers, setPowers] = useState([]);
	const [loadingData, setLoadingData] = useState(true);

	const isOwner = useMemo(
		() => user && build && build.sub === user.sub,
		[user, build]
	);

	// === Tải dữ liệu động từ API (không bao gồm regions) ===
	useEffect(() => {
		const fetchStaticData = async () => {
			setLoadingData(true);
			try {
				const [champRes, relicRes, runeRes, powerRes] = await Promise.all([
					fetch(`${apiUrl}/api/champions`),
					fetch(`${apiUrl}/api/relics`),
					fetch(`${apiUrl}/api/runes`),
					fetch(`${apiUrl}/api/generalPowers`),
				]);

				const [champData, relicData, runeData, powerData] = await Promise.all([
					champRes.json(),
					relicRes.json(),
					runeRes.json(),
					powerRes.json(),
				]);

				setChampions(champData);
				setRelics(relicData);
				setRunes(runeData);
				setPowers(powerData);
			} catch (err) {
				console.error("Lỗi tải dữ liệu từ API:", err);
			} finally {
				setLoadingData(false);
			}
		};

		fetchStaticData();
	}, [apiUrl]);

	// === Tải build cụ thể ===
	const fetchBuild = useCallback(async () => {
		setLoadingBuild(true);
		try {
			const headers = {};
			if (token) {
				headers.Authorization = `Bearer ${token}`;
			}

			const res = await fetch(`${apiUrl}/api/builds/${buildId}`, { headers });
			if (!res.ok) {
				const errData = await res.json().catch(() => ({}));
				throw new Error(
					errData.error || "Không tìm thấy build hoặc không có quyền truy cập."
				);
			}
			const data = await res.json();
			setBuild(data);
			setLikeCount(data.like || 0);
			setFavoriteList(data.favorite || []);
			setIsFavorite(user && (data.favorite || []).includes(user.sub));
			setCreatorDisplayName(data.creator || "Vô danh");
		} catch (err) {
			setError(err.message);
		} finally {
			setLoadingBuild(false);
		}
	}, [buildId, apiUrl, token, user]);

	useEffect(() => {
		fetchBuild();
	}, [fetchBuild]);

	// === Tải tên người tạo ===
	useEffect(() => {
		const fetchCreatorName = async () => {
			if (!build || !build.creator) return;
			if (isOwner) {
				setCreatorDisplayName(user.name || build.creator);
				return;
			}
			try {
				const response = await fetch(`${apiUrl}/api/users/${build.creator}`);
				if (response.ok) {
					const data = await response.json();
					setCreatorDisplayName(data.name || build.creator);
				}
			} catch (error) {
				console.error("Failed to fetch creator name:", error);
			}
		};
		fetchCreatorName();
	}, [build, isOwner, user, apiUrl]);

	// === Kiểm tra like/favorite local ===
	useEffect(() => {
		const liked = sessionStorage.getItem(`liked_${buildId}`);
		if (liked) setIsLiked(true);
	}, [buildId]);

	useEffect(() => {
		setIsFavorite(user && favoriteList.includes(user.sub));
	}, [user, favoriteList]);

	// === Xử lý like ===
	const handleLike = async e => {
		e.stopPropagation();
		if (isLiked || !build) return;
		try {
			const res = await fetch(`${apiUrl}/api/builds/${build.id}/like`, {
				method: "PATCH",
			});
			if (res.ok) {
				const updated = await res.json();
				setLikeCount(updated.like);
				setIsLiked(true);
				sessionStorage.setItem(`liked_${build.id}`, "true");
			}
		} catch (error) {
			console.error("Error liking build:", error);
		}
	};

	// === Xử lý yêu thích ===
	const handleToggleFavorite = async e => {
		e.stopPropagation();
		if (!user) {
			setShowLoginModal(true);
			return;
		}
		if (!build) return;
		try {
			const res = await fetch(`${apiUrl}/api/builds/${build.id}/favorite`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
			});
			if (res.ok) {
				const updated = await res.json();
				setFavoriteList(updated.favorite);
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	// === Cập nhật / xóa build ===
	const handleBuildUpdate = updatedData => {
		setBuild(prev => ({ ...prev, ...updatedData }));
		setShowEditModal(false);
	};

	const handleBuildDelete = () => {
		setBuildToDelete(null);
		navigate("/builds");
	};

	// === Helper: chuẩn hóa tên ===
	const normalizeName = val =>
		val && typeof val === "object" ? val.S || "" : String(val || "");

	// === Tìm thông tin tướng ===
	const championInfo = useMemo(() => {
		if (!build?.championName) return null;
		const name = normalizeName(build.championName);
		return champions.find(c => c.name === name) || null;
	}, [build?.championName, champions]);

	const championImage = useMemo(
		() => championInfo?.assets?.[0]?.M?.avatar?.S || "/images/placeholder.png",
		[championInfo]
	);

	const championRegions = useMemo(() => {
		if (!championInfo?.regions) return [];
		return championInfo.regions
			.map(regionName => {
				const region = regionsData.find(r => r.name === regionName);
				return region
					? { name: regionName, icon: region.iconAbsolutePath }
					: null;
			})
			.filter(Boolean);
	}, [championInfo]);

	// === Tìm item đầy đủ ===
	const findFullItem = (list, name) => {
		const n = normalizeName(name);
		return list.find(item => item.name === n);
	};

	const fullArtifacts = useMemo(
		() =>
			(build?.artifacts || [])
				.map(a => findFullItem(relics, a))
				.filter(Boolean),
		[build?.artifacts, relics]
	);

	const fullPowers = useMemo(
		() =>
			(build?.powers || []).map(p => findFullItem(powers, p)).filter(Boolean),
		[build?.powers, powers]
	);

	const fullRunes = useMemo(
		() => (build?.rune || []).map(r => findFullItem(runes, r)).filter(Boolean),
		[build?.rune, runes]
	);

	// === Render Item (ĐÃ ĐỒNG BỘ) ===
	const RenderItem = ({ item }) => {
		if (!item) return null;

		const getLinkPath = item => {
			if (item.powerCode) return `/power/${encodeURIComponent(item.powerCode)}`;
			if (item.relicCode) return `/relic/${encodeURIComponent(item.relicCode)}`;
			if (item.runeCode) return `/rune/${encodeURIComponent(item.runeCode)}`;
			return "#";
		};

		const linkPath = getLinkPath(item);
		const imgSrc = item.assetAbsolutePath || "/images/placeholder.png";

		const content = (
			// Đồng bộ thẻ item
			<div className='flex items-start gap-4 p-3 bg-surface-hover rounded-md border border-border h-full hover:border-primary-500 transition-colors'>
				<SafeImage
					src={imgSrc}
					alt={item.name}
					className='w-12 h-12 rounded-md object-cover'
					onError={e => (e.target.src = "/images/placeholder.png")}
				/>
				<div className='flex-1'>
					<h3 className='font-semibold text-text-primary'>{item.name}</h3>
					{item.description && (
						<p
							className='text-sm text-text-secondary mt-1'
							dangerouslySetInnerHTML={{ __html: item.description }}
						/>
					)}
				</div>
			</div>
		);

		return linkPath !== "#" ? <Link to={linkPath}>{content}</Link> : content;
	};

	// === Loading & Error (ĐÃ ĐỒNG BỘ) ===
	if (loadingBuild || loadingData) {
		return (
			<div className='flex justify-center items-center h-64'>
				<p className='text-text-secondary'>Đang tải...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='text-center text-danger-text-dark mt-10'>
				<p>{error}</p>
				<Button
					variant='primary'
					onClick={() => navigate("/builds")}
					className='mt-4'
				>
					<ChevronLeft size={18} />
					Về danh sách build
				</Button>
			</div>
		);
	}

	if (!build) return null;

	// === Render chính (ĐÃ ĐỒNG BỘ) ===
	return (
		<div>
			<PageTitle
				title={`Bộ cổ vật ${build.championName}`}
				description={`POC GUIDE: Build bộ cổ vật (Relic) tối ưu tier S/A cho ${build.championName} Path of Champions. Combo Epic/Rare/Common mạnh nhất (Starforged Gauntlets, Death’s Foil, Guardian Orb, Loose Cannon's Payload...), hiệu ứng chi tiết, cách farm & equip relic đánh boss Galio/A.Sol dễ dàng!`}
				type='article'
			/>
			<div className='max-w-4xl mx-auto p-0 sm:p-6 text-text-primary font-secondary'>
				<Button variant='outline' onClick={() => navigate(-1)} className='mb-4'>
					<ChevronLeft size={18} />
					Quay lại
				</Button>

				<div className='bg-surface-bg rounded-lg shadow-primary-md overflow-hidden p-4 sm:p-6 border border-border'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row justify-between items-start gap-4 mb-6'>
						<div className='flex items-center gap-4'>
							<SafeImage
								src={championImage}
								alt={normalizeName(build.championName)}
								className='w-20 h-20 rounded-full border-4 border-icon-star object-cover'
							/>
							<div>
								<div className='flex items-center gap-2'>
									<h1 className='font-bold text-3xl text-text-primary font-primary'>
										{normalizeName(build.championName)}
									</h1>
									{championRegions.map(region => (
										<SafeImage
											key={region.name}
											src={region.icon}
											alt={region.name}
											title={region.name}
											className='w-6 h-6'
										/>
									))}
								</div>
								<p className='text-sm text-text-secondary'>
									Tạo bởi: {creatorDisplayName}
								</p>
								<div className='flex mt-2'>
									{[...Array(build.star || 0)].map((_, i) => (
										<Star
											key={i}
											size={20}
											className='text-icon-star'
											fill='currentColor'
										/>
									))}
									{[...Array(7 - (build.star || 0))].map((_, i) => (
										<Star
											key={i}
											size={20}
											className='text-border' // Dùng màu viền
										/>
									))}
								</div>
							</div>
						</div>

						<div className='flex items-center gap-2 sm:gap-4'>
							<button
								onClick={handleLike}
								disabled={isLiked}
								className={`flex items-center gap-2 p-2 rounded-lg transition-colors focus:outline-none ${
									isLiked
										? "text-primary-500 cursor-not-allowed"
										: "text-text-secondary hover:bg-surface-hover"
								}`}
								aria-label='Thích build này'
							>
								<ThumbsUp size={22} />
								<span className='font-semibold text-lg'>{likeCount}</span>
							</button>

							<button
								onClick={handleToggleFavorite}
								className={`p-2 rounded-full transition-colors focus:outline-none hover:bg-surface-hover ${
									isFavorite ? "text-danger-500" : "text-text-secondary"
								}`}
								aria-label='Yêu thích build này'
							>
								<Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
							</button>

							{isOwner && (
								<>
									<button
										onClick={() => setShowEditModal(true)}
										className='p-2 rounded-full transition-colors text-text-secondary hover:bg-surface-hover hover:text-warning'
										aria-label='Sửa build'
									>
										<Edit size={22} />
									</button>
									<button
										onClick={() => setBuildToDelete(build)}
										className='p-2 rounded-full transition-colors text-text-secondary hover:bg-surface-hover hover:text-danger-500'
										aria-label='Xóa build'
									>
										<Trash2 size={22} />
									</button>
								</>
							)}
						</div>
					</div>

					{/* Thánh tích */}
					{fullArtifacts.length > 0 && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Thánh tích
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{fullArtifacts.map((item, index) => (
									<RenderItem key={`${item.name}-${index}`} item={item} />
								))}
							</div>
						</div>
					)}

					{/* Ngọc bổ trợ */}
					{fullRunes.length > 0 && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Ngọc bổ trợ
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{fullRunes.map((item, index) => (
									<RenderItem key={`${item.name}-${index}`} item={item} />
								))}
							</div>
						</div>
					)}

					{/* Sức mạnh */}
					{fullPowers.length > 0 && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Sức mạnh
							</h2>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								{fullPowers.map((item, index) => (
									<RenderItem key={`${item.name}-${index}`} item={item} />
								))}
							</div>
						</div>
					)}
					{/* Ghi chú */}
					{build.description && (
						<div className='mb-6'>
							<h2 className='text-xl sm:text-2xl font-semibold mb-3 font-primary'>
								Ghi chú
							</h2>
							<p className='text-text-secondary italic bg-surface-hover p-3 rounded-md border-l-4 border-primary-500'>
								"{build.description}"
							</p>
						</div>
					)}
				</div>

				<CommentsSection buildId={build.id} />

				{/* Modal yêu cầu đăng nhập */}
				<Modal
					isOpen={showLoginModal}
					onClose={() => setShowLoginModal(false)}
					title='Yêu cầu đăng nhập'
				>
					<p className='text-text-secondary mb-6'>
						Bạn cần đăng nhập để thực hiện hành động này.
					</p>
					<div className='flex justify-end gap-4'>
						<Button variant='ghost' onClick={() => setShowLoginModal(false)}>
							Hủy
						</Button>
						<Button
							variant='primary'
							onClick={() => {
								setShowLoginModal(false);
								navigate("/login");
							}}
						>
							Đến trang đăng nhập
						</Button>
					</div>
				</Modal>

				{/* Modal sửa build */}
				{isOwner && (
					<BuildEditModal
						isOpen={showEditModal}
						onClose={() => setShowEditModal(false)}
						build={build}
						relicsList={relics}
						powersList={powers}
						runesList={runes}
						onBuildUpdate={handleBuildUpdate}
						onConfirm={handleBuildUpdate}
					/>
				)}

				{/* Modal xóa build */}
				{isOwner && (
					<BuildDelete
						isOpen={!!buildToDelete}
						onClose={() => setBuildToDelete(null)}
						build={buildToDelete}
						onBuildDelete={handleBuildDelete}
					/>
				)}
			</div>
		</div>
	);
};

export default BuildDetail;
