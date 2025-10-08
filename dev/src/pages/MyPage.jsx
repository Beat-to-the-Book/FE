import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import { purchaseAPI } from "../lib/api/purchase";
import { rentalAPI } from "../lib/api/rental";
import { reportAPI } from "../lib/api/report";
import { reviewAPI } from "../lib/api/review";
import { readingAPI } from "../lib/api/reading";
import useAuthStore from "../lib/store/authStore";
import ReadingCalendar from "../components/ReadingCalendar";
import AddReadingModal from "../components/AddReadingModal";

// 임시 데이터 (API 연동 전까지 사용)
const TEMP_BOOK_REPORTS = [
	{
		id: 1,
		bookId: 1,
		bookTitle: "인생을 바꾼 한 권의 책",
		title: "나의 독서 여정",
		content: "이 책을 통해 많은 것을 배웠습니다...",
		createdAt: "2025-10-15",
	},
	{
		id: 2,
		bookId: 2,
		bookTitle: "미움받을 용기",
		title: "자기 수용의 여정",
		content: "이 책은 제 인생의 전환점이 되었습니다...",
		createdAt: "2024-10-13",
	},
];

const TEMP_REVIEWS = [
	{
		id: 1,
		bookId: 1,
		bookTitle: "인생을 바꾼 한 권의 책",
		rating: 5,
		content: "정말 좋은 책이었습니다. 추천합니다!",
		createdAt: "2025-10-16",
	},
	{
		id: 2,
		bookId: 2,
		bookTitle: "미움받을 용기",
		rating: 4,
		content: "기대했던 것보다 좋았어요.",
		createdAt: "2025-10-14",
	},
];

// 중복 제거 및 최신 기록만 유지하는 유틸리티 함수
const removeDuplicates = (books, dateField) => {
	const uniqueBooks = new Map();

	books.forEach((book) => {
		const existingBook = uniqueBooks.get(book.id);
		if (!existingBook || new Date(book[dateField]) > new Date(existingBook[dateField])) {
			uniqueBooks.set(book.id, book);
		}
	});

	return Array.from(uniqueBooks.values());
};

