import { useState, useEffect } from "react";
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

	const currentUserId = userInfo?.userId ?? userId ?? null;
	const currentUsername = userInfo?.username ?? null;

	useEffect(() => {
		loadPost();
	}, [groupId, postId]);

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

	const loadPost = async () => {
		try {
			const response = await communityAPI.getPost(groupId, postId);
			setPost(response.data);
			setEditedTitle(response.data.title);
			setEditedContent(response.data.content);
			updateOwnership(response.data);
		} catch (error) {
			console.error("게시글 로딩 실패:", error);
		}
	};

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

				<div className='mb-6'>
					<textarea
						className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none min-h-[100px]'
						placeholder='댓글을 작성하세요'
					/>
					<div className='flex justify-end mt-3'>
						<button className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark font-semibold shadow-md hover:shadow-lg transition-all'>
							댓글 작성
						</button>
					</div>
				</div>

				<div className='text-center py-8 text-gray-500'>아직 작성된 댓글이 없습니다</div>
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
