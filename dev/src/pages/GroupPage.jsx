import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupAPI } from "../lib/api/group";
import { communityAPI } from "../lib/api/community";

const GroupPage = () => {
	const { groupId } = useParams();
	const navigate = useNavigate();
	const [group, setGroup] = useState(null);
	const [posts, setPosts] = useState([]);
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [sortOrder, setSortOrder] = useState("latest"); // "latest" 또는 "oldest"

	useEffect(() => {
		loadGroupData();
	}, [groupId]);

	const loadGroupData = async () => {
		try {
			const [groupResponse, postsResponse] = await Promise.all([
				groupAPI.getMembers(groupId),
				communityAPI.getPosts(groupId),
			]);
			setGroup(groupResponse.data);
			setPosts(postsResponse.data);
		} catch (error) {
			console.error("그룹 데이터 로딩 실패:", error);
		}
	};

	const handleWriteClick = async () => {
		try {
			// 내가 가입한 그룹 목록을 가져와서 현재 그룹 가입 여부 확인
			const myGroupsResponse = await groupAPI.getMyGroups();
			const isJoined = myGroupsResponse.data.some((myGroup) => myGroup.id === parseInt(groupId));

			if (isJoined) {
				// 가입된 그룹이면 글 작성 페이지로 이동
				navigate(`/community/${groupId}/write`);
			} else {
				// 가입되지 않은 그룹이면 가입 모달 표시
				setShowJoinModal(true);
			}
		} catch (error) {
			console.error("그룹 가입 상태 확인 실패:", error);
		}
	};

	const handleJoinGroup = async () => {
		try {
			await groupAPI.join(groupId);
			setShowJoinModal(false);
			navigate(`/community/${groupId}/write`);
		} catch (error) {
			console.error("그룹 가입 실패:", error);
		}
	};

	const sortedPosts = [...posts].sort((a, b) => {
		const dateA = new Date(a.createdAt);
		const dateB = new Date(b.createdAt);
		return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
	});

	return (
		<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<div>
					<h1 className='text-3xl font-bold text-primary mb-2'>{group?.name}</h1>
					<p className='text-gray-600'>그룹 멤버들과 다양한 이야기를 나눠보세요</p>
				</div>
				<button
					onClick={handleWriteClick}
					className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
				>
					+ 글 작성
				</button>
			</div>

			{/* 정렬 버튼 */}
			<div className='mb-6 flex justify-end'>
				<div className='inline-flex rounded-xl border-2 border-gray-200 overflow-hidden'>
					<button
						onClick={() => setSortOrder("latest")}
						className={`px-6 py-2 text-sm font-semibold transition-all ${
							sortOrder === "latest"
								? "bg-primary text-white"
								: "bg-white text-gray-700 hover:bg-gray-50"
						}`}
					>
						최신순
					</button>
					<button
						onClick={() => setSortOrder("oldest")}
						className={`px-6 py-2 text-sm font-semibold transition-all border-l-2 border-gray-200 ${
							sortOrder === "oldest"
								? "bg-primary text-white"
								: "bg-white text-gray-700 hover:bg-gray-50"
						}`}
					>
						오래된순
					</button>
				</div>
			</div>

			{posts.length === 0 ? (
				<div className='text-center py-16'>
					<div className='w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4'>
						<svg
							className='w-10 h-10 text-gray-400'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
							/>
						</svg>
					</div>
					<p className='text-gray-600 text-lg mb-2'>아직 작성된 게시글이 없습니다</p>
					<p className='text-gray-500 text-sm mb-6'>첫 번째 게시글을 작성해보세요!</p>
					<button
						onClick={handleWriteClick}
						className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg'
					>
						첫 게시글 작성하기
					</button>
				</div>
			) : (
				<div className='space-y-4'>
					{sortedPosts.map((post) => (
						<div
							key={post.id}
							className='bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-light/30 cursor-pointer transform hover:-translate-y-1'
							onClick={() => navigate(`/community/${groupId}/posts/${post.id}`)}
						>
							<h2 className='text-xl font-bold text-gray-900 mb-3'>{post.title}</h2>
							<p className='text-gray-700 mb-4 line-clamp-2 leading-relaxed'>{post.content}</p>
							<div className='flex justify-between items-center text-sm'>
								<div className='flex items-center space-x-3 text-gray-500'>
									<div className='flex items-center'>
										<div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-1.5'>
											<span className='text-primary font-semibold text-xs'>{post.userName[0]}</span>
										</div>
										<span className='font-medium'>{post.userName}</span>
									</div>
									<span>•</span>
									<span>{new Date(post.createdAt).toLocaleDateString()}</span>
								</div>
								<span className='text-primary font-medium'>자세히 보기 →</span>
							</div>
						</div>
					))}
				</div>
			)}

			{/* 그룹 가입 모달 */}
			{showJoinModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl'>
						<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg className='w-8 h-8 text-primary' fill='currentColor' viewBox='0 0 20 20'>
								<path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
							</svg>
						</div>
						<h2 className='text-2xl font-bold text-primary mb-2 text-center'>그룹 가입</h2>
						<p className='text-gray-600 text-center mb-6'>
							<span className='font-semibold text-gray-900'>{group?.name}</span> 그룹에
							가입하시겠습니까?
						</p>
						<div className='flex justify-end space-x-3'>
							<button
								onClick={() => setShowJoinModal(false)}
								className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
							>
								취소
							</button>
							<button
								onClick={handleJoinGroup}
								className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark font-semibold shadow-md hover:shadow-lg transition-all'
							>
								가입하기
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default GroupPage;
