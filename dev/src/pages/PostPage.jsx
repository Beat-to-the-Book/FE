import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { communityAPI } from "../lib/api/community";
import { authAPI } from "../lib/api/auth";
import useAuthStore from "../lib/store/authStore";

const PostPage = () => {
	const { groupId, postId } = useParams();
	const navigate = useNavigate();
	const [post, setPost] = useState(null);
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [editedContent, setEditedContent] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const { isAuthenticated, userInfo, userId, setUserInfo } = useAuthStore();
	const [isMyPost, setIsMyPost] = useState(false);
 	const [comments, setComments] = useState([]);
 	const [commentsLoading, setCommentsLoading] = useState(false);
 	const [commentsError, setCommentsError] = useState("");
 	const [newComment, setNewComment] = useState("");
 	const [activeReplyId, setActiveReplyId] = useState(null);
 	const [replyContents, setReplyContents] = useState({});
 	const [editingCommentId, setEditingCommentId] = useState(null);
 	const [editingCommentContent, setEditingCommentContent] = useState("");

	const currentUserId = userInfo?.userId ?? userId ?? null;
	const currentUsername = userInfo?.username ?? null;

	const fetchComments = useCallback(async () => {
		if (!groupId || !postId) return;
		setCommentsLoading(true);
		setCommentsError("");
		try {
			const response = await communityAPI.getCommentsTree(groupId, postId);
			setComments(response.data || []);
		} catch (error) {
			console.error("댓글 로딩 실패:", error);
			setCommentsError("댓글을 불러오는데 실패했습니다.");
		} finally {
			setCommentsLoading(false);
		}
	}, [groupId, postId]);

	const loadPost = useCallback(async () => {
		try {
			const response = await communityAPI.getPost(groupId, postId);
			setPost(response.data);
			setEditedTitle(response.data.title);
			setEditedContent(response.data.content);
			updateOwnership(response.data);
		} catch (error) {
			console.error("게시글 로딩 실패:", error);
		}
	}, [groupId, postId]);

	useEffect(() => {
		loadPost();
	}, [groupId, postId, loadPost]);

	useEffect(() => {
		fetchComments();
	}, [fetchComments]);

	useEffect(() => {
		const ensureUserInfo = async () => {
			if (!isAuthenticated || userInfo) {
				return;
			}
			try {
				const response = await authAPI.getMe();
				const data = response.data?.data ?? response.data;
				if (data) {
					setUserInfo(data);
				}
			} catch (error) {
				console.error("사용자 정보 조회 실패:", error);
			}
		};

		ensureUserInfo();
	}, [isAuthenticated, userInfo, setUserInfo]);

	const extractOwnerInfo = (postData) => {
		if (!postData) {
			return { ownerId: null, ownerUsername: null };
		}

		const ownerId =
			postData.userId ??
			postData.authorId ??
			postData.createdBy ??
			postData.user?.id ??
			postData.user?.userId ??
			null;

		const ownerUsername =
			postData.userName ??
			postData.username ??
			postData.authorName ??
			postData.authorUsername ??
			postData.user?.username ??
			postData.user?.name ??
			null;

		return {
			ownerId: ownerId !== undefined && ownerId !== null ? String(ownerId) : null,
			ownerUsername: ownerUsername ? String(ownerUsername).trim() : null,
		};
	};

	const updateOwnership = (postData) => {
		const { ownerId, ownerUsername } = extractOwnerInfo(postData);
		const normalizedCurrentId = currentUserId !== null && currentUserId !== undefined ? String(currentUserId) : null;
		const normalizedCurrentUsername = currentUsername ? String(currentUsername).trim() : null;

		const matchesId = ownerId && normalizedCurrentId && ownerId === normalizedCurrentId;
		const matchesName =
			ownerUsername && normalizedCurrentUsername && ownerUsername === normalizedCurrentUsername;

		setIsMyPost(matchesId || matchesName);
	};

	const isMyComment = useCallback(
		(comment) => {
			const commentOwnerId =
				comment.userId !== undefined && comment.userId !== null ? String(comment.userId) : null;
			const commentOwnerUsername = comment.username ? String(comment.username).trim() : null;
			const normalizedCurrentId =
				currentUserId !== null && currentUserId !== undefined ? String(currentUserId) : null;
			const normalizedCurrentUsername = currentUsername ? String(currentUsername).trim() : null;
			return (
				(!!commentOwnerId && !!normalizedCurrentId && commentOwnerId === normalizedCurrentId) ||
				(!!commentOwnerUsername && !!normalizedCurrentUsername && commentOwnerUsername === normalizedCurrentUsername)
			);
		},
		[currentUserId, currentUsername]
	);

	useEffect(() => {
		if (post) {
			updateOwnership(post);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUserId, currentUsername]);

	const handleUpdate = async () => {
		if (!editedTitle.trim() || !editedContent.trim()) {
			alert("제목과 내용을 모두 입력해주세요.");
			return;
		}

		try {
			await communityAPI.updatePost(groupId, postId, {
				title: editedTitle.trim(),
				content: editedContent.trim(),
			});
			setIsEditing(false);
			loadPost();
		} catch (error) {
			console.error("게시글 수정 실패:", error);
			alert("게시글 수정에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleDelete = async () => {
		try {
			await communityAPI.deletePost(groupId, postId);
			navigate(`/community/${groupId}`);
		} catch (error) {
			console.error("게시글 삭제 실패:", error);
			alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleAddComment = async () => {
		const content = newComment.trim();
		if (!content) {
			alert("댓글 내용을 입력해주세요.");
			return;
		}
		if (!isAuthenticated) {
			alert("댓글을 작성하려면 로그인해야 합니다.");
			return;
		}
		try {
			await communityAPI.createComment(groupId, postId, { content });
			setNewComment("");
			await fetchComments();
		} catch (error) {
			console.error("댓글 작성 실패:", error);
			alert("댓글 작성에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleReplyClick = (commentId) => {
		if (activeReplyId === commentId) {
			setActiveReplyId(null);
			setReplyContents((prev) => {
				const updated = { ...prev };
				delete updated[commentId];
				return updated;
			});
		} else {
			setActiveReplyId(commentId);
			setReplyContents((prev) => ({ ...prev, [commentId]: prev[commentId] || "" }));
		}
	};

	const handleReplyChange = (commentId, value) => {
		setReplyContents((prev) => ({ ...prev, [commentId]: value }));
	};

	const handleReplySubmit = async (commentId) => {
		if (!isAuthenticated) {
			alert("댓글을 작성하려면 로그인해야 합니다.");
			return;
		}
		const content = (replyContents[commentId] || "").trim();
		if (!content) {
			alert("댓글 내용을 입력해주세요.");
			return;
		}
		try {
			await communityAPI.createReply(groupId, postId, {
				parentId: commentId,
				content,
			});
			setReplyContents((prev) => {
				const updated = { ...prev };
				delete updated[commentId];
				return updated;
			});
			setActiveReplyId(null);
			await fetchComments();
		} catch (error) {
			console.error("대댓글 작성 실패:", error);
			alert("대댓글 작성에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleEditComment = (commentId, content) => {
		setEditingCommentId(commentId);
		setEditingCommentContent(content || "");
	};

	const handleCancelEditComment = () => {
		setEditingCommentId(null);
		setEditingCommentContent("");
	};

	const handleUpdateComment = async (commentId) => {
		const content = editingCommentContent.trim();
		if (!content) {
			alert("댓글 내용을 입력해주세요.");
			return;
		}
		try {
			await communityAPI.updateComment(groupId, postId, commentId, { content });
			setEditingCommentId(null);
			setEditingCommentContent("");
			await fetchComments();
		} catch (error) {
			console.error("댓글 수정 실패:", error);
			alert("댓글 수정에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleDeleteComment = async (commentId) => {
		if (!window.confirm("정말로 이 댓글을 삭제하시겠습니까?")) {
			return;
		}
		try {
			await communityAPI.deleteComment(groupId, postId, commentId);
			await fetchComments();
		} catch (error) {
			console.error("댓글 삭제 실패:", error);
			alert("댓글 삭제에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const renderComment = useCallback(
		(comment, depth = 0) => {
			const { id, username, content, children = [], createdAt, updatedAt, deleted, edited } = comment;
			const isOwner = isMyComment(comment);
			const displayDate = createdAt ? new Date(createdAt).toLocaleString("ko-KR") : "";
			const updatedDate = updatedAt && updatedAt !== createdAt ? new Date(updatedAt).toLocaleString("ko-KR") : null;
			const isReplyBoxOpen = activeReplyId === id;
			const replyValue = replyContents[id] || "";
			const isEditingThisComment = editingCommentId === id;

			return (
				<div key={id} className='border-l border-gray-100 pl-4 ml-4 mt-6'>
					<div className='bg-gray-50 rounded-xl p-4 shadow-sm'>
						<div className='flex items-start justify-between gap-4'>
							<div>
								<div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
									<span>{username || "알 수 없는 사용자"}</span>
									{edited && <span className='text-xs text-primary'>수정됨</span>}
								</div>
								<div className='text-xs text-gray-400 mt-1'>
									{displayDate}
									{updatedDate && <span className='ml-2'>(수정: {updatedDate})</span>}
								</div>
							</div>
							{!deleted && (
								<div className='flex items-center gap-2 text-xs text-gray-500'>
									<button
										onClick={() => handleReplyClick(id)}
										className='hover:text-primary transition-all'
									>
										답글
									</button>
									{isOwner && (
										<>
											<button
												onClick={() => handleEditComment(id, content)}
												className='hover:text-primary transition-all'
											>
												수정
											</button>
											<button
												onClick={() => handleDeleteComment(id)}
												className='hover:text-red-500 transition-all'
											>
												삭제
											</button>
										</>
										)}
								</div>
							)}
					</div>
					<div className='mt-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed'>
						{deleted ? (
							<span className='text-gray-400 italic'>삭제된 댓글입니다.</span>
						) : isEditingThisComment ? (
							<div className='space-y-2'>
								<textarea
									className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30'
									value={editingCommentContent}
									onChange={(e) => setEditingCommentContent(e.target.value)}
								/>
								<div className='flex justify-end gap-2 text-xs'>
									<button
										onClick={handleCancelEditComment}
										className='px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100'
									>
										취소
									</button>
									<button
										onClick={() => handleUpdateComment(id)}
										className='px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark'
									>
										수정 완료
									</button>
								</div>
							</div>
						) : (
							<span>{content}</span>
						)}
					</div>
					{!deleted && isReplyBoxOpen && (
						<div className='mt-4 bg-white border border-primary/20 rounded-xl p-3 space-y-2'>
							<textarea
								className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30'
								placeholder='답글을 입력하세요'
								value={replyValue}
								onChange={(e) => handleReplyChange(id, e.target.value)}
							/>
							<div className='flex justify-end gap-2 text-xs'>
								<button
									onClick={() => handleReplyClick(id)}
									className='px-3 py-1 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100'
								>
									취소
								</button>
								<button
									onClick={() => handleReplySubmit(id)}
									className='px-3 py-1 rounded-lg bg-primary text-white hover:bg-primary-dark'
								>
									답글 작성
								</button>
							</div>
						</div>
					)}
				</div>
				{children && children.length > 0 && (
					<div className='mt-2 space-y-2'>
						{children.map((child) => renderComment(child, depth + 1))}
					</div>
				)}
			</div>
		);
		},
		[activeReplyId, editingCommentContent, editingCommentId, handleCancelEditComment, handleReplyChange, handleReplyClick, handleReplySubmit, handleUpdateComment, handleDeleteComment, isMyComment, replyContents]
	);

	const commentList = useMemo(() => comments.map((comment) => renderComment(comment, 0)), [comments, renderComment]);

	if (!post)
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			{isEditing ? (
				<div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100'>
					<h2 className='text-2xl font-bold text-primary mb-6'>게시글 수정</h2>
					<div className='space-y-6'>
						<div>
							<label htmlFor='title' className='block text-sm font-semibold text-gray-700 mb-2'>
								제목
							</label>
							<input
								type='text'
								id='title'
								value={editedTitle}
								onChange={(e) => setEditedTitle(e.target.value)}
								className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
								placeholder='제목을 입력하세요'
							/>
						</div>
						<div>
							<label htmlFor='content' className='block text-sm font-semibold text-gray-700 mb-2'>
								내용
							</label>
							<textarea
								id='content'
								value={editedContent}
								onChange={(e) => setEditedContent(e.target.value)}
								className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none min-h-[300px]'
								placeholder='내용을 입력하세요'
							/>
						</div>
						<div className='flex justify-end space-x-3'>
							<button
								onClick={() => setIsEditing(false)}
								className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
							>
								취소
							</button>
							<button
								onClick={handleUpdate}
								className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark font-semibold shadow-md hover:shadow-lg transition-all'
							>
								저장하기
							</button>
						</div>
					</div>
				</div>
			) : (
				<div className='bg-white p-8 rounded-2xl shadow-lg mb-6 border border-gray-100'>
					<div className='flex justify-between items-start mb-6'>
						<div className='flex-1'>
							<h1 className='text-3xl font-bold text-gray-900 mb-4'>{post.title}</h1>
							<div className='flex items-center space-x-3 text-sm text-gray-500'>
								<div className='flex items-center'>
									<div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2'>
										<span className='text-primary font-semibold text-xs'>{post.userName[0]}</span>
									</div>
									<span className='font-medium'>{post.userName}</span>
								</div>
								<span>•</span>
								<span>{new Date(post.createdAt).toLocaleDateString()}</span>
								{post.updatedAt !== post.createdAt && (
									<>
										<span>•</span>
										<span className='text-gray-400'>수정됨</span>
									</>
								)}
							</div>
						</div>
						{isMyPost && (
							<div className='flex space-x-2'>
								<button
									onClick={() => setIsEditing(true)}
									className='px-4 py-2 text-primary hover:bg-primary/10 rounded-lg font-medium transition-all'
								>
									수정
								</button>
								<button
									onClick={() => setShowDeleteModal(true)}
									className='px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-all'
								>
									삭제
								</button>
							</div>
						)}
					</div>
					<div className='border-t border-gray-100 pt-6'>
						<p className='text-gray-700 whitespace-pre-wrap leading-relaxed text-lg'>
							{post.content}
						</p>
					</div>
				</div>
			)}

			<div className='bg-white p-8 rounded-2xl shadow-lg border border-gray-100'>
				<h2 className='text-xl font-bold text-gray-900 mb-6'>댓글</h2>

				{commentsError && (
					<div className='mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-600 text-sm border border-red-100'>
						{commentsError}
					</div>
				)}

				<div className='mb-6'>
					<textarea
						className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none min-h-[100px]'
						placeholder={isAuthenticated ? "댓글을 작성하세요" : "댓글을 작성하려면 로그인하세요"}
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						disabled={!isAuthenticated}
					/>
					<div className='flex justify-end mt-3'>
						<button
							onClick={handleAddComment}
							disabled={!isAuthenticated}
							className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark font-semibold shadow-md hover:shadow-lg transition-all disabled:bg-gray-300 disabled:text-gray-500 disabled:shadow-none disabled:cursor-not-allowed'
						>
							댓글 작성
						</button>
					</div>
				</div>

				{commentsLoading ? (
					<div className='flex justify-center py-12'>
						<div className='animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent'></div>
					</div>
				) : comments.length === 0 ? (
					<div className='text-center py-8 text-gray-500'>아직 작성된 댓글이 없습니다</div>
				) : (
					<div className='space-y-4'>{commentList}</div>
				)}
			</div>

			{showDeleteModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl'>
						<div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg
								className='w-8 h-8 text-red-500'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
								/>
							</svg>
						</div>
						<h2 className='text-2xl font-bold text-gray-900 mb-2 text-center'>게시글 삭제</h2>
						<p className='text-gray-600 text-center mb-6'>
							정말로 이 게시글을 삭제하시겠습니까?
							<br />이 작업은 되돌릴 수 없습니다.
						</p>
						<div className='flex justify-end space-x-3'>
							<button
								onClick={() => setShowDeleteModal(false)}
								className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
							>
								취소
							</button>
							<button
								onClick={handleDelete}
								className='px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 font-semibold shadow-md hover:shadow-lg transition-all'
							>
								삭제하기
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default PostPage;
