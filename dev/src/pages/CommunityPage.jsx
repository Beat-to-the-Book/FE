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
		<div className='container mx-auto px-4 py-8'>
			<div className='flex justify-between items-center mb-6'>
				<h1 className='text-2xl font-bold'>커뮤니티</h1>
				<button
					onClick={() => setShowCreateModal(true)}
					className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark'
				>
					그룹 생성
				</button>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
				{allGroups.map((group) => {
					const isJoined = myGroups.some((myGroup) => myGroup.id === group.id);
					return (
						<div
							key={group.id}
							className='bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow'
						>
							<h2 className='text-xl font-semibold mb-2'>{group.name}</h2>
							<div className='flex justify-between items-center'>
								<span className='text-sm text-gray-500'>{isJoined ? "가입됨" : "미가입"}</span>
								<button
									onClick={() => handleGroupClick(group)}
									className='text-primary hover:text-primary-dark'
								>
									자세히 보기 →
								</button>
							</div>
						</div>
					);
				})}
			</div>

			{/* 그룹 생성 모달 */}
			{showCreateModal && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
					<div className='bg-white p-6 rounded-lg w-96'>
						<h2 className='text-xl font-bold mb-4'>새 그룹 만들기</h2>
						<input
							type='text'
							value={newGroupName}
							onChange={(e) => setNewGroupName(e.target.value)}
							placeholder='그룹 이름을 입력하세요'
							className='w-full p-2 border rounded mb-4'
						/>
						<div className='flex justify-end space-x-2'>
							<button
								onClick={() => setShowCreateModal(false)}
								className='px-4 py-2 text-gray-600 hover:text-gray-800'
							>
								취소
							</button>
							<button
								onClick={handleCreateGroup}
								className='px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark'
							>
								생성
							</button>
						</div>
					</div>
				</div>
			)}

			{/* 그룹 가입 모달 */}
			{showJoinModal && selectedGroup && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
					<div className='bg-white p-6 rounded-lg w-96'>
						<h2 className='text-xl font-bold mb-4'>그룹 가입</h2>
						<p className='mb-4'>"{selectedGroup.name}" 그룹에 가입하시겠습니까?</p>
						<div className='flex justify-end space-x-2'>
							<button
								onClick={() => {
									setShowJoinModal(false);
									setSelectedGroup(null);
								}}
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

export default CommunityPage;
