import { useState, useEffect } from "react";
import useAuthStore from "../lib/store/authStore";
import { rankingAPI } from "../lib/api/ranking";

const RankingPage = () => {
	const { isAuthenticated, userId } = useAuthStore();
	const [booksRanking, setBooksRanking] = useState([]);
	const [pointsRanking, setPointsRanking] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	// 현재 날짜 기준으로 이번 달 정보
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const currentYear = now.getFullYear();
	const nextUpdateDate = new Date(currentYear, currentMonth, 1);

	useEffect(() => {
		const loadRankings = async () => {
			if (!isAuthenticated) {
				setBooksRanking([]);
				setPointsRanking([]);
				setLoading(false);
				return;
			}

			setLoading(true);
			setError(null);

			try {
				const [pointsResponse, booksResponse] = await Promise.all([
					rankingAPI.getPointsRanking({ year: currentYear, month: currentMonth }),
					rankingAPI.getBooksRanking({ year: currentYear, month: currentMonth }),
				]);

				const pointsData = (pointsResponse.data || []).map((item) => ({
					...item,
					isMe: item.userId === userId,
				}));

				const booksData = (booksResponse.data || []).map((item) => ({
					...item,
					isMe: item.userId === userId,
				}));

				pointsData.sort((a, b) => a.rank - b.rank);
				booksData.sort((a, b) => a.rank - b.rank);

				setPointsRanking(pointsData);
				setBooksRanking(booksData);
			} catch (err) {
				console.error("랭킹 데이터 로드 실패:", err);
				setError("랭킹 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
			} finally {
				setLoading(false);
			}
		};

		loadRankings();
	}, [isAuthenticated, userId, currentYear, currentMonth]);

	// 올림픽 단상 컴포넌트
	const Podium = ({ user, rank, type }) => {
		const isBooks = type === "books";
		const height = rank === 1 ? "h-48" : rank === 2 ? "h-40" : "h-32";
		const bgColor =
			rank === 1
				? "bg-gradient-to-t from-yellow-400 to-yellow-300"
				: rank === 2
				? "bg-gradient-to-t from-gray-300 to-gray-200"
				: "bg-gradient-to-t from-orange-400 to-orange-300";
		const badge = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";

		if (!user) {
			return (
				<div className='flex flex-col items-center'>
					<div className='mb-3 text-center text-gray-400'>
						<div className='text-4xl mb-2'>—</div>
						<div className='text-sm font-medium'>랭킹 없음</div>
					</div>
					<div
						className={`${height} bg-gray-200 w-32 rounded-t-lg shadow-inner border-4 border-white flex items-end justify-center pb-4 relative`}
					>
						<div className='absolute top-2 left-1/2 -translate-x-1/2'>
							<div className='text-4xl font-bold text-white drop-shadow-lg'>#{rank}</div>
						</div>
					</div>
				</div>
			);
		}

		return (
			<div className='flex flex-col items-center'>
				{/* 사용자 정보 (단상 위) */}
				<div
					className={`mb-3 text-center ${
						user.isMe ? "ring-2 ring-primary ring-offset-2 rounded-xl px-3 py-2" : ""
					}`}
				>
					<div className='text-4xl mb-2'>{badge}</div>
					<div
						className={`text-xl font-bold mb-2 ${
							user.isMe
								? "text-primary"
								: rank === 1
								? "text-yellow-700"
								: rank === 2
								? "text-gray-700"
								: "text-orange-700"
						}`}
					>
						{user.username}
						{user.isMe && (
							<span className='ml-2 px-2 py-0.5 bg-primary text-white text-xs rounded-full font-normal'>
								나
							</span>
						)}
					</div>
					<div
						className={`text-lg font-semibold ${
							user.isMe
								? "text-primary-dark"
								: rank === 1
								? "text-yellow-800"
								: rank === 2
								? "text-gray-800"
								: "text-orange-800"
						}`}
					>
						{isBooks ? `${user.totalCount ?? 0}권` : `${(user.points ?? 0).toLocaleString()}P`}
					</div>
					{isBooks && (
						<div className='text-xs text-gray-600 font-medium'>
							구매 {user.purchaseCount ?? 0}권 · 대여 {user.rentalCount ?? 0}권
						</div>
					)}
				</div>

				{/* 단상 */}
				<div
					className={`${height} ${bgColor} w-32 rounded-t-lg shadow-xl border-4 border-white flex items-end justify-center pb-4 relative overflow-hidden`}
				>
					{/* 단상 번호 */}
					<div className='absolute top-2 left-1/2 -translate-x-1/2'>
						<div className='text-4xl font-bold text-white drop-shadow-lg'>#{rank}</div>
					</div>
					{/* 단상 패턴 */}
					<div className='absolute inset-0 opacity-20'>
						<div
							className='w-full h-full'
							style={{
								backgroundImage:
									'url("data:image/svg+xml,%3Csvg width="40" height="40" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M0 0h40v40H0z" fill="none"/%3E%3Cpath d="M0 0l40 40M40 0L0 40" stroke="%23000" stroke-width="1"/%3E%3C/svg%3E")',
							}}
						></div>
					</div>
				</div>
			</div>
		);
	};

	const topBooksByRank = [1, 2, 3].map(
		(position) => booksRanking.find((item) => item.rank === position) || null
	);
	const orderedBooksPodium = [topBooksByRank[1], topBooksByRank[0], topBooksByRank[2]];

	const topPointsByRank = [1, 2, 3].map(
		(position) => pointsRanking.find((item) => item.rank === position) || null
	);
	const orderedPointsPodium = [topPointsByRank[1], topPointsByRank[0], topPointsByRank[2]];

	const topBooksList = booksRanking.slice(0, 10);
	const topPointsList = pointsRanking.slice(0, 10);

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			{/* 헤더 */}
			<div className='mb-8 text-center'>
				<h1 className='text-5xl font-bold text-primary mb-3'>🏆 랭킹</h1>
				<p className='text-gray-600 text-lg mb-4'>
					책을 많이 읽고 포인트를 많이 모은 독서러들을 확인해보세요!
				</p>
				<div className='inline-block p-4 bg-blue-50 border border-blue-200 rounded-lg'>
					<div className='flex items-center gap-2 text-blue-800 text-sm'>
						<svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
							/>
						</svg>
						<span className='font-medium'>
							랭킹은 매월 1일 00:00에 초기화됩니다. 다음 갱신:{" "}
							{nextUpdateDate.toLocaleDateString("ko-KR")}
						</span>
					</div>
				</div>
			</div>

			{!isAuthenticated ? (
				<div className='bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center text-gray-600'>
					랭킹은 로그인 후 확인할 수 있습니다.
				</div>
			) : loading ? (
				<div className='flex justify-center py-20'>
					<div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary'></div>
				</div>
			) : error ? (
				<div className='bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 text-center'>
					{error}
				</div>
			) : (
				<div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
					{/* 구매/대여 책 수 랭킹 */}
					<div className='bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border-2 border-gray-200 p-8'>
						<div className='text-center mb-8'>
							<h2 className='text-3xl font-bold text-primary mb-2'>📚 구매/대여 책 수</h2>
							<p className='text-gray-600'>이번 달 기준</p>
						</div>

						{/* 올림픽 단상 */}
						<div className='flex items-end justify-center gap-4 mb-8'>
							{/* 2등 */}
							<Podium user={orderedBooksPodium[0]} rank={2} type='books' />
							{/* 1등 */}
							<Podium user={orderedBooksPodium[1]} rank={1} type='books' />
							{/* 3등 */}
							<Podium user={orderedBooksPodium[2]} rank={3} type='books' />
						</div>

						<div className='bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm'>
							<div className='px-6 py-3 bg-gray-50 text-sm font-semibold text-gray-700 flex items-center justify-between'>
								<span>TOP 10 목록</span>
								<span className='text-xs text-gray-500'>총 {topBooksList.length}명</span>
							</div>
							<ul>
								{topBooksList.map((user) => (
									<li
										key={`${user.rank}-${user.userId}`}
										className={`px-6 py-4 flex items-center justify-between text-sm transition-colors ${
											user.isMe ? "bg-primary/10 text-primary-dark font-semibold" : "text-gray-700"
										}`}
									>
										<div className='flex items-center gap-4'>
											<span className='text-lg font-bold text-primary'>#{user.rank}</span>
											<div>
												<div className='flex items-center gap-2'>
													<span>{user.username}</span>
													{user.isMe && (
														<span className='text-xs bg-primary text-white rounded-full px-2 py-0.5'>
															나
														</span>
													)}
												</div>
												<div className='text-xs text-gray-500'>
													구매 {user.purchaseCount ?? 0} · 대여 {user.rentalCount ?? 0}
												</div>
											</div>
										</div>
										<div className='text-right'>
											<div className='text-base font-bold text-blue-600'>
												{user.totalCount ?? 0}권
											</div>
										</div>
									</li>
								))}
								{topBooksList.length === 0 && (
									<li className='px-6 py-6 text-center text-sm text-gray-500'>
										아직 랭킹 데이터가 없습니다.
									</li>
								)}
							</ul>
						</div>
					</div>

					{/* 포인트 랭킹 */}
					<div className='bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-xl border-2 border-purple-200 p-8'>
						<div className='text-center mb-8'>
							<h2 className='text-3xl font-bold text-purple-600 mb-2'>💎 포인트</h2>
							<p className='text-gray-600'>이번 달 기준</p>
						</div>

						{/* 올림픽 단상 */}
						<div className='flex items-end justify-center gap-4 mb-8'>
							{/* 2등 */}
							<Podium user={orderedPointsPodium[0]} rank={2} type='points' />
							{/* 1등 */}
							<Podium user={orderedPointsPodium[1]} rank={1} type='points' />
							{/* 3등 */}
							<Podium user={orderedPointsPodium[2]} rank={3} type='points' />
						</div>

						<div className='bg-white rounded-xl border border-purple-100 overflow-hidden shadow-sm'>
							<div className='px-6 py-3 bg-purple-50 text-sm font-semibold text-purple-700 flex items-center justify-between'>
								<span>TOP 10 목록</span>
								<span className='text-xs text-purple-400'>총 {topPointsList.length}명</span>
							</div>
							<ul>
								{topPointsList.map((user) => (
									<li
										key={`${user.rank}-${user.userId}`}
										className={`px-6 py-4 flex items-center justify-between text-sm transition-colors ${
											user.isMe ? "bg-purple-100/60 text-purple-700 font-semibold" : "text-gray-700"
										}`}
									>
										<div className='flex items-center gap-4'>
											<span className='text-lg font-bold text-purple-600'>#{user.rank}</span>
											<div>
												<div className='flex items-center gap-2'>
													<span>{user.username}</span>
													{user.isMe && (
														<span className='text-xs bg-purple-600 text-white rounded-full px-2 py-0.5'>
															나
														</span>
													)}
												</div>
												<div className='text-xs text-gray-500'>회원 ID: {user.userId}</div>
											</div>
										</div>
										<div className='text-right'>
											<div className='text-base font-bold text-purple-600'>
												{(user.points ?? 0).toLocaleString()}P
											</div>
										</div>
									</li>
								))}
								{topPointsList.length === 0 && (
									<li className='px-6 py-6 text-center text-sm text-gray-500'>
										아직 랭킹 데이터가 없습니다.
									</li>
								)}
							</ul>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RankingPage;
