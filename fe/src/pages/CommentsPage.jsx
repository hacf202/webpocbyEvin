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
					const sortedComments = (data.items || []).sort(
						(a, b) => new Date(b.createdAt) - new Date(a.createdAt)
					);
					setComments(sortedComments);
					setFilteredComments(sortedComments);
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
		let result = [...comments];
		if (searchContent) {
			result = result.filter(c =>
				c.content.toLowerCase().includes(searchContent.toLowerCase())
			);
		}
		if (filterCreator) {
			result = result.filter(c =>
				c.creator.toLowerCase().includes(filterCreator.toLowerCase())
			);
		}
		if (filterChampion) {
			result = result.filter(
				c =>
					c.championName &&
					c.championName.toLowerCase().includes(filterChampion.toLowerCase())
			);
		}
		result.sort((a, b) =>
			sortOrder === "desc"
				? new Date(b.createdAt) - new Date(a.createdAt)
				: new Date(a.createdAt) - new Date(b.createdAt)
		);
		setFilteredComments(result);
	}, [searchContent, filterCreator, filterChampion, sortOrder, comments]);

	const startEditing = comment => {
		setEditingCommentId(comment.commentid);
		setEditContent(comment.content);
	};

	const cancelEditing = () => {
		setEditingCommentId(null);
		setEditContent("");
	};

	const handleEditSubmit = async commentId => {
		if (!editContent.trim()) {
			alert("Bình luận không được để trống.");
			return;
		}
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments/update/${commentId}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: editContent }),
				}
			);
			if (response.ok) {
				const updatedComment = await response.json();
				setComments(
					comments.map(c =>
						c.commentid === commentId
							? { ...c, content: updatedComment.content, isEdited: true }
							: c
					)
				);
				cancelEditing();
			} else {
				alert("Lỗi khi cập nhật bình luận.");
			}
		} catch (error) {
			alert("Lỗi kết nối khi cập nhật bình luận.");
		}
	};

	const startDeleting = commentId => {
		if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
			handleDelete(commentId);
		}
	};

	const handleDelete = async commentId => {
		try {
			const response = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments/delete/${commentId}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (response.ok) {
				setComments(comments.filter(c => c.commentid !== commentId));
			} else {
				alert("Lỗi khi xóa bình luận.");
			}
		} catch (error) {
			alert("Lỗi kết nối khi xóa bình luận.");
		}
	};

	if (loading) return <p className='text-center'>Đang tải bình luận...</p>;
	if (error)
		return <p className='text-center text-[var(--color-danger)]'>{error}</p>;

	return (
		<div className='max-w-4xl mx-auto'>
			<h1 className='text-3xl sm:text-5xl font-bold text-center mb-8'>
				Tất cả bình luận
			</h1>
			<div className='p-4 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)] mb-8'>
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
					<input
						type='text'
						placeholder='Tìm theo nội dung...'
						value={searchContent}
						onChange={e => setSearchContent(e.target.value)}
						className='p-2 rounded-md bg-white border border-[var(--color-border)] w-full'
					/>
					<input
						type='text'
						placeholder='Lọc theo người tạo...'
						value={filterCreator}
						onChange={e => setFilterCreator(e.target.value)}
						className='p-2 rounded-md bg-white border border-[var(--color-border)] w-full'
					/>
					<input
						type='text'
						placeholder='Lọc theo tướng...'
						value={filterChampion}
						onChange={e => setFilterChampion(e.target.value)}
						className='p-2 rounded-md bg-white border border-[var(--color-border)] w-full'
					/>
					<select
						value={sortOrder}
						onChange={e => setSortOrder(e.target.value)}
						className='p-2 rounded-md bg-white border border-[var(--color-border)] w-full'
					>
						<option value='desc'>Mới nhất</option>
						<option value='asc'>Cũ nhất</option>
					</select>
				</div>
			</div>

			<div className='space-y-4'>
				{filteredComments.map(comment => (
					<div
						key={comment.commentid}
						className='bg-[var(--color-surface)] p-4 rounded-lg border border-[var(--color-border)]'
					>
						{editingCommentId === comment.commentid ? (
							<div>
								<textarea
									value={editContent}
									onChange={e => setEditContent(e.target.value)}
									className='w-full p-2 rounded-md bg-white border border-[var(--color-border)] mb-2'
									rows='3'
								></textarea>
								<div className='flex gap-2'>
									<button
										onClick={() => handleEditSubmit(comment.commentid)}
										className='px-3 py-1 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-hover)] text-sm'
									>
										Lưu
									</button>
									<button
										onClick={cancelEditing}
										className='px-3 py-1 bg-gray-300 text-black rounded-md hover:bg-gray-400 text-sm'
									>
										Hủy
									</button>
								</div>
							</div>
						) : (
							<div>
								<p className='font-bold text-base'>{comment.creator}</p>
								<p className='text-base my-1'>{comment.content}</p>
								<p className='text-xs text-[var(--color-text-secondary)]'>
									{new Date(comment.createdAt).toLocaleString("vi-VN")}
									{comment.isEdited && " (đã sửa)"}
								</p>
								{comment.championName && (
									<p className='text-xs text-[var(--color-text-link)] mt-1'>
										Trong bài:{" "}
										<Link
											to={`/champion/${encodeURIComponent(
												comment.championName
											)}`}
											className='hover:underline'
										>
											{comment.championName}
										</Link>
									</p>
								)}
								{user && user.username === comment.creator && (
									<div className='flex gap-2 mt-2'>
										<button
											onClick={() => startEditing(comment)}
											className='px-3 py-1 bg-[var(--color-warning)] text-black rounded-md text-sm font-semibold'
										>
											Sửa
										</button>
										<button
											onClick={() => startDeleting(comment.commentid)}
											className='px-3 py-1 bg-[var(--color-danger)] text-white rounded-md hover:bg-[var(--color-danger-hover)] text-sm font-semibold'
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
		</div>
	);
}

export default CommentsPage;
