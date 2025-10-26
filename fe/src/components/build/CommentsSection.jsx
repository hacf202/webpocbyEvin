import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Edit, Trash2, MessageSquare } from "lucide-react";
import Modal from "../common/Modal";
import Button from "../common/Button";

// --- CommentForm Component ---
const CommentForm = ({
	buildId,
	onCommentPosted,
	parentId = null,
	replyToUsername = null,
	onCancel,
}) => {
	const { user, token } = useAuth();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const apiUrl = import.meta.env.VITE_API_URL;

	const handleSubmit = async e => {
		e.preventDefault();
		if (!content.trim()) return;
		if (!user) {
			setError("Bạn cần đăng nhập để bình luận.");
			return;
		}
		setIsSubmitting(true);
		setError("");
		try {
			const body = { content, parentId, replyToUsername };
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(body),
			});
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || "Không thể đăng bình luận");
			}
			const newComment = await res.json();
			onCommentPosted(newComment);
			setContent("");
			if (onCancel) onCancel();
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user && !parentId) {
		return (
			<p className='text-sm text-[var(--color-warning)] mb-4'>
				Vui lòng{" "}
				<Link
					to='/login'
					className='underline text-[var(--color-text-link)] hover:text-[var(--color-primary-hover)]'
				>
					đăng nhập
				</Link>{" "}
				để để lại bình luận.
			</p>
		);
	}

	return (
		<form onSubmit={handleSubmit} className='flex flex-col gap-2 mb-4'>
			<textarea
				value={content}
				onChange={e => setContent(e.target.value)}
				placeholder={
					replyToUsername
						? `Trả lời ${replyToUsername}...`
						: "Viết bình luận của bạn..."
				}
				className='w-full p-2 bg-[var(--color-background)] text-[var(--color-text-primary)] rounded-md border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent'
				rows={2}
				disabled={isSubmitting}
				autoFocus={!!parentId}
			/>
			{error && (
				<p className='text-sm text-[var(--color-danger)] mt-1'>{error}</p>
			)}
			<div className='flex justify-end gap-2'>
				{onCancel && (
					<Button
						variant='ghost'
						onClick={onCancel}
						disabled={isSubmitting}
						type='button'
					>
						Hủy
					</Button>
				)}
				<Button
					type='submit'
					variant='primary'
					disabled={isSubmitting || !content.trim()}
				>
					{isSubmitting ? "..." : "Gửi"}
				</Button>
			</div>
		</form>
	);
};

