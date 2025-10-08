import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { groupAPI } from "../lib/api/group";

const CommunityPage = () => {
	const navigate = useNavigate();
	const [allGroups, setAllGroups] = useState([]);
	const [myGroups, setMyGroups] = useState([]);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [selectedGroup, setSelectedGroup] = useState(null);
	const [newGroupName, setNewGroupName] = useState("");

	useEffect(() => {
		loadGroups();
	}, []);

	const loadGroups = async () => {
		try {
			const myGroupsResponse = await groupAPI.getMyGroups();
			setMyGroups(myGroupsResponse.data);

			const allGroupsResponse = await groupAPI.getAllGroups();
			setAllGroups(allGroupsResponse.data);
		} catch (error) {
			console.error("그룹 목록 로딩 실패:", error);
			setMyGroups([]);
			setAllGroups([]);
		}
	};

	const handleCreateGroup = async () => {
		try {
			await groupAPI.create({ name: newGroupName });
			setShowCreateModal(false);
			setNewGroupName("");
			loadGroups();
		} catch (error) {
			console.error("그룹 생성 실패:", error);
		}
	};

	const handleGroupClick = async (group) => {
		try {
			// 내가 가입한 그룹 목록을 다시 가져와서 최신 상태 확인
			const myGroupsResponse = await groupAPI.getMyGroups();
			const isJoined = myGroupsResponse.data.some((myGroup) => myGroup.id === group.id);

			if (isJoined) {
				// 가입된 그룹이면 바로 이동
				navigate(`/community/${group.id}`);
			} else {
				// 가입되지 않은 그룹이면 모달 표시
				setSelectedGroup(group);
				setShowJoinModal(true);
			}
		} catch (error) {
			console.error("그룹 상태 확인 실패:", error);
		}
	};

	const handleJoinGroup = async () => {
		try {
			await groupAPI.join(selectedGroup.id);
			setShowJoinModal(false);
			setSelectedGroup(null);
			navigate(`/community/${selectedGroup.id}`);
		} catch (error) {
			console.error("그룹 가입 실패:", error);
		}
	};

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<div>
					<h1 className='text-3xl font-bold text-primary mb-2'>커뮤니티</h1>
					<p className='text-gray-600'>독서 모임에 참여하고 다양한 사람들과 소통하세요</p>
				</div>
				<button
					onClick={() => setShowCreateModal(true)}
					className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
				>
					+ 새 그룹 만들기
				</button>
			</div>

			{allGroups.length === 0 ? (
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
								d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
							/>
						</svg>
					</div>
					<p className='text-gray-600 text-lg'>아직 생성된 그룹이 없습니다</p>
					<p className='text-gray-500 text-sm mt-2'>첫 번째 그룹을 만들어보세요!</p>
				</div>
			) : (
				<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
					{allGroups.map((group) => {
						const isJoined = myGroups.some((myGroup) => myGroup.id === group.id);
						return (
							<div
								key={group.id}
								className='bg-white p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-light/30 cursor-pointer transform hover:-translate-y-1'
								onClick={() => handleGroupClick(group)}
							>
								<div className='flex items-start justify-between mb-4'>
									<div className='flex-1'>
										<h2 className='text-xl font-bold text-gray-900 mb-2'>{group.name}</h2>
										{isJoined && (
											<span className='inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-light/10 text-primary'>
												<svg className='w-3 h-3 mr-1' fill='currentColor' viewBox='0 0 20 20'>
													<path
														fillRule='evenodd'
														d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
														clipRule='evenodd'
													/>
												</svg>
												가입됨
											</span>
										)}
									</div>
									<div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
										<svg className='w-6 h-6 text-primary' fill='currentColor' viewBox='0 0 20 20'>
											<path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
										</svg>
									</div>
								</div>
								<div className='flex items-center justify-between text-sm'>
									<span className='text-gray-500'>
										{isJoined ? "그룹 활동 참여 중" : "그룹 둘러보기"}
									</span>
									<span className='text-primary font-medium'>자세히 보기 →</span>
								</div>
							</div>
						);
					})}
				</div>
			)}

			{/* 그룹 생성 모달 */}
			{showCreateModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl'>
						<h2 className='text-2xl font-bold text-primary mb-6'>새 그룹 만들기</h2>
						<div className='mb-6'>
							<label className='block text-sm font-semibold text-gray-700 mb-2'>그룹 이름</label>
							<input
								type='text'
								value={newGroupName}
								onChange={(e) => setNewGroupName(e.target.value)}
								placeholder='그룹 이름을 입력하세요'
								className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
							/>
						</div>
						<div className='flex justify-end space-x-3'>
							<button
								onClick={() => setShowCreateModal(false)}
								className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
							>
								취소
							</button>
							<button
								onClick={handleCreateGroup}
								className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark font-semibold shadow-md hover:shadow-lg transition-all'
							>
								생성하기
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 그룹 가입 모달 */}
			{showJoinModal && selectedGroup && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
					<div className='bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl'>
						<div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
							<svg className='w-8 h-8 text-primary' fill='currentColor' viewBox='0 0 20 20'>
								<path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
							</svg>
						</div>
						<h2 className='text-2xl font-bold text-primary mb-2 text-center'>그룹 가입</h2>
						<p className='text-gray-600 text-center mb-6'>
							<span className='font-semibold text-gray-900'>{selectedGroup.name}</span> 그룹에
							가입하시겠습니까?
						</p>
						<div className='flex justify-end space-x-3'>
							<button
								onClick={() => {
									setShowJoinModal(false);
									setSelectedGroup(null);
								}}
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

export default CommunityPage;