const MyPage = () => {
	const navigate = useNavigate();
	const { isAuthenticated, userId } = useAuthStore();
	const [activeTab, setActiveTab] = useState("reports");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [purchasedBooks, setPurchasedBooks] = useState([]);
	const [rentedBooks, setRentedBooks] = useState([]);
	const [myReports, setMyReports] = useState([]);
	const [myReviews, setMyReviews] = useState([]);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [reviewsError, setReviewsError] = useState("");
	const [readingRecords, setReadingRecords] = useState([]);
	const [selectedDate, setSelectedDate] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingReading, setEditingReading] = useState(null);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}

		const fetchData = async () => {
			try {
				setLoading(true);
				const [purchasedResponse, rentedResponse, reportsResponse] = await Promise.all([
					purchaseAPI.getHistory(),
					rentalAPI.getHistory(),
					reportAPI.getMyReports(),
				]);

				// 중복 제거 및 최신 기록만 유지
				const uniquePurchasedBooks = removeDuplicates(purchasedResponse.data, "purchaseDate");
				const uniqueRentedBooks = removeDuplicates(rentedResponse.data, "rentalDate");

				setPurchasedBooks(uniquePurchasedBooks);
				setRentedBooks(uniqueRentedBooks);
				setMyReports(reportsResponse.data);
				setLoading(false);
			} catch (error) {
				setError("데이터를 불러오는데 실패했습니다.");
				setLoading(false);
			}
		};

		fetchData();
	}, [isAuthenticated, navigate]);

	// 독서 기록 조회
	useEffect(() => {
		const fetchReadingRecords = async () => {
			try {
				const response = await readingAPI.getMyReadings();
				setReadingRecords(response.data);
			} catch (error) {
				console.error("독서 기록 조회 실패:", error);
			}
		};

		if (isAuthenticated) {
			fetchReadingRecords();
		}
	}, [isAuthenticated]);

	useEffect(() => {
		const fetchMyReviews = async () => {
			try {
				setReviewsLoading(true);
				// 모든 구매한 책의 리뷰를 가져옴
				const reviewPromises = purchasedBooks.map((book) => reviewAPI.getBookReviews(book.id));
				const reviewResponses = await Promise.all(reviewPromises);

				// 내가 작성한 리뷰만 필터링
				const myReviews = reviewResponses
					.flatMap((response) => response.data.reviews)
					.filter((review) => review.author === userId);

				setMyReviews(myReviews);
				setReviewsError("");
			} catch (error) {
				console.error("리뷰 조회 에러:", error);
				setReviewsError("리뷰를 불러오는데 실패했습니다.");
			} finally {
				setReviewsLoading(false);
			}
		};

		if (activeTab === "reviews" && purchasedBooks.length > 0) {
			fetchMyReviews();
		}
	}, [activeTab, purchasedBooks, userId]);

	const handleDeleteReview = async (reviewId) => {
		if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
			return;
		}

		try {
			await reviewAPI.delete(reviewId);
			alert("리뷰가 삭제되었습니다.");
			// 리뷰 목록 새로고침
			const reviewPromises = purchasedBooks.map((book) => reviewAPI.getBookReviews(book.id));
			const reviewResponses = await Promise.all(reviewPromises);
			const myReviews = reviewResponses
				.flatMap((response) => response.data.reviews)
				.filter((review) => review.author === userId);
			setMyReviews(myReviews);
		} catch (error) {
			console.error("리뷰 삭제 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 필요합니다.");
				navigate("/login");
			} else if (error.response?.status === 403) {
				alert("삭제 권한이 없습니다.");
			} else {
				alert("리뷰 삭제에 실패했습니다.");
			}
		}
	};

	// 독서 기록 관련 함수들
	const handleDateClick = (date) => {
		setSelectedDate(date);
		setIsModalOpen(true);
		setEditingReading(null);
	};

	const handleAddReading = async (data) => {
		try {
			// 더미 데이터용: 선택한 책 정보 찾기
			const selectedBook = allBooks.find((book) => book.id === parseInt(data.bookId));
			await readingAPI.add(data, selectedBook);
			alert("독서 기록이 추가되었습니다.");
			setIsModalOpen(false);
			// 기록 새로고침
			const response = await readingAPI.getMyReadings();
			setReadingRecords(response.data);
		} catch (error) {
			console.error("독서 기록 추가 실패:", error);
			alert("독서 기록 추가에 실패했습니다.");
		}
	};

	const handleUpdateReading = async (data) => {
		try {
			await readingAPI.update(editingReading.id, data);
			alert("독서 기록이 수정되었습니다.");
			setIsModalOpen(false);
			setEditingReading(null);
			// 기록 새로고침
			const response = await readingAPI.getMyReadings();
			setReadingRecords(response.data);
		} catch (error) {
			console.error("독서 기록 수정 실패:", error);
			alert("독서 기록 수정에 실패했습니다.");
		}
	};

	const handleDeleteReading = async (readingId) => {
		if (!window.confirm("정말로 이 독서 기록을 삭제하시겠습니까?")) {
			return;
		}

		try {
			await readingAPI.delete(readingId);
			alert("독서 기록이 삭제되었습니다.");
			// 기록 새로고침
			const response = await readingAPI.getMyReadings();
			setReadingRecords(response.data);
		} catch (error) {
			console.error("독서 기록 삭제 실패:", error);
			alert("독서 기록 삭제에 실패했습니다.");
		}
	};

	// 구매한 책 + 대여한 책 목록 (중복 제거)
	const allBooks = [...purchasedBooks, ...rentedBooks].filter(
		(book, index, self) => index === self.findIndex((b) => b.id === book.id)
	);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-red-500'>{error}</div>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<h1 className='text-3xl font-bold text-gray-900 mb-6'>마이페이지</h1>

			{/* 통계 카드 */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
				<div className='bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition-shadow'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-sm font-medium text-gray-600'>읽은 책</span>
						<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
							<span className='text-xl'>📚</span>
						</div>
					</div>
					<div className='text-2xl font-bold text-primary'>{readingRecords.length}</div>
					<p className='text-xs text-gray-500 mt-1'>독서 기록</p>
				</div>

				<div className='bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition-shadow'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-sm font-medium text-gray-600'>독후감</span>
						<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
							<span className='text-xl'>📝</span>
						</div>
					</div>
					<div className='text-2xl font-bold text-primary'>{myReports.length}</div>
					<p className='text-xs text-gray-500 mt-1'>작성한 독후감</p>
				</div>

				<div className='bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition-shadow'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-sm font-medium text-gray-600'>리뷰</span>
						<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
							<span className='text-xl'>⭐</span>
						</div>
					</div>
					<div className='text-2xl font-bold text-primary'>{myReviews.length}</div>
					<p className='text-xs text-gray-500 mt-1'>작성한 리뷰</p>
				</div>

				<div className='bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition-shadow'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-sm font-medium text-gray-600'>보유 책</span>
						<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
							<span className='text-xl'>📖</span>
						</div>
					</div>
					<div className='text-2xl font-bold text-primary'>
						{purchasedBooks.length + rentedBooks.length}
					</div>
					<p className='text-xs text-gray-500 mt-1'>구매 + 대여</p>
				</div>
			</div>

			{/* 독서 달력 */}
			<div className='mb-10'>
				<ReadingCalendar
					readings={readingRecords}
					onDateClick={handleDateClick}
					selectedDate={selectedDate}
				/>

				{/* 최근 독서 기록 (간략) */}
				{readingRecords.length > 0 && (
					<div className='mt-8'>
						<div className='flex items-center justify-between mb-4'>
							<h3 className='text-lg font-bold text-gray-900'>최근 독서 기록</h3>
							<span className='text-sm text-gray-500'>총 {readingRecords.length}권</span>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
							{readingRecords.slice(0, 3).map((record) => (
								<div
									key={record.id}
									className='group bg-white rounded-lg shadow hover:shadow-md p-4 border border-gray-200 hover:border-primary/30 transition-all duration-200'
								>
									<div className='flex items-start gap-3 mb-3'>
										{record.frontCoverImageUrl && (
											<img
												src={record.frontCoverImageUrl}
												alt={record.bookTitle}
												className='w-12 h-16 object-cover rounded shadow-sm'
											/>
										)}
										<div className='flex-1 min-w-0'>
											<h4 className='font-bold text-sm text-gray-900 group-hover:text-primary transition-colors line-clamp-2 mb-1'>
												{record.bookTitle}
											</h4>
											<div className='flex items-center gap-1 text-xs text-gray-500'>
												<svg
													className='w-3 h-3 text-primary'
													fill='none'
													stroke='currentColor'
													viewBox='0 0 24 24'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														strokeWidth={2}
														d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
													/>
												</svg>
												<span>
													{new Date(record.startDate).toLocaleDateString("ko-KR", {
														month: "short",
														day: "numeric",
													})}
												</span>
											</div>
										</div>
									</div>
									<div className='flex gap-2'>
										<button
											onClick={() => {
												setEditingReading(record);
												setIsModalOpen(true);
											}}
											className='flex-1 px-2 py-1 text-xs font-medium text-primary bg-primary/5 hover:bg-primary/10 rounded transition-colors'
										>
											수정
										</button>
										<button
											onClick={() => handleDeleteReading(record.id)}
											className='flex-1 px-2 py-1 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded transition-colors'
										>
											삭제
										</button>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* 독서 기록 추가/수정 모달 */}
				<AddReadingModal
					isOpen={isModalOpen}
					onClose={() => {
						setIsModalOpen(false);
						setEditingReading(null);
					}}
					onSubmit={editingReading ? handleUpdateReading : handleAddReading}
					selectedDate={selectedDate}
					books={allBooks}
					editData={editingReading}
				/>
			</div>

			{/* 탭 메뉴 */}
			<div className='flex gap-2 mb-8 bg-gray-50 p-1 rounded-lg border border-gray-200'>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
						activeTab === "reports"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("reports")}
				>
					📝 내 독후감
				</button>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
						activeTab === "reviews"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("reviews")}
				>
					⭐ 내 리뷰
				</button>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
						activeTab === "purchased"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("purchased")}
				>
					📚 구매한 책
				</button>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 ${
						activeTab === "rented"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("rented")}
				>
					🔖 대여한 책
				</button>
			</div>

			{/* 독후감 탭 */}
			{activeTab === "reports" && (
				<div className='space-y-3'>
					{myReports.map((report) => (
						<div
							key={report.id}
							className='group bg-white rounded-lg shadow hover:shadow-lg p-5 cursor-pointer border border-gray-200 hover:border-primary/30 transition-all duration-200'
							onClick={() => navigate(`/reports/${report.id}`)}
						>
							<div className='flex justify-between items-start mb-3'>
								<div className='flex-1'>
									<h3 className='font-bold text-lg text-gray-900 group-hover:text-primary transition-colors mb-2'>
										{report.bookTitle}
									</h3>
									<div className='flex items-center gap-3 text-sm text-gray-500'>
										<span className='flex items-center gap-1'>
											<svg
												className='w-4 h-4 text-primary'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
												/>
											</svg>
											{new Date(report.createdAt).toLocaleDateString("ko-KR")}
										</span>
										{!report.publicVisible && (
											<span className='px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-medium'>
												🔒 비공개
											</span>
										)}
									</div>
								</div>
								<div className='flex items-center gap-1'>
									{[...Array(5)].map((_, i) => (
										<svg
											key={i}
											className={`w-5 h-5 ${
												i < report.rating ? "text-primary-light" : "text-gray-300"
											}`}
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
										</svg>
									))}
								</div>
							</div>
							<p className='text-gray-700 text-sm line-clamp-2 leading-relaxed'>{report.content}</p>
						</div>
					))}
					{myReports.length === 0 && (
						<div className='text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
							<div className='text-5xl mb-3 opacity-50'>📝</div>
							<p className='text-base font-semibold text-gray-700 mb-1'>작성한 독후감이 없습니다</p>
							<p className='text-sm text-gray-500'>책을 읽고 독후감을 작성해보세요</p>
						</div>
					)}
				</div>
			)}

			{/* 리뷰 탭 */}
			{activeTab === "reviews" && (
				<div className='space-y-3'>
					{reviewsLoading ? (
						<div className='flex justify-center py-12'>
							<div className='animate-spin rounded-full h-10 w-10 border-3 border-primary border-t-transparent'></div>
						</div>
					) : reviewsError ? (
						<div className='text-center py-16 bg-red-50 rounded-lg border border-red-200'>
							<p className='text-red-600'>{reviewsError}</p>
						</div>
					) : (
						<div className='space-y-3'>
							{myReviews.map((review) => (
								<div
									key={review.reviewId}
									className='group bg-white rounded-lg shadow hover:shadow-lg p-5 cursor-pointer border border-gray-200 hover:border-primary/30 transition-all duration-200'
									onClick={() => navigate(`/book/${review.bookId}`)}
								>
									<div className='flex justify-between items-start mb-3'>
										<div className='flex-1'>
											<h3 className='text-lg font-bold text-gray-900 group-hover:text-primary transition-colors mb-2'>
												{review.bookTitle}
											</h3>
											<div className='flex items-center gap-3'>
												<div className='flex items-center gap-1'>
													{[...Array(5)].map((_, i) => (
														<svg
															key={i}
															className={`w-4 h-4 ${
																i < review.rating ? "text-primary-light" : "text-gray-300"
															}`}
															fill='currentColor'
															viewBox='0 0 20 20'
														>
															<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
														</svg>
													))}
												</div>
												<span className='text-xs text-gray-500'>{review.createdAt}</span>
											</div>
										</div>
										<button
											onClick={(e) => {
												e.stopPropagation();
												handleDeleteReview(review.reviewId);
											}}
											className='px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
										>
											삭제
										</button>
									</div>
									<p className='text-gray-700 text-sm line-clamp-2 leading-relaxed'>
										{review.comment}
									</p>
								</div>
							))}
							{myReviews.length === 0 && (
								<div className='text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
									<div className='text-5xl mb-3 opacity-50'>⭐</div>
									<p className='text-base font-semibold text-gray-700 mb-1'>
										작성한 리뷰가 없습니다
									</p>
									<p className='text-sm text-gray-500'>책을 읽고 리뷰를 남겨보세요</p>
								</div>
							)}
						</div>
					)}
				</div>
			)}

			{/* 구매한 책 탭 */}
			{activeTab === "purchased" && (
				<div>
					{purchasedBooks.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
							{purchasedBooks.map((book) => (
								<div
									key={book.id}
									className='group bg-white rounded-lg shadow hover:shadow-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-primary/30 transition-all duration-200'
									onClick={() => navigate(`/book/${book.id}`)}
								>
									<div className='relative'>
										<img
											src={book.frontCoverImageUrl}
											alt={book.title}
											className='w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300'
										/>
										<div className='absolute top-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs font-semibold shadow-md'>
											구매완료
										</div>
									</div>
									<div className='p-4'>
										<h3 className='font-bold text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors'>
											{book.title}
										</h3>
										<p className='text-sm text-gray-600 mb-3'>{book.author}</p>
										<div className='flex items-center gap-1.5 text-xs text-gray-500'>
											<svg
												className='w-4 h-4 text-primary'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'
												/>
											</svg>
											{new Date(book.purchaseDate).toLocaleDateString("ko-KR")}
										</div>
									</div>
								</div>
							))}
						</div>
					) : (
						<div className='text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
							<div className='text-5xl mb-3 opacity-50'>📚</div>
							<p className='text-base font-semibold text-gray-700 mb-1'>구매한 책이 없습니다</p>
							<p className='text-sm text-gray-500'>마음에 드는 책을 구매해보세요</p>
						</div>
					)}
				</div>
			)}

			{/* 대여한 책 탭 */}
			{activeTab === "rented" && (
				<div>
					{rentedBooks.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
							{rentedBooks.map((book) => {
								const daysLeft = Math.ceil(
									(new Date(book.returnDate) - new Date()) / (1000 * 60 * 60 * 24)
								);
								const isOverdue = daysLeft < 0;
								const isUrgent = daysLeft <= 3 && daysLeft >= 0;

								return (
									<div
										key={book.id}
										className='group bg-white rounded-lg shadow hover:shadow-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-primary/30 transition-all duration-200'
										onClick={() => navigate(`/book/${book.id}`)}
									>
										<div className='relative'>
											<img
												src={book.frontCoverImageUrl}
												alt={book.title}
												className='w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300'
											/>
											<div
												className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold shadow-md ${
													isOverdue
														? "bg-red-500 text-white"
														: isUrgent
														? "bg-orange-500 text-white"
														: "bg-primary-light text-white"
												}`}
											>
												{isOverdue ? "연체" : isUrgent ? `D-${daysLeft}` : "대여중"}
											</div>
										</div>
										<div className='p-4'>
											<h3 className='font-bold text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors'>
												{book.title}
											</h3>
											<p className='text-sm text-gray-600 mb-3'>{book.author}</p>
											<div className='space-y-1.5 text-xs text-gray-500'>
												<div className='flex items-center gap-1.5'>
													<svg
														className='w-4 h-4 text-primary'
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
														/>
													</svg>
													대여: {new Date(book.rentalDate).toLocaleDateString("ko-KR")}
												</div>
												<div className='flex items-center gap-1.5'>
													<svg
														className={`w-4 h-4 ${
															isOverdue
																? "text-red-500"
																: isUrgent
																? "text-orange-500"
																: "text-primary"
														}`}
														fill='none'
														stroke='currentColor'
														viewBox='0 0 24 24'
													>
														<path
															strokeLinecap='round'
															strokeLinejoin='round'
															strokeWidth={2}
															d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
														/>
													</svg>
													<span className={isOverdue ? "text-red-600 font-medium" : ""}>
														반납: {new Date(book.returnDate).toLocaleDateString("ko-KR")}
													</span>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className='text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
							<div className='text-5xl mb-3 opacity-50'>🔖</div>
							<p className='text-base font-semibold text-gray-700 mb-1'>대여한 책이 없습니다</p>
							<p className='text-sm text-gray-500'>원하는 책을 대여해보세요</p>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default MyPage;