// --- CommentItem Component ---
const CommentItem = ({
	comment,
	onCommentDeleted,
	onCommentUpdated,
	onCommentPosted,
	buildId,
	replies = [],
	userDisplayNames, // Nhận map tên hiển thị
}) => {
	const { user, token } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isReplying, setIsReplying] = useState(false);
	const apiUrl = import.meta.env.VITE_API_URL;
	const isOwner = user && comment && user.sub === comment.user_sub;

	// Lấy tên hiển thị từ map, fallback về username
	const displayName = userDisplayNames[comment.username] || comment.username;
	const replyToDisplayName = comment.replyToUsername
		? userDisplayNames[comment.replyToUsername] || comment.replyToUsername
		: null;

	const handleDelete = async () => {
		if (!isOwner) return;
		setIsDeleting(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${buildId}/comments/${comment.id}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || "Không thể xóa bình luận");
			}
			onCommentDeleted(comment.id);
		} catch (error) {
			console.error("Error deleting comment:", error);
			alert(`Lỗi: ${error.message}`);
		} finally {
			setIsDeleting(false);
			setShowDeleteModal(false);
		}
	};

	const handleUpdate = async e => {
		e.preventDefault();
		if (!isOwner || !editContent.trim()) return;
		setIsUpdating(true);
		try {
			const res = await fetch(
				`${apiUrl}/api/builds/${buildId}/comments/${comment.id}`,
				{
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: editContent }),
				}
			);
			if (!res.ok) {
				const errData = await res.json();
				throw new Error(errData.error || "Không thể cập nhật bình luận");
			}
			const updatedComment = await res.json();
			onCommentUpdated(updatedComment);
			setIsEditing(false);
		} catch (error) {
			console.error("Error updating comment:", error);
			alert(`Lỗi: ${error.message}`);
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className='py-4 border-t border-[var(--color-border)] first:border-t-0'>
			<div className='flex justify-between items-start'>
				<div>
					<span className='font-semibold text-sm text-[var(--color-text-primary)]'>
						{displayName}
					</span>
					<span className='ml-2 text-xs text-[var(--color-text-secondary)]'>
						{new Date(comment.createdAt).toLocaleString()}
						{comment.updatedAt && " (đã sửa)"}
					</span>
				</div>
				{isOwner && (
					<div className='flex gap-2'>
						<button
							onClick={() => setIsEditing(!isEditing)}
							className='p-1 rounded text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] disabled:opacity-50'
							disabled={isDeleting || isUpdating || isReplying}
						>
							<Edit size={16} />
						</button>
						<button
							onClick={() => setShowDeleteModal(true)}
							className='p-1 rounded text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10 disabled:opacity-50'
							disabled={isDeleting || isUpdating}
						>
							<Trash2 size={16} />
						</button>
					</div>
				)}
			</div>

			{isEditing ? (
				<form onSubmit={handleUpdate} className='mt-2 flex flex-col gap-2'>
					<textarea
						value={editContent}
						onChange={e => setEditContent(e.target.value)}
						className='w-full p-2 bg-[var(--color-background)] text-[var(--color-text-primary)] rounded-md border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-primary)]'
						rows={2}
						autoFocus
					/>
					<div className='flex justify-end gap-2'>
						<Button
							variant='ghost'
							onClick={() => setIsEditing(false)}
							type='button'
						>
							Hủy
						</Button>
						<Button type='submit' variant='primary' disabled={isUpdating}>
							{isUpdating ? "..." : "Cập nhật"}
						</Button>
					</div>
				</form>
			) : (
				<p className='mt-1 text-sm text-[var(--color-text-secondary)]'>
					{replyToDisplayName && (
						<strong className='text-[var(--color-primary)] mr-1'>
							@{replyToDisplayName}
						</strong>
					)}
					{comment.content}
				</p>
			)}

			<div className='mt-2'>
				{!isReplying && (
					<Button
						variant='ghost'
						size='sm'
						onClick={() => setIsReplying(true)}
						disabled={isEditing}
					>
						<MessageSquare size={14} className='mr-1' /> Trả lời
					</Button>
				)}
				{isReplying && (
					<CommentForm
						buildId={buildId}
						onCommentPosted={comment => {
							onCommentPosted(comment);
							setIsReplying(false);
						}}
						parentId={comment.id}
						replyToUsername={comment.username}
						onCancel={() => setIsReplying(false)}
					/>
				)}
			</div>

			{replies.length > 0 && (
				<div className='ml-4 mt-4 pl-4 border-l-2 border-[var(--color-border)]'>
					{replies.map(reply => (
						<CommentItem
							key={reply.id}
							comment={reply}
							onCommentDeleted={onCommentDeleted}
							onCommentUpdated={onCommentUpdated}
							onCommentPosted={onCommentPosted}
							buildId={buildId}
							replies={[]} // Replies don't have nested replies in this view
							userDisplayNames={userDisplayNames}
						/>
					))}
				</div>
			)}

			<Modal
				isOpen={showDeleteModal}
				onClose={() => setShowDeleteModal(false)}
				title='Xác nhận xóa?'
			>
				<p className='mb-6 text-[var(--color-text-secondary)]'>
					Bạn có chắc chắn muốn xóa bình luận này không?
				</p>
				<div className='flex justify-end gap-4'>
					<Button
						variant='ghost'
						onClick={() => setShowDeleteModal(false)}
						disabled={isDeleting}
					>
						Hủy
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? "Đang xóa..." : "Xóa"}
					</Button>
				</div>
			</Modal>
		</div>
	);
};

