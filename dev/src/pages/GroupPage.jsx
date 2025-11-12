import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { groupAPI } from "../lib/api/group";
import { communityAPI } from "../lib/api/community";
import { authAPI } from "../lib/api/auth";
import useAuthStore from "../lib/store/authStore";

const GroupPage = () => {
	const { groupId } = useParams();
	const navigate = useNavigate();
	const [groupInfo, setGroupInfo] = useState(null);
	const [members, setMembers] = useState([]);
	const [posts, setPosts] = useState([]);
	const [showJoinModal, setShowJoinModal] = useState(false);
	const [sortOrder, setSortOrder] = useState("latest"); // "latest" 또는 "oldest"
	const [memberPage, setMemberPage] = useState(0);
	const { isAuthenticated, userInfo, userId, setUserInfo } = useAuthStore();

	const currentUserId = userInfo?.userId ?? userId ?? null;
	const currentUsername = userInfo?.username ?? null;

	useEffect(() => {
		loadGroupData();
	}, [groupId]);

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

	const parseMembersResponse = (payload) => {
		if (!payload) {
			return { info: null, members: [] };
		}

		if (Array.isArray(payload)) {
			return { info: null, members: payload };
		}

		const membersField = Array.isArray(payload.members) ? payload.members : [];
		const info = { ...payload };
		delete info.members;
		return { info, members: membersField };
	};

	const loadGroupData = async () => {
		try {
			const [groupResponse, postsResponse] = await Promise.all([
				groupAPI.getMembers(groupId),
				communityAPI.getPosts(groupId),
			]);
			const parsed = parseMembersResponse(groupResponse.data);
			setGroupInfo(parsed.info);
			setMembers(parsed.members);
			setPosts(postsResponse.data);
		} catch (error) {
			console.error("그룹 데이터 로딩 실패:", error);
		}
	};

	const normalize = (value) => {
		if (value === undefined || value === null) {
			return null;
		}
		return String(value).trim();
	};

	const matchesMember = (member) => {
		if (!member) {
			return false;
		}

		const candidateIds = [
			member.userId,
			member.id,
			member.memberId,
			member.user?.id,
			member.user?.userId,
		]
			.map(normalize)
			.filter(Boolean);

		const candidateNames = [member.username, member.name, member.userName, member.user?.username]
			.map(normalize)
			.filter(Boolean);

		const normalizedCurrentId = normalize(currentUserId);
		const normalizedCurrentName = normalize(currentUsername);

		return (
			(normalizedCurrentId && candidateIds.some((id) => id === normalizedCurrentId)) ||
			(normalizedCurrentName && candidateNames.some((name) => name === normalizedCurrentName))
		);
	};

	const currentMember = useMemo(
		() => members.find((member) => matchesMember(member)),
		[members, currentUserId, currentUsername]
	);

	const isMember = Boolean(currentMember);
	const isLeader = currentMember?.role === "LEADER";
	const otherMembers = useMemo(
		() => members.filter((member) => !matchesMember(member)),
		[members, currentUserId, currentUsername]
	);
	const leaderMember = useMemo(() => members.find((member) => member.role === "LEADER"), [members]);
	const canLeaveGroup = isMember && !isLeader;

	const groupName = useMemo(() => {
		if (!groupInfo) {
			return `그룹 ${groupId}`;
		}
		return (
			groupInfo.name ??
			groupInfo.groupName ??
			groupInfo.title ??
			groupInfo.group?.name ??
			`그룹 ${groupId}`
		);
	}, [groupInfo, groupId]);

	const groupDescription = useMemo(() => {
		if (!groupInfo) {
			return "그룹 멤버들과 다양한 이야기를 나눠보세요";
		}
		return (
			groupInfo.description ??
			groupInfo.introduction ??
			groupInfo.bio ??
			"그룹 멤버들과 다양한 이야기를 나눠보세요"
		);
	}, [groupInfo]);

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

	const handleLeaveGroup = async () => {
		if (!currentMember) {
			alert("먼저 그룹에 가입해야 탈퇴할 수 있습니다.");
			return;
		}

		if (currentMember.role === "LEADER") {
			alert(
				"방장은 바로 탈퇴할 수 없습니다.\n다른 멤버에게 방장을 위임한 뒤 탈퇴를 다시 시도해주세요."
			);
			return;
		}

		if (!window.confirm("정말로 이 그룹을 탈퇴하시겠습니까?")) {
			return;
		}

		try {
			await groupAPI.leave(groupId);
			alert("그룹에서 탈퇴했습니다.");
			await loadGroupData();
		} catch (error) {
			console.error("그룹 탈퇴 실패:", error);
			alert("그룹 탈퇴에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleDelegateLeader = async (targetMember) => {
		if (!targetMember?.userId) {
			alert("위임할 멤버 정보를 찾을 수 없습니다.");
			return;
		}

		if (
			!window.confirm(
				`${
					targetMember.username ?? targetMember.name ?? targetMember.userId
				}님에게 방장을 위임하시겠습니까?`
			)
		) {
			return;
		}

		try {
			await groupAPI.delegateLeader(groupId, targetMember.userId);
			alert("방장을 성공적으로 위임했습니다.");
			await loadGroupData();
		} catch (error) {
			console.error("방장 위임 실패:", error);
			alert("방장 위임에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleKickMember = async (targetMember) => {
		if (!targetMember?.userId) {
			alert("추방할 멤버 정보를 찾을 수 없습니다.");
			return;
		}

		if (targetMember.role === "LEADER") {
			alert("방장은 추방할 수 없습니다.");
			return;
		}

		if (
			!window.confirm(
				`${
					targetMember.username ?? targetMember.name ?? targetMember.userId
				}님을 정말로 추방하시겠습니까?`
			)
		) {
			return;
		}

		try {
			await groupAPI.kickMember(groupId, targetMember.userId);
			alert("멤버를 추방했습니다.");
			await loadGroupData();
		} catch (error) {
			console.error("멤버 추방 실패:", error);
			alert("멤버 추방에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const sortedPosts = [...posts].sort((a, b) => {
		const dateA = new Date(a.createdAt);
		const dateB = new Date(b.createdAt);
		return sortOrder === "latest" ? dateB - dateA : dateA - dateB;
	});

	useEffect(() => {
		const ensureGroupMetadata = async () => {
			if (groupInfo && (groupInfo.name || groupInfo.groupName || groupInfo.title)) {
				return;
			}
			try {
				const [allGroupsResponse, myGroupsResponse] = await Promise.all([
					groupAPI.getAllGroups().catch(() => ({ data: [] })),
					isAuthenticated
						? groupAPI.getMyGroups().catch(() => ({ data: [] }))
						: Promise.resolve({ data: [] }),
				]);
				const allGroups = Array.isArray(allGroupsResponse.data) ? allGroupsResponse.data : [];
				const myGroups = Array.isArray(myGroupsResponse.data) ? myGroupsResponse.data : [];
				const groupIdNumber = Number(groupId);
				const found =
					allGroups.find((group) => Number(group.id) === groupIdNumber) ||
					myGroups.find((group) => Number(group.id) === groupIdNumber);
				if (found) {
					setGroupInfo((prev) => ({ ...(prev || {}), ...found }));
				}
			} catch (error) {
				console.error("그룹 정보를 불러오지 못했습니다.", error);
			}
		};

		ensureGroupMetadata();
	}, [groupInfo, groupId, isAuthenticated]);

	const MEMBERS_PER_PAGE = 4;
	const totalMemberPages = Math.max(1, Math.ceil(members.length / MEMBERS_PER_PAGE));

	useEffect(() => {
		if (memberPage > totalMemberPages - 1) {
			setMemberPage(Math.max(0, totalMemberPages - 1));
		}
	}, [memberPage, totalMemberPages]);

	const pagedMembers = members.slice(
		memberPage * MEMBERS_PER_PAGE,
		memberPage * MEMBERS_PER_PAGE + MEMBERS_PER_PAGE
	);
	const memberRangeStart = members.length === 0 ? 0 : memberPage * MEMBERS_PER_PAGE + 1;
	const memberRangeEnd = Math.min(members.length, memberPage * MEMBERS_PER_PAGE + MEMBERS_PER_PAGE);

	const handlePrevMembers = () => {
		setMemberPage((prev) => Math.max(0, prev - 1));
	};

	const handleNextMembers = () => {
		setMemberPage((prev) => Math.min(totalMemberPages - 1, prev + 1));
	};

	return (
		<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-8'>
				<div className='space-y-3'>
					<h1 className='text-3xl font-bold text-primary mb-2'>{groupName}</h1>
					<p className='text-gray-600'>{groupDescription}</p>
					{leaderMember && (
						<p className='mt-2 text-sm text-gray-500'>
							현재 방장:{" "}
							<span className='font-semibold text-gray-800'>
								{leaderMember.username ?? leaderMember.name ?? leaderMember.userId}
							</span>
						</p>
					)}
				</div>
				<div className='flex flex-col sm:flex-row sm:items-center gap-2'>
					<button
						onClick={handleWriteClick}
						className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
					>
						+ 글 작성
					</button>
					{isMember && (
						<button
							onClick={handleLeaveGroup}
							disabled={!canLeaveGroup}
							className='px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed'
						>
							그룹 탈퇴
						</button>
					)}
				</div>
			</div>

			<div className='lg:flex lg:items-start lg:gap-8'>
				<div className={`flex-1 ${isLeader ? "lg:pr-8" : ""}`}>
					{/* 정렬 버튼 */}
					<div className={`mb-6 flex ${isLeader ? "justify-end" : "justify-center"}`}>
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
						<div className='text-center py-16 lg:max-w-3xl lg:mx-auto'>
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
						<div className='space-y-4 lg:max-w-3xl lg:mx-auto'>
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
													<span className='text-primary font-semibold text-xs'>
														{post.userName[0]}
													</span>
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
				</div>

				{isLeader && (
					<aside className='mt-10 lg:mt-0 lg:w-[320px]'>
						<div className='lg:fixed lg:top-[300px] lg:right-10 w-full lg:w-[320px] space-y-4'>
							<div className='rounded-2xl border border-gray-100 bg-white shadow-sm p-5'>
								<div className='flex items-center justify-between'>
									<div>
										<h2 className='text-lg font-bold text-gray-900'>멤버 관리</h2>
										<p className='text-sm text-gray-500'>
											총 <span className='font-semibold text-primary'>{members.length}</span>명
										</p>
									</div>
									{totalMemberPages > 1 && (
										<div className='flex items-center gap-2'>
											<button
												onClick={handlePrevMembers}
												disabled={memberPage === 0}
												className='rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40'
											>
												이전
											</button>
											<span className='text-xs text-gray-400'>
												{memberPage + 1}/{totalMemberPages}
											</span>
											<button
												onClick={handleNextMembers}
												disabled={memberPage >= totalMemberPages - 1}
												className='rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50 disabled:opacity-40'
											>
												다음
											</button>
										</div>
									)}
								</div>

								{otherMembers.length === 0 && isLeader && members.length > 0 && (
									<div className='mt-3 rounded-xl border border-yellow-200 bg-yellow-50 px-3 py-2 text-xs text-yellow-700'>
										다른 멤버가 가입하면 방장을 위임하거나 추방할 수 있습니다.
									</div>
								)}

								<div className='mt-4 space-y-3'>
									{pagedMembers.length === 0 ? (
										<p className='text-sm text-gray-500'>아직 가입한 멤버가 없습니다.</p>
									) : (
										pagedMembers.map((member) => {
											const displayName =
												member.username ??
												member.name ??
												member.userName ??
												member.userId ??
												"알 수 없는 사용자";
											const isSelf = matchesMember(member);
											const roleLabel = member.role === "LEADER" ? "방장" : "멤버";
											const displayInitial =
												displayName && displayName.length > 0 ? displayName.charAt(0) : "?";

											return (
												<div
													key={(member.userId ?? member.id ?? displayName) + roleLabel}
													className='flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3'
												>
													<div className='flex items-center justify-between gap-3'>
														<div className='flex items-center gap-3'>
															<div className='w-9 h-9 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center'>
																{displayInitial}
															</div>
															<div>
																<p className='font-semibold text-gray-900'>
																	{displayName}
																	{isSelf && <span className='ml-2 text-xs text-primary'>나</span>}
																</p>
																<p className='text-xs text-gray-500'>{roleLabel}</p>
															</div>
														</div>
													</div>
													{!isSelf && (
														<div className='flex gap-2'>
															<button
																onClick={() => handleDelegateLeader(member)}
																className='flex-1 px-3 py-2 text-xs font-semibold text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-all'
																disabled={member.role === "LEADER"}
															>
																방장 위임
															</button>
															<button
																onClick={() => handleKickMember(member)}
																className='flex-1 px-3 py-2 text-xs font-semibold text-red-500 border border-red-200 rounded-xl hover:bg-red-50 transition-all'
															>
																추방
															</button>
														</div>
													)}
												</div>
											);
										})
									)}
								</div>

								{members.length > MEMBERS_PER_PAGE && (
									<p className='mt-3 text-xs text-gray-400 text-right'>
										{memberRangeStart}-{memberRangeEnd} / {members.length}
									</p>
								)}
							</div>
						</div>
					</aside>
				)}
			</div>

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
							<span className='font-semibold text-gray-900'>{groupName}</span> 그룹에
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
