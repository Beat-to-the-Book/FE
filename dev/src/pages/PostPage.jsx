import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { communityAPI } from "../lib/api/community";

const PostPage = () => {
	const { groupId, postId } = useParams();
	const navigate = useNavigate();
	const [post, setPost] = useState(null);
	const [myPosts, setMyPosts] = useState([]);
	const [isEditing, setIsEditing] = useState(false);
	const [editedTitle, setEditedTitle] = useState("");
	const [editedContent, setEditedContent] = useState("");
	const [showDeleteModal, setShowDeleteModal] = useState(false);

	useEffect(() => {
		loadPost();
		loadMyPosts();
	}, [groupId, postId]);

	const loadPost = async () => {
		try {
			const response = await communityAPI.getPost(groupId, postId);
			setPost(response.data);
			setEditedTitle(response.data.title);
			setEditedContent(response.data.content);
		} catch (error) {
			console.error("게시글 로딩 실패:", error);
		}
	};

	const loadMyPosts = async () => {
		try {
			const response = await communityAPI.getPosts(groupId);
			setMyPosts(response.data);
		} catch (error) {
			console.error("내 게시글 목록 로딩 실패:", error);
		}
	};

	const isMyPost = () => {
		return myPosts.some((myPost) => myPost.id === parseInt(postId));
	};

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

	if (!post) return <div>로딩 중...</div>;

	return (
		<div className='container mx-auto px-4 py-8'>
			<div className='max-w-3xl mx-auto'>
				{isEditing ? (
					<div className='bg-white p-6 rounded-lg shadow'>
						<h2 className='text-xl font-bold mb-4'>게시글 수정</h2>
						<div className='space-y-4'>
							<div>
								<label htmlFor='title' className='block text-sm font-medium text-gray-700 mb-1'>
									제목
								</label>
								<input
									type='text'
									id='title'
									value={editedTitle}
									onChange={(e) => setEditedTitle(e.target.value)}
									className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary'
									placeholder='제목을 입력하세요'
								/>
							</div>
							<div>
								<label htmlFor='content' className='block text-sm font-medium text-gray-700 mb-1'>
									내용
								</label>
								<textarea
									id='content'
									value={editedContent}
									onChange={(e) => setEditedContent(e.target.value)}
									className='w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[300px]'
									placeholder='내용을 입력하세요'
								/>
							</div>
							<div className='flex justify-end space-x-3'>
								<button
									onClick={() => setIsEditing(false)}
									className='px-4 py-2 text-gray-600 hover:text-gray-800'
								>
									취소
								</button>
								<button
									onClick={handleUpdate}
									className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark'
								>
									저장
								</button>
							</div>
						</div>
					</div>
				) : (
					<div className='bg-white p-6 rounded-lg shadow mb-6'>
						<div className='flex justify-between items-start mb-4'>
							<h1 className='text-2xl font-bold'>{post.title}</h1>
							{isMyPost() && (
								<div className='space-x-2'>
									<button
										onClick={() => setIsEditing(true)}
										className='text-primary hover:text-primary-dark'
									>
										수정
									</button>
									<button
										onClick={() => setShowDeleteModal(true)}
										className='text-red-500 hover:text-red-700'
									>
										삭제
									</button>
								</div>
							)}
						</div>
						<p className='text-gray-600 mb-4 whitespace-pre-wrap'>{post.content}</p>
						<div className='text-sm text-gray-500'>
							작성자: {post.userName} | 작성일: {new Date(post.createdAt).toLocaleDateString()}
							{post.updatedAt !== post.createdAt && (
								<> | 수정일: {new Date(post.updatedAt).toLocaleDateString()}</>
							)}
						</div>
					</div>
				)}

				<div className='bg-white p-6 rounded-lg shadow'>
					<h2 className='text-xl font-bold mb-4'>댓글</h2>

					<div className='mb-6'>
						<textarea
							className='w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary min-h-[100px]'
							placeholder='댓글을 작성하세요'
						/>
						<div className='flex justify-end mt-2'>
							<button className='px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark'>
								댓글 작성
							</button>
						</div>
					</div>
				</div>

				{showDeleteModal && (
					<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
						<div className='bg-white p-6 rounded-lg w-96'>
							<h2 className='text-xl font-bold mb-4'>게시글 삭제</h2>
							<p className='mb-4'>정말로 이 게시글을 삭제하시겠습니까?</p>
							<div className='flex justify-end space-x-2'>
								<button
									onClick={() => setShowDeleteModal(false)}
									className='px-4 py-2 text-gray-600 hover:text-gray-800'
								>
									취소
								</button>
								<button
									onClick={handleDelete}
									className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
								>
									삭제
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default PostPage;
