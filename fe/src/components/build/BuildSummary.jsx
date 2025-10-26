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
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal";
import Button from "../common/Button";
import BuildDelete from "./BuildDelete";
import BuildEditModal from "./BuildEditModal";

const MAX_HEIGHT = 500;

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
	const contentRef = useRef(null);

	const [isOverflowing, setIsOverflowing] = useState(false);
	const [isExpanded, setIsExpanded] = useState(false);
	const [likeCount, setLikeCount] = useState(build.like || 0);
	const [isLiked, setIsLiked] = useState(false);
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoriteList, setFavoriteList] = useState(build.favorite || []);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [buildToDelete, setBuildToDelete] = useState(null);
	const [buildToEdit, setBuildToEdit] = useState(null);
	const [creatorDisplayName, setCreatorDisplayName] = useState(build.creator);

	useEffect(() => {
		const element = contentRef.current;
		const checkOverflow = () => {
			if (element) {
				setIsOverflowing(element.scrollHeight > MAX_HEIGHT);
			}
		};
		const resizeObserver = new ResizeObserver(checkOverflow);
		if (element) {
			resizeObserver.observe(element);
		}
		return () => {
			if (element) {
				resizeObserver.unobserve(element);
			}
		};
	}, [build]);

	useEffect(() => {
		const likedInSession = sessionStorage.getItem(`liked_${build.id}`);
		if (likedInSession) setIsLiked(true);
	}, [build.id]);

	useEffect(() => {
		setIsFavorite(user && favoriteList.includes(user.sub));
	}, [user, favoriteList]);

	useEffect(() => {
		const handleClickOutside = event => {
			if (menuRef.current && !menuRef.current.contains(event.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Lấy tên hiển thị của người tạo
	useEffect(() => {
		const fetchCreatorName = async () => {
			// Nếu build là của người dùng hiện tại, sử dụng tên đã có
			if (user && build.sub === user.sub) {
				setCreatorDisplayName(user.name || build.creator);
				return;
			}
			// Nếu không có thông tin người tạo, hiển thị mặc định
			if (!build.creator) {
				setCreatorDisplayName("Vô danh");
				return;
			}
			// Gọi API để lấy tên hiển thị
			try {
				const response = await fetch(`${apiUrl}/api/users/${build.creator}`);
				if (response.ok) {
					const data = await response.json();
					setCreatorDisplayName(data.name || build.creator);
				} else {
					setCreatorDisplayName(build.creator); // Fallback về username nếu có lỗi
				}
			} catch (error) {
				console.error("Failed to fetch creator name:", error);
				setCreatorDisplayName(build.creator); // Fallback về username nếu có lỗi mạng
			}
		};

		fetchCreatorName();
	}, [build.creator, build.sub, user, apiUrl]);

	const isOwner = useMemo(
		() => user && build.sub === user.sub,
		[user, build.sub]
	);

	// Hàm xử lý điều hướng
	const handleNavigate = () => {
		navigate(`/builds/${build.id}`);
	};

	const handleLike = async e => {
		e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
		if (isLiked) return;
		try {
			const res = await fetch(`${apiUrl}/api/builds/${build.id}/like`, {
				method: "PATCH",
			});
			if (res.ok) {
				const updatedBuild = await res.json();
				setLikeCount(updatedBuild.like);
				setIsLiked(true);
				sessionStorage.setItem(`liked_${build.id}`, "true");
				if (onBuildUpdate) onBuildUpdate(updatedBuild);
			}
		} catch (error) {
			console.error("Error liking build:", error);
		}
	};

	const handleToggleFavorite = async e => {
		e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
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
				const updatedBuild = await res.json();
				setFavoriteList(updatedBuild.favorite);
				if (onBuildUpdate) onBuildUpdate(updatedBuild);
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	const handleEdit = e => {
		e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
		setBuildToEdit(build);
		setIsMenuOpen(false);
	};

	const handleConfirmEdit = updatedBuild => {
		if (onBuildUpdate) {
			onBuildUpdate(updatedBuild);
		}
		setBuildToEdit(null);
	};

	const handleDeleteClick = e => {
		e.stopPropagation(); // Ngăn sự kiện click lan ra ngoài
		setBuildToDelete(build);
		setIsMenuOpen(false);
	};

	const handleConfirmDelete = deletedBuildId => {
		if (onBuildDelete) {
			onBuildDelete(deletedBuildId);
		}
		setBuildToDelete(null);
	};

	const normalizeName = val =>
		val && typeof val === "object" ? val.S || "" : String(val || "");

	const findImage = (list, name) =>
		list.find(item => item?.name === normalizeName(name))?.assetAbsolutePath ||
		null;

	const championImage = useMemo(() => {
		const championName = normalizeName(build?.championName);
		return Array.isArray(championsList)
			? championsList.find(c => c?.name === championName)?.assets?.[0]?.M
					?.avatar?.S || "/images/placeholder.png"
			: "/images/placeholder.png";
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

	const renderImageWithTooltip = (name, src, buildId, type, index) => {
		const key = `${buildId}-${type}-${normalizeName(name)}-${index}`;
		return (
			<div key={key} className='group relative'>
				<img
					src={src || "/images/placeholder.png"}
					alt={normalizeName(name)}
					className='w-10 h-10 rounded-md border-2 border-[var(--color-border)]'
					onError={e => {
						e.target.onerror = null;
						e.target.src = "/images/placeholder.png";
					}}
				/>
				<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-[var(--color-text-primary)] text-[var(--color-background)] text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
					{normalizeName(name)}
				</div>
			</div>
		);
	};

	return (
		<>
			<div
				style={style}
				onClick={handleNavigate}
				className='relative bg-[var(--color-build-summary-bg)] border-2 border-[var(--color-build-summary-border)] rounded-lg shadow-md hover:shadow-[0_8px_24px_var(--color-build-summary-shadow)] hover:-translate-y-1 hover:border-[var(--color-build-summary-hover-border)] transition-all duration-300 flex flex-col cursor-pointer'
			>
				<div
					ref={contentRef}
					className={`relative transition-all duration-500 ease-in-out ${
						!isExpanded && isOverflowing ? "overflow-hidden" : ""
					}`}
					style={{
						maxHeight:
							!isExpanded && isOverflowing ? `${MAX_HEIGHT}px` : "none",
					}}
				>
					<div className='p-4 flex flex-col gap-3'>
						{/* Header */}
						<div className='flex items-start justify-between'>
							{/* Left side: Champion Info */}
							<div className='flex items-center gap-3'>
								<img
									src={championImage}
									alt={normalizeName(build.championName)}
									className='w-16 h-16 rounded-full border-4 border-[var(--color-border)]'
								/>
								<div>
									<h3 className='font-bold text-lg text-[var(--color-text-primary)]'>
										{normalizeName(build.championName)}
									</h3>
									<div onClick={e => e.stopPropagation()}>
										<p className='text-xs text-[var(--color-text-secondary)]'>
											Tạo bởi: {creatorDisplayName || "Vô danh"}
										</p>
									</div>
								</div>
							</div>

							{/* Right side: Stats and Menu */}
							<div className='flex flex-col items-end gap-1'>
								{/* Top Row: Buttons */}
								<div className='flex items-center gap-4'>
									{/* Like Button & Count */}
									<div
										className='flex items-center gap-1.5 text-[var(--color-text-secondary)]'
										onClick={e => e.stopPropagation()}
									>
										<button
											onClick={handleLike}
											disabled={isLiked}
											className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] ${
												isLiked
													? "text-[var(--color-primary)] cursor-not-allowed"
													: "hover:bg-[var(--color-border)]"
											}`}
											aria-label='Thích build này'
										>
											<ThumbsUp size={20} />
										</button>
										<span className='font-semibold text-lg'>{likeCount}</span>
									</div>
									{/* More Options Menu */}
									<div
										className='relative'
										ref={menuRef}
										onClick={e => e.stopPropagation()}
									>
										<button
											onClick={() => setIsMenuOpen(!isMenuOpen)}
											className='p-1.5 rounded-full hover:bg-[var(--color-border)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-text-secondary)]'
											aria-label='Thêm tùy chọn'
										>
											<MoreVertical
												size={22}
												className='text-[var(--color-text-secondary)]'
											/>
										</button>
										{isMenuOpen && (
											<div className='absolute top-full right-0 mt-2 w-48 bg-[var(--color-background)] border border-[var(--color-border)] rounded-md shadow-lg z-10'>
												<button
													onClick={handleToggleFavorite}
													className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors'
												>
													<Heart
														size={18}
														className={`transition-all ${
															isFavorite
																? "text-[var(--color-danger)] fill-current"
																: ""
														}`}
													/>
													<span>
														{isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
													</span>
												</button>
												{build.hasOwnProperty("display") && (
													<div className='flex items-center gap-3 px-4 py-2 text-sm text-[var(--color-text-secondary)]'>
														{build.display ? (
															<Eye size={18} className='text-green-500' />
														) : (
															<EyeOff
																size={18}
																className='text-[var(--color-danger)]'
															/>
														)}
														<span>
															{build.display ? "Công khai" : "Riêng tư"}
														</span>
													</div>
												)}
												{isOwner && (
													<>
														<div className='border-t border-[var(--color-border)] my-1'></div>
														<button
															onClick={handleEdit}
															className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] transition-colors'
														>
															<Edit size={18} />
															<span>Sửa</span>
														</button>
														<button
															onClick={handleDeleteClick}
															className='w-full flex items-center gap-3 px-4 py-2 text-left text-sm text-[var(--color-danger)] hover:bg-[var(--color-surface)] transition-colors'
														>
															<Trash2 size={18} />
															<span>Xóa</span>
														</button>
													</>
												)}
											</div>
										)}
									</div>
								</div>

								{/* Bottom Row: Stars */}
								<div className='flex'>
									{[1, 2, 3, 4, 5, 6, 7].map(starValue => (
										<Star
											key={starValue}
											size={18}
											className={`transition-colors ${
												build.star >= starValue
													? "text-[var(--color-star)]"
													: "text-[var(--color-text-primary)]"
											}`}
											fill={build.star >= starValue ? "currentColor" : "none"}
										/>
									))}
								</div>
							</div>
						</div>

						{/* Build Details */}
						<div className='flex flex-col gap-3'>
							{Array.isArray(build.artifacts) && build.artifacts.length > 0 && (
								<div>
									<p className='text-[var(--color-text-primary)] text-sm font-semibold mb-1'>
										Thánh tích:
									</p>
									<div className='flex flex-wrap gap-2'>
										{build.artifacts.map((a, i) =>
											renderImageWithTooltip(
												a,
												artifactImages[i],
												build.id,
												"artifact",
												i
											)
										)}
									</div>
								</div>
							)}
							{Array.isArray(build.rune) && build.rune.length > 0 && (
								<div>
									<p className='text-[var(--color-text-primary)] text-sm font-semibold mb-1'>
										Ngọc bổ trợ:
									</p>
									<div className='flex flex-wrap gap-2'>
										{build.rune.map((r, i) =>
											renderImageWithTooltip(
												r,
												runeImages[i],
												build.id,
												"rune",
												i
											)
										)}
									</div>
								</div>
							)}
							{Array.isArray(build.powers) && build.powers.length > 0 && (
								<div>
									<p className='text-[var(--color-text-primary)] text-sm font-semibold mb-1'>
										Sức mạnh:
									</p>
									<div className='flex flex-wrap gap-2'>
										{build.powers.map((p, i) =>
											renderImageWithTooltip(
												p,
												powerImages[i],
												build.id,
												"power",
												i
											)
										)}
									</div>
								</div>
							)}
						</div>

						{/* Description */}
						{build.description && (
							<p className='text-[var(--color-text-secondary)] text-sm mt-4 italic'>
								"{build.description}"
							</p>
						)}
					</div>

					{!isExpanded && isOverflowing && (
						<div className='absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-[var(--color-build-summary-bg)] to-transparent pointer-events-none' />
					)}
				</div>

				{isOverflowing && (
					<div
						className='w-full text-center py-2 border-t border-[var(--color-build-summary-border)]'
						onClick={e => e.stopPropagation()}
					>
						<button
							onClick={() => setIsExpanded(!isExpanded)}
							className='font-semibold text-[var(--color-primary)] hover:underline text-sm'
						>
							{isExpanded ? "Ẩn bớt" : "Hiển thị thêm"}
						</button>
					</div>
				)}
			</div>

			{/* Các Modal không thay đổi */}
			<Modal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				title='Yêu cầu đăng nhập'
			>
				<p className='text-[var(--color-text-secondary)] mb-6'>
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
