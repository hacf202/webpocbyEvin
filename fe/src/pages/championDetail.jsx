import { memo, useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import championsData from "../assets/data/champions.json";
import iconRegions from "../assets/data/iconRegions.json";
import powers from "../assets/data/powers-vi_vn.json";
import items from "../assets/data/items-vi_vn.json";
import relics from "../assets/data/relics-vi_vn.json";
import championVideoLinks from "../assets/data/linkChampionVideo.json";

function findRegionIconLink(regionIcon) {
	const item = iconRegions.find(item => item.name === regionIcon);
	return item?.iconAbsolutePath || "/images/default-icon.png";
}

function findPower(powerIcon) {
	const item = powers.find(item => item.name === powerIcon);
	return item?.assetFullAbsolutePath || "/images/placeholder.png";
}

function findItem(itemIcon) {
	const item = items.find(item => item.name === itemIcon);
	return item?.assetAbsolutePath || "/images/placeholder.png";
}

function findRelic(relicIcon) {
	const item = relics.find(item => item.name === relicIcon);
	return item?.assetAbsolutePath || "/images/placeholder.png";
}

function getPowerCode(name) {
	const power = powers.find(p => p.name === name);
	return power ? power.powerCode : "";
}

function getItemCode(name) {
	const item = items.find(i => i.name === name);
	return item ? item.itemCode : "";
}

function getRelicCode(name) {
	const relic = relics.find(r => r.name === name);
	return relic ? relic.relicCode : "";
}

function ChampionDetail() {
	const { name } = useParams();
	const { user, token } = useContext(AuthContext);
	const champion = championsData.find(champ => champ.name === name);
	const [comments, setComments] = useState([]);
	const [newComment, setNewComment] = useState("");
	const [error, setError] = useState(null);

	// Fetch comments
	useEffect(() => {
		const fetchComments = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/comments/${name}`
				);
				const data = await response.json();
				if (response.ok) {
					setComments(data.items || []);
				} else {
					setError(data.error || "Không thể tải bình luận");
				}
			} catch (err) {
				setError("Lỗi kết nối server");
			}
		};
		fetchComments();
	}, [name]);

	// Handle comment submission
	const handleCommentSubmit = async e => {
		e.preventDefault();
		if (!newComment.trim()) {
			setError("Bình luận không được để trống");
			return;
		}

		if (!token) {
			setError("Vui lòng đăng nhập để bình luận");
			console.error("No token available in AuthContext");
			return;
		}

		const payload = {
			championName: name,
			content: newComment,
		};
		console.log("Sending comment payload:", payload);
		console.log("Token sent:", token);

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(payload),
				}
			);
			const data = await response.json();
			console.log("Server response:", data);
			if (response.ok) {
				setComments([...comments, data.comment]);
				setNewComment("");
				setError(null);
			} else {
				setError(data.error || "Không thể gửi bình luận");
			}
		} catch (err) {
			console.error("Fetch error:", err);
			setError("Lỗi kết nối server");
		}
	};

	// Handle click to scroll to top
	const handleLinkClick = () => {
		window.scrollTo(0, 0);
	};

	if (!champion) {
		return (
			<div className='p-4 sm:p-6 text-white'>
				Không tìm thấy thông tin tướng. Name: {name}
			</div>
		);
	}

	const videoLink =
		championVideoLinks.find(video => video.name === name)?.link ||
		"https://www.youtube.com/embed/dQw4w9WgXcQ";

	return (
		<div className='relative mx-auto max-w-[1200px] p-4 sm:p-6 bg-gray-900 rounded-lg mt-10 text-white'>
			<div className='flex flex-col md:flex-row gap-4 bg-gray-800 rounded-md'>
				<img
					className='h-auto max-h-[200px] sm:max-h-[300px] object-contain rounded-lg'
					src={
						champion.assets[0]?.M.gameAbsolutePath.S ||
						"/images/placeholder.png"
					}
					alt={champion.name || "Unknown Champion"}
					loading='lazy'
				/>
				<div className='flex-1'>
					<div className='flex flex-col sm:flex-row sm:justify-between bg-gray-700 rounded-lg px-2'>
						<div className='flex flex-col sm:flex-row sm:items-center sm:gap-4'>
							<div className='text-2xl sm:text-4xl font-bold m-1'>
								{champion.name}
							</div>
						</div>
						<div className='flex flex-row'>
							<div className='text-2xl sm:text-4xl font-bold m-1'>
								MAX STAR: {champion.maxStar}
							</div>
							<div className='gap-2'>
								{champion.regions && champion.regions.length > 0 && (
									<div className='gap-2 flex'>
										{champion.regions.map((region, index) => (
											<img
												className='w-8 sm:w-12'
												key={index}
												src={findRegionIconLink(region)}
												alt={region}
												loading='lazy'
											/>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
					{champion.description && (
						<p className='text-base sm:text-xl mt-4 mx-1 bg-gray-700 rounded-lg overflow-y-auto h-60 p-2'>
							{champion.description}
						</p>
					)}
				</div>
			</div>

			<h2 className='text-xl sm:text-3xl font-semibold mt-6'>
				Video giới thiệu
			</h2>
			<div>
				<h3 className='text-sm sm:text-lg font-semibold my-1'>
					Đăng ký kênh Evin LoR tại:{" "}
					<a
						href='https://www.youtube.com/@Evin0126/'
						target='_blank'
						className='underline text-blue-400'
						rel='noopener noreferrer'
					>
						https://www.youtube.com/@Evin0126/
					</a>
				</h3>
				<div className='flex justify-center mb-6 p-4 bg-gray-800 aspect-video'>
					<iframe
						width='100%'
						height='100%'
						src={videoLink}
						title='YouTube video player'
						frameBorder='0'
						allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
						referrerPolicy='strict-origin-when-cross-origin'
						allowFullScreen
					></iframe>
				</div>
			</div>

			<h2 className='text-xl sm:text-3xl font-semibold pl-1 m-5'>Chòm sao</h2>
			{champion.powerStars && champion.powerStars.length > 0 && (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-700 rounded-md p-4'>
					{champion.powerStars.map((power, index) => {
						const powerCode = getPowerCode(power.S);
						return powerCode ? (
							<Link
								key={index}
								to={`/power/${encodeURIComponent(powerCode)}`}
								onClick={handleLinkClick}
							>
								<img
									className='w-full max-w-[360px] h-auto hover:opacity-75 transition'
									src={findPower(power.S)}
									alt={power.S}
									loading='lazy'
								/>
							</Link>
						) : (
							<img
								className='w-full max-w-[360px] h-auto'
								key={index}
								src={findPower(power.S)}
								alt={power.S}
								loading='lazy'
							/>
						);
					})}
				</div>
			)}

			<h2 className='text-xl sm:text-3xl font-semibold m-5'>
				Sức mạnh khuyên dùng
			</h2>
			{champion.adventurePowers && champion.adventurePowers.length > 0 && (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 bg-gray-700 rounded-md p-4'>
					{champion.adventurePowers.map((power, index) => {
						const powerCode = getPowerCode(power.S);
						return powerCode ? (
							<Link
								key={index}
								to={`/power/${encodeURIComponent(powerCode)}`}
								onClick={handleLinkClick}
							>
								<img
									className='w-full max-w-[360px] h-auto hover:opacity-75 transition'
									src={findPower(power.S)}
									alt={power.S}
									loading='lazy'
								/>
							</Link>
						) : (
							<img
								className='w-full max-w-[360px] h-auto'
								key={index}
								src={findPower(power.S)}
								alt={power.S}
								loading='lazy'
							/>
						);
					})}
				</div>
			)}

			<h2 className='text-xl sm:text-3xl font-semibold m-5'>
				Vật phẩm khuyên dùng
			</h2>
			{champion.defaultItems && champion.defaultItems.length > 0 && (
				<div className='grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 bg-gray-700 rounded-md p-4'>
					{champion.defaultItems.map((item, index) => {
						const itemCode = getItemCode(item.S);
						return itemCode ? (
							<Link
								key={index}
								to={`/item/${encodeURIComponent(itemCode)}`}
								onClick={handleLinkClick}
							>
								<img
									className='w-full max-w-[120px] h-auto hover:opacity-75 transition'
									src={findItem(item.S)}
									alt={item.S}
									loading='lazy'
								/>
							</Link>
						) : (
							<img
								className='w-full max-w-[120px] h-auto'
								key={index}
								src={findItem(item.S)}
								alt={item.S}
								loading='lazy'
							/>
						);
					})}
				</div>
			)}

			<h2 className='text-xl sm:text-3xl font-semibold m-5'>Bộ cổ vật</h2>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 bg-gray-700 rounded-md p-4'>
				{[1, 2, 3, 4, 5, 6].map(set => (
					<div
						className='bg-gray-600 rounded-2xl m-1 w-full sm:w-auto'
						key={set}
					>
						<h3 className='text-base sm:text-xl font-semibold ml-3'>
							Bộ cổ vật {set}
						</h3>
						{champion[`defaultRelicsSet${set}`] &&
							champion[`defaultRelicsSet${set}`].length > 0 && (
								<div className='grid grid-cols-3 sm:grid-cols-3 gap-1 p-1'>
									{champion[`defaultRelicsSet${set}`].map((relic, index) => {
										const relicCode = getRelicCode(relic.S);
										return relicCode ? (
											<Link
												key={index}
												to={`/relic/${encodeURIComponent(relicCode)}`}
												onClick={handleLinkClick}
											>
												<img
													className='w-full max-w-[110px] h-auto hover:opacity-75 transition'
													src={findRelic(relic.S)}
													alt={relic.S}
													loading='lazy'
												/>
											</Link>
										) : (
											<img
												className='w-full max-w-[110px] h-auto'
												key={index}
												src={findRelic(relic.S)}
												alt={relic.S}
												loading='lazy'
											/>
										);
									})}
								</div>
							)}
					</div>
				))}
			</div>

			<h2 className='text-xl sm:text-3xl font-semibold m-5'>Bình luận</h2>
			<div className='bg-gray-700 rounded-md p-4'>
				{user ? (
					<div className='mb-4'>
						<form onSubmit={handleCommentSubmit}>
							<textarea
								className='w-full p-2 bg-gray-800 text-white rounded-md'
								rows='4'
								value={newComment}
								onChange={e => setNewComment(e.target.value)}
								placeholder='Viết bình luận của bạn...'
							></textarea>
							{error && <p className='text-red-500 mt-2'>{error}</p>}
							<button
								type='submit'
								className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700'
							>
								Gửi bình luận
							</button>
						</form>
					</div>
				) : (
					<p className='text-yellow-400 mb-4'>
						Vui lòng{" "}
						<Link to='/login' className='underline text-blue-400'>
							đăng nhập
						</Link>{" "}
						để bình luận.
					</p>
				)}
				<div>
					{comments.length > 0 ? (
						comments.map(comment => (
							<div
								key={comment.commentid}
								className='border-b border-gray-600 py-2'
							>
								<p className='font-semibold'>{comment.creator}</p>
								<p>{comment.content}</p>
								<p className='text-sm text-gray-400'>
									{new Date(comment.createdAt).toLocaleString("vi-VN")}
								</p>
							</div>
						))
					) : (
						<p>Chưa có bình luận nào.</p>
					)}
				</div>
			</div>
		</div>
	);
}

export default memo(ChampionDetail);
