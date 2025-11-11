import { useState, useEffect } from "react";
import { purchaseAPI } from "../lib/api/purchase";
import { rentalAPI } from "../lib/api/rental";
import { pointsAPI } from "../lib/api/points";
import useAuthStore from "../lib/store/authStore";

const RankingPage = () => {
	const { isAuthenticated } = useAuthStore();
	const [myBookCount, setMyBookCount] = useState(0);
	const [myPoints, setMyPoints] = useState(0);
	const [loading, setLoading] = useState(true);

	// 내 데이터 로드
	useEffect(() => {
		const fetchMyData = async () => {
			if (!isAuthenticated) {
				setLoading(false);
				return;
			}

			try {
				const [purchasedResponse, rentedResponse, activeRentalsResponse, pointsResponse] =
					await Promise.all([
						purchaseAPI.getHistory().catch(() => ({ data: [] })),
						rentalAPI.getHistory().catch(() => ({ data: [] })),
						rentalAPI.getActive().catch(() => ({ data: [] })),
						pointsAPI.getMyPoints().catch(() => ({ data: { totalPoints: 0 } })),
					]);

				// 구매한 책 수
				const purchasedCount = purchasedResponse.data?.length || 0;

				// 현재 대여 중인 책 수
				const activeRentalsCount = activeRentalsResponse.data?.length || 0;

				// 총 책 수 (구매 + 현재 대여 중)
				setMyBookCount(purchasedCount + activeRentalsCount);

				// 포인트
				setMyPoints(pointsResponse.data?.totalPoints || 0);
			} catch (error) {
				console.error("내 데이터 로드 실패:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchMyData();
	}, [isAuthenticated]);

	// 더미 데이터 - 구매/대여 책 수 랭킹
	const booksRanking = [
		{
			rank: 1,
			username: "박상준",
			bookCount: myBookCount,
			badge: "🥇",
			isMe: true,
		},
		{
			rank: 2,
			username: "최가은",
			bookCount: 3,
			badge: "🥈",
		},
		{
			rank: 3,
			username: "박유경",
			bookCount: 1,
			badge: "🥉",
		},
	];

	// 더미 데이터 - 포인트 랭킹
	const pointsRanking = [
		{
			rank: 1,
			username: "박상준",
			points: myPoints,
			badge: "🥇",
			isMe: true,
		},
		{
			rank: 2,
			username: "최가은",
			points: 5,
			badge: "🥈",
		},
		{
			rank: 3,
			username: "박유경",
			points: 0,
			badge: "🥉",
		},
	];

	// 현재 날짜 기준으로 이번 달 정보
	const now = new Date();
	const currentMonth = now.getMonth() + 1;
	const currentYear = now.getFullYear();
	const nextUpdateDate = new Date(currentYear, currentMonth, 1);

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

		return (
			<div className='flex flex-col items-center'>
				{/* 사용자 정보 (단상 위) */}
				<div
					className={`mb-3 text-center ${
						user.isMe ? "ring-2 ring-primary ring-offset-2 rounded-xl px-3 py-2" : ""
					}`}
				>
					<div className='text-4xl mb-2'>{user.badge}</div>
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
						{isBooks ? `${user.bookCount}권` : `${user.points.toLocaleString()}P`}
					</div>
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

			{loading ? (
				<div className='flex justify-center py-20'>
					<div className='animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary'></div>
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
							<Podium user={booksRanking[1]} rank={2} type='books' />
							{/* 1등 */}
							<Podium user={booksRanking[0]} rank={1} type='books' />
							{/* 3등 */}
							<Podium user={booksRanking[2]} rank={3} type='books' />
						</div>

						{/* 통계 */}
						<div className='bg-white rounded-xl p-6 border border-gray-200'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='text-center'>
									<div className='text-2xl font-bold text-blue-600'>
										{booksRanking.reduce((sum, user) => sum + user.bookCount, 0)}권
									</div>
									<div className='text-sm text-gray-600 mt-1'>총 책 수</div>
								</div>
								<div className='text-center'>
									<div className='text-2xl font-bold text-green-600'>
										{Math.round(
											(booksRanking.reduce((sum, user) => sum + user.bookCount, 0) /
												booksRanking.length) *
												10
										) / 10}
										권
									</div>
									<div className='text-sm text-gray-600 mt-1'>평균 책 수</div>
								</div>
							</div>
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
							<Podium user={pointsRanking[1]} rank={2} type='points' />
							{/* 1등 */}
							<Podium user={pointsRanking[0]} rank={1} type='points' />
							{/* 3등 */}
							<Podium user={pointsRanking[2]} rank={3} type='points' />
						</div>

						{/* 통계 */}
						<div className='bg-white rounded-xl p-6 border border-gray-200'>
							<div className='grid grid-cols-2 gap-4'>
								<div className='text-center'>
									<div className='text-2xl font-bold text-purple-600'>
										{pointsRanking.reduce((sum, user) => sum + user.points, 0).toLocaleString()}P
									</div>
									<div className='text-sm text-gray-600 mt-1'>총 포인트</div>
								</div>
								<div className='text-center'>
									<div className='text-2xl font-bold text-purple-600'>
										{Math.round(
											(pointsRanking.reduce((sum, user) => sum + user.points, 0) /
												pointsRanking.length) *
												10
										) / 10}
										P
									</div>
									<div className='text-sm text-gray-600 mt-1'>평균 포인트</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default RankingPage;