// --- CommentsSection Component ---
const CommentsSection = ({ buildId }) => {
	const [comments, setComments] = useState([]);
	const [loadingComments, setLoadingComments] = useState(true);
	const [userDisplayNames, setUserDisplayNames] = useState({}); // State để lưu tên hiển thị
	const apiUrl = import.meta.env.VITE_API_URL;
	const { user } = useAuth();

	const fetchComments = useCallback(async () => {
		setLoadingComments(true);
		try {
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`);
			if (!res.ok) throw new Error("Không thể tải bình luận");
			const data = await res.json();
			setComments(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoadingComments(false);
		}
	}, [buildId, apiUrl]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	// Fetch display names for comment authors
	useEffect(() => {
		const fetchDisplayNames = async () => {
			if (comments.length === 0) return;

			// Lấy danh sách username duy nhất chưa có trong state
			const usernames = [
				...new Set(
					comments
						.map(c => c.username)
						.concat(comments.map(c => c.replyToUsername))
						.filter(Boolean)
				),
			];
			const usernamesToFetch = usernames.filter(
				name => !userDisplayNames[name]
			);

			if (user && !userDisplayNames[user.username]) {
				setUserDisplayNames(prev => ({ ...prev, [user.username]: user.name }));
			}
			if (usernamesToFetch.length === 0) return;

			// Gọi API cho từng username
			const namePromises = usernamesToFetch.map(async username => {
				try {
					const response = await fetch(`${apiUrl}/api/users/${username}`);
					if (response.ok) {
						const data = await response.json();
						return { username, name: data.name || username };
					}
					return { username, name: username }; // Fallback
				} catch {
					return { username, name: username }; // Fallback
				}
			});

			const results = await Promise.all(namePromises);

			// Cập nhật state với tên mới
			setUserDisplayNames(prev => {
				const newNames = { ...prev };
				results.forEach(({ username, name }) => {
					newNames[username] = name;
				});
				return newNames;
			});
		};

		fetchDisplayNames();
	}, [comments, apiUrl, user]);

	const nestedComments = useMemo(() => {
		const commentMap = {};
		comments.forEach(
			comment => (commentMap[comment.id] = { ...comment, replies: [] })
		);
		const result = [];
		comments.forEach(comment => {
			if (comment.parentId && commentMap[comment.parentId]) {
				commentMap[comment.parentId].replies.push(commentMap[comment.id]);
			} else {
				result.push(commentMap[comment.id]);
			}
		});
		return result;
	}, [comments]);

	const handleCommentPosted = newComment => {
		setComments(prev => [...prev, newComment]);
	};
	const handleCommentDeleted = commentId =>
		setComments(prev => {
			const childrenOfDeleted = prev
				.filter(c => c.parentId === commentId)
				.map(c => c.id);
			return prev.filter(
				c => c.id !== commentId && !childrenOfDeleted.includes(c.id)
			);
		});
	const handleCommentUpdated = updated =>
		setComments(prev => prev.map(c => (c.id === updated.id ? updated : c)));

	return (
		<div className='mt-8'>
			<h2 className='text-xl sm:text-3xl font-semibold m-5 text-center'>
				Bình luận ({comments.filter(c => !c.parentId).length})
			</h2>
			<div className='bg-[var(--color-surface)] rounded-lg shadow-[var(--color-build-summary-shadow)] overflow-hidden p-4 sm:p-6 border border-[var(--color-border)]'>
				<CommentForm buildId={buildId} onCommentPosted={handleCommentPosted} />
				<div>
					{loadingComments && (
						<div className='text-center py-4 text-[var(--color-text-secondary)]'>
							Đang tải bình luận...
						</div>
					)}
					{!loadingComments && comments.length === 0 && (
						<p className='text-center text-sm text-[var(--color-text-secondary)] py-4'>
							Chưa có bình luận nào.
						</p>
					)}
					{!loadingComments &&
						nestedComments.length > 0 &&
						nestedComments.map(comment => (
							<CommentItem
								key={comment.id}
								comment={comment}
								replies={comment.replies}
								onCommentDeleted={handleCommentDeleted}
								onCommentUpdated={handleCommentUpdated}
								onCommentPosted={handleCommentPosted}
								buildId={buildId}
								userDisplayNames={userDisplayNames}
							/>
						))}
				</div>
			</div>
		</div>
	);
};

export default CommentsSection;
