import React, { memo, useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Star, Eye, EyeOff, Heart, ThumbsUp } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Modal from "../common/Modal";
import Button from "../common/Button";

const BuildSummary = ({
	build,
	championsList = [],
	relicsList = [],
	powersList = [],
	runesList = [],
	style,
	onBuildUpdate, // Callback to update the build in the parent list
}) => {
	const { user, token } = useAuth();
	const navigate = useNavigate();
	const apiUrl = import.meta.env.VITE_API_URL;

	// State for Like functionality
	const [likeCount, setLikeCount] = useState(build.like || 0);
	const [isLiked, setIsLiked] = useState(false);

	// State for Favorite functionality
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoriteList, setFavoriteList] = useState(build.favorite || []);

	// State for modals and UI
	const [showLoginModal, setShowLoginModal] = useState(false);

	// Check if the build was already liked in the current session
	useEffect(() => {
		const likedInSession = sessionStorage.getItem(`liked_${build.id}`);
		if (likedInSession) {
			setIsLiked(true);
		}
	}, [build.id]);

	// Check if the current user has favorited this build
	useEffect(() => {
		if (user && favoriteList.includes(user.sub)) {
			setIsFavorite(true);
		} else {
			setIsFavorite(false);
		}
	}, [user, favoriteList]);

	const isOwner = useMemo(
		() => user && build.sub === user.sub,
		[user, build.sub]
	);

	const creatorDisplayName = isOwner
		? user.name || build.creator
		: build.creator;

	const handleLike = async e => {
		e.stopPropagation();
		if (isLiked) return; // Prevent multiple likes in the same session

		try {
			const response = await fetch(`${apiUrl}/api/builds/${build.id}/like`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (response.ok) {
				const updatedBuild = await response.json();
				setLikeCount(updatedBuild.like);
				setIsLiked(true);
				sessionStorage.setItem(`liked_${build.id}`, "true");
				if (onBuildUpdate) {
					onBuildUpdate(updatedBuild);
				}
			} else {
				console.error("Failed to like the build");
			}
		} catch (error) {
			console.error("Error liking build:", error);
		}
	};

	const handleToggleFavorite = async e => {
		e.stopPropagation();

		if (!user) {
			setShowLoginModal(true);
			return;
		}

		try {
			const response = await fetch(
				`${apiUrl}/api/builds/${build.id}/favorite`,
				{
					method: "PATCH",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const updatedBuild = await response.json();
				setFavoriteList(updatedBuild.favorite);
				if (onBuildUpdate) {
					onBuildUpdate(updatedBuild);
				}
			} else {
				console.error("Failed to update favorite status");
			}
		} catch (error) {
			console.error("Error toggling favorite:", error);
		}
	};

	const normalizeName = val => {
		if (!val) return "";
		if (typeof val === "string") return val;
		if (typeof val === "object" && val !== null && "S" in val)
			return val.S || "";
		return String(val); // Fallback
	};

	const championImage = useMemo(() => {
		const championName = normalizeName(build?.championName);
		const champion = Array.isArray(championsList)
			? championsList.find(champ => champ?.name === championName)
			: null;
		return champion?.assets?.[0]?.M?.avatar?.S || "/images/placeholder.png";
	}, [championsList, build?.championName]);

	const findImage = (list, name) => {
		const normalized = normalizeName(name);
		return (
			list.find(item => item?.name === normalized)?.assetAbsolutePath || null
		);
	};

	const artifactImages = useMemo(
		() =>
			(build.artifacts || []).map(artifact => findImage(relicsList, artifact)),
		[relicsList, build.artifacts]
	);
	const powerImages = useMemo(
		() => (build.powers || []).map(power => findImage(powersList, power)),
		[powersList, build.powers]
	);
	const runeImages = useMemo(
		() => (build.rune || []).map(rune => findImage(runesList, rune)),
		[runesList, build.rune]
	);

	const renderImageWithTooltip = (name, src, buildId, type, index) => {
		const key = `${buildId}-${type}-${name}-${index}`;
		const normalizedName = normalizeName(name);
		if (!src) {
			return (
				<div
					key={key}
					className='w-10 h-10 bg-gray-700 border-2 border-gray-500 rounded-md flex items-center justify-center'
					title={normalizedName}
				>
					<span className='text-xs text-red-400'>?</span>
				</div>
			);
		}
		return (
			<div key={key} className='group relative'>
				<img
					src={src}
					alt={normalizedName}
					className='w-10 h-10 rounded-md border-2 border-gray-500'
					onError={e => {
						e.target.onerror = null;
						e.target.src = "/images/placeholder.png";
					}}
				/>
				<div className='absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'>
					{normalizedName}
				</div>
			</div>
		);
	};

	return (
		<>
			<div
				style={style}
				className='relative bg-gray-800 border-2 border-gray-700 p-4 rounded-lg shadow-lg hover:border-yellow-500 transition-colors duration-200 flex flex-col gap-3'
			>
				<div className='flex items-start justify-between'>
					<div className='flex items-center gap-3'>
						<img
							src={championImage}
							alt={normalizeName(build.championName)}
							className='w-16 h-16 rounded-full border-4 border-gray-600'
						/>
						<div>
							<h3 className='font-bold text-lg text-white'>
								{normalizeName(build.championName)}
							</h3>
							<p className='text-xs text-gray-400'>
								Tạo bởi: {creatorDisplayName || "Vô danh"}
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						{/* Like Button and Count */}
						<div className='flex items-center gap-1.5 text-gray-300'>
							<button
								onClick={handleLike}
								disabled={isLiked}
								className={`p-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
									isLiked
										? "text-cyan-400 cursor-not-allowed"
										: "hover:bg-gray-700"
								}`}
								aria-label='Thích build này'
							>
								<ThumbsUp size={20} />
							</button>
							<span className='font-semibold text-lg'>{likeCount}</span>
						</div>

						{/* Favorite Button */}
						<button
							onClick={handleToggleFavorite}
							className='p-1.5 rounded-full hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500'
							aria-label='Thêm vào yêu thích'
						>
							<Heart
								size={22}
								className={`transition-all duration-300 ${
									isFavorite
										? "text-red-500 fill-current"
										: "text-gray-400 hover:text-red-400"
								}`}
							/>
						</button>
						{build.hasOwnProperty("display") && (
							<div
								className={`text-xs ${
									build.display ? "text-green-400" : "text-red-400"
								}`}
								title={build.display ? "Công khai" : "Riêng tư"}
							>
								{build.display ? <Eye size={18} /> : <EyeOff size={18} />}
							</div>
						)}
					</div>
				</div>
				{/* Rest of the component remains the same */}
				<div className='flex flex-col gap-3'>
					{Array.isArray(build.artifacts) && build.artifacts.length > 0 && (
						<div>
							<p className='text-gray-300 text-sm font-semibold mb-1'>
								Thánh tích:
							</p>
							<div className='flex flex-wrap gap-2'>
								{build.artifacts.map((artifact, index) =>
									renderImageWithTooltip(
										artifact,
										artifactImages[index],
										build.id,
										"artifact",
										index
									)
								)}
							</div>
						</div>
					)}
					{Array.isArray(build.rune) && build.rune.length > 0 && (
						<div>
							<p className='text-gray-300 text-sm font-semibold mb-1'>
								Ngọc bổ trợ:
							</p>
							<div className='flex flex-wrap gap-2'>
								{build.rune.map((rune, index) =>
									renderImageWithTooltip(
										rune,
										runeImages[index],
										build.id,
										"rune",
										index
									)
								)}
							</div>
						</div>
					)}
					{Array.isArray(build.powers) && build.powers.length > 0 && (
						<div>
							<p className='text-gray-300 text-sm font-semibold mb-1'>
								Sức mạnh:
							</p>
							<div className='flex flex-wrap gap-2'>
								{build.powers.map((power, index) =>
									renderImageWithTooltip(
										power,
										powerImages[index],
										build.id,
										"power",
										index
									)
								)}
							</div>
						</div>
					)}
				</div>
				{build.description && (
					<p className='text-gray-400 text-sm mt-4 italic'>
						"{build.description}"
					</p>
				)}
			</div>
			{/* Login Modal */}
			<Modal
				isOpen={showLoginModal}
				onClose={() => setShowLoginModal(false)}
				title='Yêu cầu đăng nhập'
			>
				<p className='text-gray-300 mb-6'>
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
		</>
	);
};

export default memo(BuildSummary);
