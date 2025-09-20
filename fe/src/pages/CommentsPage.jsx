import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

function CommentsPage() {
	const { user, token } = useContext(AuthContext);
	const [comments, setComments] = useState([]);
	const [filteredComments, setFilteredComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [sortOrder, setSortOrder] = useState("desc");
	const [filterCreator, setFilterCreator] = useState("");
	const [filterChampion, setFilterChampion] = useState("");
	const [searchContent, setSearchContent] = useState("");
	const [newComment, setNewComment] = useState("");
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editContent, setEditContent] = useState("");
	const [deletingCommentId, setDeletingCommentId] = useState(null);

	useEffect(() => {
		const fetchAllComments = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_API_URL}/api/all-comments`
				);
				const data = await response.json();
				if (response.ok) {
					setComments(data.items || []);
					setFilteredComments(data.items || []);
				} else {
					setError(data.error || "Không thể tải bình luận");
				}
			} catch (err) {
				setError("Lỗi kết nối server");
			} finally {
				setLoading(false);
			}
		};
		fetchAllComments();
	}, []);

	useEffect(() => {
		let tempComments = [...comments];

		if (filterCreator) {
			tempComments = tempComments.filter(comment =>
				comment.creator.toLowerCase().includes(filterCreator.toLowerCase())
			);
		}

		if (filterChampion) {
			tempComments = tempComments.filter(comment =>
				comment.championName
					.toLowerCase()
					.includes(filterChampion.toLowerCase())
			);
		}

		if (searchContent) {
			tempComments = tempComments.filter(comment =>
				comment.content.toLowerCase().includes(searchContent.toLowerCase())
			);
		}

		tempComments.sort((a, b) => {
			const dateA = new Date(a.createdAt);
			const dateB = new Date(b.createdAt);
			return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
		});

		setFilteredComments(tempComments);
	}, [comments, sortOrder, filterCreator, filterChampion, searchContent]);

	const handleCommentSubmit = async e => {
		e.preventDefault();
		if (!newComment.trim()) {
			setError("Bình luận không được để trống");
			return;
		}

		if (!token) {
			setError("Vui lòng đăng nhập để bình luận");
			return;
		}

		const payload = {
			championName: "",
			content: newComment,
		};

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
			if (response.ok) {
				setComments([...comments, data.comment]);
				setNewComment("");
				setError(null);
			} else {
				setError(data.error || "Không thể gửi bình luận");
			}
		} catch (err) {
			setError("Lỗi kết nối server");
		}
	};

	const handleEditComment = async commentid => {
		if (!editContent.trim()) {
			setError("Bình luận không được để trống");
			return;
		}

		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments/${commentid}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: editContent }),
				}
			);
			const data = await response.json();
			if (response.ok) {
				setComments(
					comments.map(comment =>
						comment.commentid === commentid ? data.comment : comment
					)
				);
				setEditingCommentId(null);
				setEditContent("");
				setError(null);
			} else {
				setError(data.error || "Không thể cập nhật bình luận");
			}
		} catch (err) {
			setError("Lỗi kết nối server");
		}
	};

	const handleDeleteComment = async commentid => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments/${commentid}`,
				{
					method: "DELETE",
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			const data = await response.json();
			if (response.ok) {
				setComments(
					comments.filter(comment => comment.commentid !== commentid)
				);
				setError(null);
			} else {
				setError(data.error || "Không thể xóa bình luận");
			}
		} catch (err) {
			setError("Lỗi kết nối server");
		} finally {
			setDeletingCommentId(null);
		}
	};

	const startEditing = comment => {
		setEditingCommentId(comment.commentid);
		setEditContent(comment.content);
	};

	const cancelEditing = () => {
		setEditingCommentId(null);
		setEditContent("");
		setError(null);
	};

	const startDeleting = commentid => {
		setDeletingCommentId(commentid);
	};

	const cancelDeleting = () => {
		setDeletingCommentId(null);
		setError(null);
	};

	if (loading) {
		return (
			<div className='text-center text-white text-lg py-4'>
				Đang tải bình luận...
			</div>
		);
	}

	if (error) {
		return <div className='text-center text-red-500 text-lg py-4'>{error}</div>;
	}

	return (
		<div className='p-4 sm:p-6 bg-gray-900 text-white min-h-screen'>
			<h1 className='text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center sm:text-left'>
				Tất cả bình luận
			</h1>
			<div className='mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 flex-wrap'>
				<input
					type='text'
					placeholder='Lọc theo người tạo'
					value={filterCreator}
					onChange={e => setFilterCreator(e.target.value)}
					className='p-2 bg-gray-800 text-white rounded w-full sm:w-auto flex-grow'
				/>
				<input
					type='text'
					placeholder='Lọc theo tướng'
					value={filterChampion}
					onChange={e => setFilterChampion(e.target.value)}
					className='p-2 bg-gray-800 text-white rounded w-full sm:w-auto flex-grow'
				/>
				<input
					type='text'
					placeholder='Tìm nội dung bình luận'
					value={searchContent}
					onChange={e => setSearchContent(e.target.value)}
					className='p-2 bg-gray-800 text-white rounded w-full sm:w-auto flex-grow'
				/>
				<select
					value={sortOrder}
					onChange={e => setSortOrder(e.target.value)}
					className='p-2 bg-gray-800 text-white rounded w-full sm:w-auto'
				>
					<option value='desc'>Mới nhất trước</option>
					<option value='asc'>Cũ nhất trước</option>
				</select>
			</div>
			<div className='mb-4 sm:mb-6'>
				{user ? (
					<div className='mb-4'>
						<form onSubmit={handleCommentSubmit}>
							<textarea
								className='w-full p-3 bg-gray-800 text-white rounded-md text-sm sm:text-base resize-y'
								rows='4'
								value={newComment}
								onChange={e => setNewComment(e.target.value)}
								placeholder='Viết bình luận của bạn...'
							></textarea>
							{error && <p className='text-red-500 mt-2 text-sm'>{error}</p>}
							<button
								type='submit'
								className='mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base w-full sm:w-auto'
							>
								Gửi bình luận
							</button>
						</form>
					</div>
				) : (
					<p className='text-yellow-400 mb-4 text-sm sm:text-base text-center sm:text-left'>
						Vui lòng{" "}
						<Link to='/login' className='underline text-blue-400'>
							đăng nhập
						</Link>{" "}
						để bình luận.
					</p>
				)}
			</div>
			{filteredComments.length > 0 ? (
				<div className='flex flex-col gap-4'>
					{filteredComments.map(comment => (
						<div key={comment.commentid} className='p-4 bg-gray-800 rounded-lg'>
							{editingCommentId === comment.commentid ? (
								<div>
									<textarea
										className='w-full p-3 bg-gray-900 text-white rounded-md text-sm sm:text-base resize-y mb-2'
										rows='4'
										value={editContent}
										onChange={e => setEditContent(e.target.value)}
									></textarea>
									<div className='flex gap-2 flex-wrap'>
										<button
											onClick={() => handleEditComment(comment.commentid)}
											className='px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm sm:text-base'
										>
											Lưu
										</button>
										<button
											onClick={cancelEditing}
											className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm sm:text-base'
										>
											Hủy
										</button>
									</div>
								</div>
							) : deletingCommentId === comment.commentid ? (
								<div>
									<p className='text-red-400 mb-2 text-sm sm:text-base'>
										Bạn có chắc muốn xóa bình luận này?
									</p>
									<div className='flex gap-2 flex-wrap'>
										<button
											onClick={() => handleDeleteComment(comment.commentid)}
											className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base'
										>
											Xác nhận
										</button>
										<button
											onClick={cancelDeleting}
											className='px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm sm:text-base'
										>
											Hủy
										</button>
									</div>
								</div>
							) : (
								<div>
									<p className='font-bold text-sm sm:text-base'>
										{comment.creator}
									</p>
									<p className='text-sm sm:text-base'>{comment.content}</p>
									<p className='text-xs sm:text-sm text-gray-400'>
										{new Date(comment.createdAt).toLocaleString("vi-VN")}
										{comment.isEdited && " (Bình luận này đã được chỉnh sửa)"}
									</p>
									<p className='text-xs sm:text-sm text-blue-400'>
										Tướng: {comment.championName || "Không có tướng"}
									</p>
									{user && user.username === comment.creator && (
										<div className='flex gap-2 mt-2 flex-wrap'>
											<button
												onClick={() => startEditing(comment)}
												className='px-3 py-1 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm sm:text-base'
											>
												Sửa
											</button>
											<button
												onClick={() => startDeleting(comment.commentid)}
												className='px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm sm:text-base'
											>
												Xóa
											</button>
										</div>
									)}
								</div>
							)}
						</div>
					))}
				</div>
			) : (
				<p className='text-sm sm:text-base text-center'>
					Chưa có bình luận nào.
				</p>
			)}
		</div>
	);
}

export default CommentsPage;
