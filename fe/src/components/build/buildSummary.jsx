// src/components/build/BuildSummary.jsx
import React, { memo, useMemo, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
	Star,
	Eye,
	EyeOff,
	Heart,
	ThumbsUp,
	MoreVertical,
	Edit,
	Trash2,
	ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import Modal from "../common/modal";
import Button from "../common/button";
import BuildDelete from "./buildDelete";
import BuildEditModal from "./buildEditModal";
import SafeImage from "../common/SafeImage.jsx";

const DESCRIPTION_MAX_HEIGHT = 80; // ~4 dòng

const BuildSummary = ({
	build,
	championsList = [],
	relicsList = [],
	powersList = [],
	runesList = [],
	style,
	onBuildUpdate,
	onBuildDelete,
}) => {
	const { user, token } = useAuth();
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL;
	const menuRef = useRef(null);
	const descriptionRef = useRef(null);

	const [isDescriptionOverflowing, setIsDescriptionOverflowing] =
		useState(false);
	const [likeCount, setLikeCount] = useState(build.like || 0);
	const [isLiked, setIsLiked] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoriteList, setFavoriteList] = useState(build.favorite || []);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);
	const [buildToEdit, setBuildToEdit] = useState(null);
	const [creatorDisplayName, setCreatorDisplayName] = useState(build.creator);

	// === Kiểm tra overflow mô tả ===
	useEffect(() => {
		const element = descriptionRef.current;
		if (!element || !build.description) {
			setIsDescriptionOverflowing(false);
			return;
		}

		const checkOverflow = () => {
			setIsDescriptionOverflowing(
				element.scrollHeight > DESCRIPTION_MAX_HEIGHT
			);
		};

		const resizeObserver = new ResizeObserver(checkOverflow);
		resizeObserver.observe(element);
		checkOverflow(); // Gọi ngay lập tức

		return () => resizeObserver.disconnect();
	}, [build.description]);

	// === Like / Favorite / Menu / Creator ===
	useEffect(() => {
		const liked = sessionStorage.getItem(`liked_${build.id}`);
		if (liked) setIsLiked(true);
	}, [build.id]);

	useEffect(() => {
		setIsFavorite(user && favoriteList.includes(user.sub));
	}, [user, favoriteList]);

	useEffect(() => {
		const handleClickOutside = e => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		const fetchCreatorName = async () => {
			if (user && build.sub === user.sub) {
				setCreatorDisplayName(user.name || build.creator);
				return;
			}
			if (!build.creator) {
				setCreatorDisplayName("Vô danh");
				return;
			}
			try {
				const res = await fetch(`${apiUrl}/api/users/${build.creator}`);
				if (res.ok) {
					const data = await res.json();
					setCreatorDisplayName(data.name || build.creator);
				} else {
					setCreatorDisplayName(build.creator);
				}
			} catch (err) {
				console.error("Lỗi lấy tên:", err);
				setCreatorDisplayName(build.creator);
			}
		};
		fetchCreatorName();
	}, [build.creator, build.sub, user, apiUrl]);

	const isOwner = useMemo(
		() => user && build.sub === user.sub,
		[user, build.sub]
	);

	// === Xem chi tiết ===
	const handleViewDetail = e => {
		e.stopPropagation();
		navigate(`/builds/${build.id}`);
	};

	// === Like ===
	const handleLike = async e => {
		e.stopPropagation();
		if (isLiked) return;
		try {
			const res = await fetch(`${apiUrl}/api/builds/${build.id}/like`, {
				method: "PATCH",
			});
			if (res.ok) {
				const updated = await res.json();
				setLikeCount(updated.like);
				setIsLiked(true);
				sessionStorage.setItem(`liked_${build.id}`, "true");
				onBuildUpdate?.(updated);
			}
		} catch (err) {
			console.error("Lỗi like:", err);
		}
	};

	// === Yêu thích ===
	const handleToggleFavorite = async e => {
		e.stopPropagation();
		if (!user) {
			setShowLoginModal(true);
			return;
		}
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
				onBuildUpdate?.(updated);
			}
		} catch (err) {
			console.error("Lỗi yêu thích:", err);
		}
	};

	// === Sửa / Xóa ===
	const handleEdit = e => {
		e.stopPropagation();
		setBuildToEdit(build);
		setIsMenuOpen(false);
	};

	const handleDeleteClick = e => {
		e.stopPropagation();
		setBuildToDelete(build);
		setIsMenuOpen(false);
	};

	const handleConfirmEdit = updated => {
		onBuildUpdate?.(updated);
		setBuildToEdit(null);
	};

	const handleConfirmDelete = id => {
		onBuildDelete?.(id);
		setBuildToDelete(null);
	};

	// === Helper: normalize & find image ===
	const normalizeName = val =>
		val && typeof val === "object" ? val.S || "" : String(val || "");
	const findImage = (list, name) =>
		list.find(item => item?.name === normalizeName(name))?.assetAbsolutePath ||
		null;

	const championImage = useMemo(() => {
		const name = normalizeName(build?.championName);
		return (
			championsList.find(c => c?.name === name)?.assets?.[0]?.M?.avatar?.S ||
			"/fallback-image.svg"
		);
	}, [championsList, build?.championName]);

	const artifactImages = useMemo(
		() => (build.artifacts || []).map(a => findImage(relicsList, a)),
		[relicsList, build.artifacts]
	);
	const powerImages = useMemo(
		() => (build.powers || []).map(p => findImage(powersList, p)),
		[powersList, build.powers]
	);
	const runeImages = useMemo(
		() => (build.rune || []).map(r => findImage(runesList, r)),
		[runesList, build.rune]
	);

	const renderImageWithTooltip = (name, src, type, index) => {
		const key = `${build.id}-${type}-${normalizeName(name)}-${index}`;
		return (
			<div key={key} className='group relative'>
				<SafeImage
					src={src || "/fallback-image.svg"}
					alt={normalizeName(name)}
					// Đồng bộ thẻ
					className='w-16 h-16 rounded-md border-2 border-border object-cover'
				/>
				{/* Đồng bộ tooltip */}
				<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10'>
					{normalizeName(name)}
				</div>
			</div>
		);
	};

	return (
		<>
			<div
				style={style}
				// Đồng bộ thẻ: sử dụng bg-surface-bg, border-border, và shadow-primary-md
				className='bg-surface-bg border-2 border-border rounded-lg shadow-md 
        hover:shadow-primary-md hover:-translate-y-1 hover:border-primary-500 
        transition-all duration-300 flex flex-col cursor-pointer overflow-hidden'
				onClick={() => navigate(`/builds/${build.id}`)}
			>
				<div className='p-5 flex flex-col gap-4'>
					{/* Header */}
					<div className='flex items-start justify-between'>
						<div className='flex items-center gap-3'>
							<SafeImage
								src={championImage}
								alt={normalizeName(build.championName)}
								className='w-16 h-16 rounded-full object-cover border-2 border-border'
							/>
							<div>
								<h3 className='font-bold text-lg text-text-primary'>
									{normalizeName(build.championName)}
								</h3>
								<p className='text-sm text-text-secondary'>
									Tạo bởi:{" "}
									<span className='font-medium'>{creatorDisplayName}</span>
								</p>
							</div>
						</div>

						{/* Actions */}
						<div className='flex flex-col items-end gap-1'>
							<div className='flex items-center gap-4'>
								{/* Like */}
								<div
									className='flex items-center gap-1.5 text-text-secondary'
									onClick={e => e.stopPropagation()}
								>
									<button
										onClick={handleLike}
										disabled={isLiked}
										className={`p-1.5 rounded-full transition-colors ${
											isLiked
												? "text-primary-500 cursor-not-allowed"
												: "hover:bg-surface-hover"
										}`}
									>
										<ThumbsUp size={20} />
									</button>
									<span className='font-semibold text-lg'>{likeCount}</span>
								</div>

								{/* Menu */}
								<div
									className='relative'
									ref={menuRef}
									onClick={e => e.stopPropagation()}
								>
									<button
										onClick={() => setIsMenuOpen(!isMenuOpen)}
										className='p-1.5 rounded-full hover:bg-surface-hover transition-colors'
									>
										<MoreVertical size={22} className='text-text-secondary' />
									</button>
									{isMenuOpen && (
										// Đồng bộ dropdown menu
										<div className='absolute top-full right-0 mt-2 w-48 bg-surface-bg border border-border rounded-md shadow-lg z-20'>
											<button
												onClick={handleToggleFavorite}
												className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover transition-colors'
											>
												<Heart
													size={18}
													className={`transition-all ${
														isFavorite ? "text-danger-500 fill-danger-500" : ""
													}`}
												/>
												<span>{isFavorite ? "Bỏ yêu thích" : "Yêu thích"}</span>
											</button>
											{build.hasOwnProperty("display") && (
												<div className='flex items-center gap-3 px-4 py-2 text-sm text-text-secondary'>
													{build.display ? (
														<Eye size={18} className='text-success' />
													) : (
														<EyeOff size={18} className='text-danger-500' />
													)}
													<span>
														{build.display ? "Công khai" : "Riêng tư"}
													</span>
												</div>
											)}
											{isOwner && (
												<>
													<div className='border-t border-border my-1'></div>
													<button
														onClick={handleEdit}
														className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-text-secondary hover:bg-surface-hover'
													>
														<Edit size={18} /> <span>Sửa</span>
													</button>
													<button
														onClick={handleDeleteClick}
														className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-danger-500 hover:bg-surface-hover'
													>
														<Trash2 size={18} /> <span>Xóa</span>
													</button>
												</>
											)}
										</div>
									)}
								</div>
							</div>

							{/* Stars */}
							<div className='flex mt-1'>
								{[1, 2, 3, 4, 5, 6, 7].map(s => (
									<Star
										key={s}
										size={18}
										className={`transition-colors ${
											build.star >= s ? "text-icon-star" : "text-text-secondary"
										}`}
										fill={build.star >= s ? "currentColor" : "none"}
									/>
								))}
							</div>
						</div>
					</div>

					{/* Nội dung */}
					<div className='flex flex-col gap-3'>
						{build.artifacts?.length > 0 && (
							<div>
								<p className='text-text-primary font-semibold mb-1'>
									Thánh tích:
								</p>
								<div className='flex flex-wrap gap-2'>
									{build.artifacts.map((a, i) =>
										renderImageWithTooltip(a, artifactImages[i], "artifact", i)
									)}
								</div>
							</div>
						)}
						{build.rune?.length > 0 && (
							<div>
								<p className='text-text-primary font-semibold mb-1'>
									Ngọc bổ trợ:
								</p>
								<div className='flex flex-wrap gap-2'>
									{build.rune.map((r, i) =>
										renderImageWithTooltip(r, runeImages[i], "rune", i)
									)}
								</div>
							</div>
						)}
						{build.powers?.length > 0 && (
							<div>
								<p className='text-text-primary font-semibold mb-1'>
									Sức mạnh:
								</p>
								<div className='flex flex-wrap gap-2'>
									{build.powers.map((p, i) =>
										renderImageWithTooltip(p, powerImages[i], "power", i)
									)}
								</div>
							</div>
						)}
					</div>

					{/* Mô tả + Xem thêm... */}
					{build.description && (
						<div className='relative'>
							<p
								ref={descriptionRef}
								className='text-text-secondary text-sm italic mt-2 line-clamp-none'
								style={{
									maxHeight: DESCRIPTION_MAX_HEIGHT,
									overflow: "hidden",
								}}
							>
								"{build.description}"
							</p>

							{/* Hiệu ứng mờ + Xem thêm */}
							{isDescriptionOverflowing && (
								<div className='absolute bottom-0 left-0 right-0 h-8' />
							)}

							{isDescriptionOverflowing && (
								<button
									onClick={handleViewDetail}
									className='inline-flex items-center gap-1 text-primary-500 hover:underline text-sm font-medium mt-1'
								>
									Xem thêm...
									<ChevronRight size={14} />
								</button>
							)}
						</div>
					)}
				</div>
			</div>

			{/* Modal đăng nhập */}
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
						Đăng nhập
					</Button>
				</div>
			</Modal>

			<BuildDelete
				isOpen={!!buildToDelete}
				onClose={() => setBuildToDelete(null)}
				build={buildToDelete}
				onConfirm={handleConfirmDelete}
			/>

			<BuildEditModal
				isOpen={!!buildToEdit}
				onClose={() => setBuildToEdit(null)}
				build={buildToEdit}
				onConfirm={handleConfirmEdit}
			/>
		</>
	);
};

export default memo(BuildSummary);
