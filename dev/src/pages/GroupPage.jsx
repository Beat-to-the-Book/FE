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
		<div className='container mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold'>{group?.name}</h1>
				<button
					onClick={handleWriteClick}
					className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark'
				>
					글 작성
				</button>
			</div>

			{/* 정렬 버튼 추가 */}
			<div className='mb-4 flex justify-end'>
				<div className='inline-flex rounded-lg border border-gray-200'>
					<button
						onClick={() => setSortOrder("latest")}
						className={`px-4 py-2 text-sm ${
							sortOrder === "latest"
								? "bg-primary text-white"
								: "bg-white text-gray-700 hover:bg-gray-50"
						} rounded-l-lg`}
					>
						최신순
					</button>
					<button
						onClick={() => setSortOrder("oldest")}
						className={`px-4 py-2 text-sm ${
							sortOrder === "oldest"
								? "bg-primary text-white"
								: "bg-white text-gray-700 hover:bg-gray-50"
						} rounded-r-lg`}
					>
						오래된순
					</button>
				</div>
			</div>

			{posts.length === 0 ? (
				<div className='text-center py-8 text-gray-500'>
					<p>아직 작성된 게시글이 없습니다.</p>
					<button
						onClick={handleWriteClick}
						className='mt-4 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark'
					>
						첫 게시글 작성하기
					</button>
				</div>
			) : (
				<div className='space-y-4'>
					{sortedPosts.map((post) => (
						<div
							key={post.id}
							className='bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow'
						>
							<h2 className='text-xl font-semibold mb-2'>{post.title}</h2>
							<p className='text-gray-600 mb-2'>{post.content}</p>
							<div className='flex justify-between items-center'>
								<span className='text-sm text-gray-500'>
									작성자: {post.userName} | 작성일: {new Date(post.createdAt).toLocaleDateString()}
								</span>
								<button
									onClick={() => navigate(`/community/${groupId}/posts/${post.id}`)}
									className='text-primary hover:text-primary-dark'
								>
									자세히 보기 →
								</button>
							</div>
						</div>
					))}
				</div>
			)}

			{/* 그룹 가입 모달 */}
			{showJoinModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
					<div className='bg-white p-6 rounded-lg w-96'>
						<h2 className='text-xl font-bold mb-4'>그룹 가입</h2>
						<p className='mb-4'>"{group?.name}" 그룹에 가입하시겠습니까?</p>
						<div className='flex justify-end space-x-2'>
							<button
								onClick={() => setShowJoinModal(false)}
								className='px-4 py-2 text-gray-600 hover:text-gray-800'
							>
								취소
							</button>
							<button
								onClick={handleJoinGroup}
								className='px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark'
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
