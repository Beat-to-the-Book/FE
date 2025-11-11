import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import { purchaseAPI } from "../lib/api/purchase";
import { rentalAPI } from "../lib/api/rental";
import { reportAPI } from "../lib/api/report";
import { reviewAPI } from "../lib/api/review";
import { calendarAPI } from "../lib/api/calendar";
import { pointsAPI } from "../lib/api/points";
import useAuthStore from "../lib/store/authStore";
import ReadingCalendar from "../components/ReadingCalendar";
import AddReadingModal from "../components/AddReadingModal";

// 중복 제거 및 최신 기록만 유지하는 유틸리티 함수
const removeDuplicates = (books, dateField) => {
	const uniqueBooks = new Map();

	books.forEach((book) => {
		// purchase/history의 id는 bookId를 의미
		const bookId = book.bookId || book.id;
		const existingBook = uniqueBooks.get(bookId);
		if (!existingBook || new Date(book[dateField]) > new Date(existingBook[dateField])) {
			uniqueBooks.set(bookId, book);
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
	const [activeRentals, setActiveRentals] = useState([]);
	const [myReports, setMyReports] = useState([]);
	const [activeRentalsLoading, setActiveRentalsLoading] = useState(false);
	const [myReviews, setMyReviews] = useState([]);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [reviewsError, setReviewsError] = useState("");
	const [readingRecords, setReadingRecords] = useState([]);
	const [monthlyReadingRecords, setMonthlyReadingRecords] = useState([]);
	const [selectedDate, setSelectedDate] = useState(null);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingReading, setEditingReading] = useState(null);
	const [points, setPoints] = useState(0);
	const [pointsLoading, setPointsLoading] = useState(true);
	const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
	const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth() + 1);

	const handleMonthChange = useCallback((year, month) => {
		setCalendarYear(year);
		setCalendarMonth(month);
	}, []);

	const activeRentalKeys = useMemo(
		() => new Set(activeRentals.map((rental) => rental.rentalId || rental.id || rental.bookId)),
		[activeRentals]
	);

	const uniqueReadBooksCount = useMemo(() => {
		return new Set((readingRecords || []).map((record) => record.bookId)).size;
	}, [readingRecords]);

	const fetchAllCalendarRecords = useCallback(async () => {
		try {
			const response = await calendarAPI.getAll();
			setReadingRecords(response.data || []);
		} catch (error) {
			console.error("독서 기록 전체 조회 실패:", error);
		}
	}, []);

	const fetchMonthlyCalendarRecords = useCallback(async (year, month) => {
		try {
			const response = await calendarAPI.getByMonth(year, month);
			const items = response.data?.items || [];
			setMonthlyReadingRecords(items);
		} catch (error) {
			console.error("월별 독서 기록 조회 실패:", error);
		}
	}, []);

	const enrichPurchasedBooks = useCallback(
		async (purchases) =>
			Promise.all(
				(purchases || []).map(async (purchase) => {
					const bookId = purchase.bookId || purchase.id;

					if (purchase.frontCoverImageUrl) {
						return {
							...purchase,
							id: bookId,
							bookId,
						};
					}

					try {
						if (bookId) {
							const bookDetail = await bookAPI.getById(bookId);
							return {
								...purchase,
								id: bookId,
								bookId,
								frontCoverImageUrl: bookDetail.data.frontCoverImageUrl,
								backCoverImageUrl: bookDetail.data.backCoverImageUrl,
								leftCoverImageUrl: bookDetail.data.leftCoverImageUrl,
								author: bookDetail.data.author || purchase.author,
								publisher: bookDetail.data.publisher || purchase.publisher,
							};
						}
					} catch (error) {
						console.error(`책 ${bookId} 정보 가져오기 실패:`, error);
					}

					return {
						...purchase,
						id: bookId,
						bookId,
					};
				})
			),
		[]
	);

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}

		const fetchData = async () => {
			try {
				setLoading(true);
				const [
					purchasedResponse,
					rentedResponse,
					reportsResponse,
					activeRentalsResponse,
					pointsResponse,
				] = await Promise.all([
					purchaseAPI.getHistory(),
					rentalAPI.getHistory(),
					reportAPI.getMyReports(),
					rentalAPI.getActive().catch(() => ({ data: [] })), // 활성 대여가 없을 수 있음
					pointsAPI.getMyPoints().catch(() => ({ data: { totalPoints: 0 } })),
				]);

				// purchase history에 이미지 URL이 없으면 bookId로 책 상세 정보 가져오기
				// purchase/history의 id 필드는 bookId를 의미함
				const purchasedWithImages = await enrichPurchasedBooks(purchasedResponse.data);

				// active rentals에 이미지 URL이 없으면 bookId로 책 상세 정보 가져오기
				const activeRentalsWithImages = await Promise.all(
					(activeRentalsResponse.data || []).map(async (rental) => {
						// 이미 이미지 URL이 있으면 그대로 사용
						if (rental.frontCoverImageUrl) {
							return rental;
						}
						// 없으면 bookId로 책 상세 정보 가져오기
						try {
							const bookId = rental.bookId;
							if (bookId) {
								const bookDetail = await bookAPI.getById(bookId);
								return {
									...rental,
									frontCoverImageUrl: bookDetail.data.frontCoverImageUrl,
									backCoverImageUrl: bookDetail.data.backCoverImageUrl,
									leftCoverImageUrl: bookDetail.data.leftCoverImageUrl,
								};
							}
						} catch (error) {
							console.error(`책 ${rental.bookId} 정보 가져오기 실패:`, error);
						}
						return rental;
					})
				);

				// 중복 제거 및 최신 기록만 유지
				const uniquePurchasedBooks = removeDuplicates(purchasedWithImages, "purchaseDate");
				const uniqueRentedBooks = removeDuplicates(rentedResponse.data, "rentalDate");

				setPurchasedBooks(uniquePurchasedBooks);
				setRentedBooks(uniqueRentedBooks);
				setActiveRentals(activeRentalsWithImages);
				setMyReports(reportsResponse.data);
				setPoints(pointsResponse.data?.totalPoints || 0);
				setPointsLoading(false);
				setLoading(false);
			} catch (error) {
				setError("데이터를 불러오는데 실패했습니다.");
				setLoading(false);
				setPointsLoading(false);
			}
		};

		fetchData();
	}, [enrichPurchasedBooks, isAuthenticated, navigate]);

	// 독서 기록 조회
	useEffect(() => {
		if (isAuthenticated) {
			fetchAllCalendarRecords();
		}
	}, [isAuthenticated, fetchAllCalendarRecords]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchMonthlyCalendarRecords(calendarYear, calendarMonth);
		}
	}, [isAuthenticated, calendarYear, calendarMonth, fetchMonthlyCalendarRecords]);

	const fetchMyReviews = useCallback(async () => {
		if (!isAuthenticated || purchasedBooks.length === 0) {
			setMyReviews([]);
			return;
		}

		try {
			setReviewsLoading(true);
			const reviewResults = await Promise.all(
				purchasedBooks.map(async (book) => {
					const bookId = book.bookId || book.id;

					try {
						const response = await reviewAPI.getBookReviews(bookId);
						return {
							book,
							reviews: response.data?.reviews || [],
						};
					} catch (error) {
						console.error(`리뷰 조회 실패 (bookId: ${bookId})`, error);
						return {
							book,
							reviews: [],
						};
					}
				})
			);

			const myReviewsData = reviewResults.flatMap(({ book, reviews }) => {
				const bookId = book.bookId || book.id;
				const bookTitle = book.bookTitle || book.title;
				const coverImage = book.frontCoverImageUrl;

				return reviews
					.filter((review) => review.author === userId)
					.map((review) => ({
						...review,
						bookId,
						bookTitle: review.bookTitle || bookTitle,
						frontCoverImageUrl: review.frontCoverImageUrl || coverImage,
					}));
			});

			setMyReviews(myReviewsData);
			setReviewsError("");
		} catch (error) {
			console.error("리뷰 조회 에러:", error);
			setReviewsError("리뷰를 불러오는데 실패했습니다.");
		} finally {
			setReviewsLoading(false);
		}
	}, [isAuthenticated, purchasedBooks, userId]);

	useEffect(() => {
		fetchMyReviews();
	}, [fetchMyReviews]);

	const handleDeleteReview = async (reviewId) => {
		if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
			return;
		}

		try {
			await reviewAPI.delete(reviewId);
			alert("리뷰가 삭제되었습니다.");
			// 리뷰 목록 새로고침
			await fetchMyReviews();
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
		setEditingReading(null);
		setIsModalOpen(true);
	};

	const handleReadingSelect = (reading) => {
		if (!reading) {
			return;
		}

		setSelectedDate(new Date(reading.startDate));
		setEditingReading(reading);
		setIsModalOpen(true);
	};

	const handleAddReading = async (data) => {
		try {
			await calendarAPI.create({
				bookId: Number(data.bookId),
				startDate: data.startDate,
				endDate: data.endDate,
				memo: data.memo,
			});
			alert("독서 기록이 추가되었습니다.");
			setIsModalOpen(false);
			await Promise.all([
				fetchAllCalendarRecords(),
				fetchMonthlyCalendarRecords(calendarYear, calendarMonth),
			]);
		} catch (error) {
			console.error("독서 기록 추가 실패:", error);
			if (error.response?.status === 401) {
				alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
				navigate("/login");
			} else {
				alert(
					`독서 기록 추가에 실패했습니다: ${error.response?.data?.message || "알 수 없는 오류"}`
				);
			}
		}
	};

	const handleUpdateReading = async (data) => {
		try {
			await calendarAPI.update(editingReading.id, {
				startDate: data.startDate,
				endDate: data.endDate,
				memo: data.memo,
			});
			alert("독서 기록이 수정되었습니다.");
			setIsModalOpen(false);
			setEditingReading(null);
			await Promise.all([
				fetchAllCalendarRecords(),
				fetchMonthlyCalendarRecords(calendarYear, calendarMonth),
			]);
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
			await calendarAPI.remove(readingId);
			alert("독서 기록이 삭제되었습니다.");
			await Promise.all([
				fetchAllCalendarRecords(),
				fetchMonthlyCalendarRecords(calendarYear, calendarMonth),
			]);
		} catch (error) {
			console.error("독서 기록 삭제 실패:", error);
			alert("독서 기록 삭제에 실패했습니다.");
		}
	};

	// 대여 반납 처리
	const handleReturnRental = async (rentalId, e) => {
		e.stopPropagation();
		if (!window.confirm("정말로 이 책을 반납하시겠습니까?")) {
			return;
		}

		try {
			await rentalAPI.return(rentalId);
			alert("반납이 완료되었습니다.");
			// 데이터 새로고침
			const [rentedResponse, activeRentalsResponse] = await Promise.all([
				rentalAPI.getHistory(),
				rentalAPI.getActive().catch(() => ({ data: [] })),
			]);

			// active rentals에 이미지 URL 추가
			const activeRentalsWithImages = await Promise.all(
				(activeRentalsResponse.data || []).map(async (rental) => {
					if (rental.frontCoverImageUrl) {
						return rental;
					}
					try {
						const bookId = rental.bookId;
						if (bookId) {
							const bookDetail = await bookAPI.getById(bookId);
							return {
								...rental,
								frontCoverImageUrl: bookDetail.data.frontCoverImageUrl,
								backCoverImageUrl: bookDetail.data.backCoverImageUrl,
								leftCoverImageUrl: bookDetail.data.leftCoverImageUrl,
							};
						}
					} catch (error) {
						console.error(`책 ${rental.bookId} 정보 가져오기 실패:`, error);
					}
					return rental;
				})
			);

			const uniqueRentedBooks = removeDuplicates(rentedResponse.data, "rentalDate");
			setRentedBooks(uniqueRentedBooks);
			setActiveRentals(activeRentalsWithImages);
		} catch (error) {
			console.error("반납 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
				navigate("/login");
			} else {
				alert(`반납에 실패했습니다: ${error.response?.data?.message || "알 수 없는 오류"}`);
			}
		}
	};

	// 환불 신청
	const handleRefund = async (purchaseId, e) => {
		e.stopPropagation();
		const reason = window.prompt("환불 사유를 입력해주세요:");
		if (!reason || reason.trim() === "") {
			return;
		}

		if (!window.confirm("정말로 이 구매를 환불하시겠습니까?")) {
			return;
		}

		try {
			await purchaseAPI.refund({
				purchaseId,
				reason: reason.trim(),
			});
			alert("환불 신청이 완료되었습니다.");
			// 구매 이력 새로고침
			const purchasedResponse = await purchaseAPI.getHistory();
			const purchasesWithImages = await enrichPurchasedBooks(purchasedResponse.data);
			const uniquePurchasedBooks = removeDuplicates(purchasesWithImages, "purchaseDate");
			setPurchasedBooks(uniquePurchasedBooks);
		} catch (error) {
			console.error("환불 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
				navigate("/login");
			} else {
				alert(`환불 신청에 실패했습니다: ${error.response?.data?.message || "알 수 없는 오류"}`);
			}
		}
	};

	// 구매한 책 + 대여한 책 목록 (중복 제거)
	// purchase/history의 id는 bookId를 의미
	const allBooks = [...purchasedBooks, ...rentedBooks].filter(
		(book, index, self) =>
			index === self.findIndex((b) => (b.bookId || b.id) === (book.bookId || book.id))
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
			<div className='flex items-center justify-between mb-6'>
				<h1 className='text-3xl font-bold text-gray-900'>마이페이지</h1>
				{/* 포인트 표시 */}
				<div className='flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-full border-2 border-yellow-200 shadow-md'>
					<span className='text-yellow-500 text-xl'>💰</span>
					<span className='text-gray-800 font-bold text-lg'>
						{pointsLoading ? "로딩..." : `${points}P`}
					</span>
				</div>
			</div>

			{/* 통계 카드 */}
			<div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
				<div className='bg-white rounded-lg shadow border border-gray-100 p-5 hover:shadow-md transition-shadow'>
					<div className='flex items-center justify-between mb-2'>
						<span className='text-sm font-medium text-gray-600'>읽은 책</span>
						<div className='w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center'>
							<span className='text-xl'>📚</span>
						</div>
					</div>
					<div className='text-2xl font-bold text-primary'>{uniqueReadBooksCount}</div>
					<p className='text-xs text-gray-500 mt-1'>읽은 도서 수</p>
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
					readings={monthlyReadingRecords}
					onDateClick={handleDateClick}
					onRecordSelect={handleReadingSelect}
					selectedDate={selectedDate}
					onMonthChange={handleMonthChange}
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
			<div className='flex gap-2 mb-8 bg-gray-50 p-1 rounded-lg border border-gray-200 overflow-x-auto'>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
						activeTab === "reports"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("reports")}
				>
					📝 내 독후감
				</button>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
						activeTab === "reviews"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("reviews")}
				>
					⭐ 내 리뷰
				</button>

				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
						activeTab === "purchased"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("purchased")}
				>
					📚 구매한 책
				</button>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
						activeTab === "active-rentals"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("active-rentals")}
				>
					📖 대여 중
					{activeRentals.length > 0 && (
						<span className='ml-1 px-1.5 py-0.5 bg-primary text-white text-xs rounded-full'>
							{activeRentals.length}
						</span>
					)}
				</button>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
						activeTab === "rented"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("rented")}
				>
					🔖 대여 이력
				</button>
				<button
					className={`flex-1 px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 whitespace-nowrap ${
						activeTab === "achievements"
							? "bg-white text-primary shadow-sm"
							: "text-gray-600 hover:text-primary hover:bg-white/50"
					}`}
					onClick={() => setActiveTab("achievements")}
				>
					🏆 도전과제
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

			{/* 도전과제 탭 */}
			{activeTab === "achievements" && (
				<div className='space-y-4'>
					<div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100'>
						<h2 className='text-2xl font-bold text-gray-900 mb-6'>📚 보유 책 권수 도전과제</h2>
						<div className='space-y-4'>
							{[
								{ count: 10, points: 5 },
								{ count: 20, points: 10 },
								{ count: 30, points: 15 },
								{ count: 40, points: 20 },
								{ count: 50, points: 25 },
							].map((achievement, index) => {
								const completed = allBooks.length >= achievement.count;
								return (
									<div
										key={index}
										className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
											completed
												? "bg-green-50 border-green-300 shadow-md"
												: "bg-gray-50 border-gray-200"
										}`}
									>
										<div className='flex items-center gap-4'>
											<div
												className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${
													completed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-600"
												}`}
											>
												{completed ? "✓" : achievement.count}
											</div>
											<div>
												<div className='font-semibold text-gray-900'>
													보유 책 {achievement.count}권
												</div>
												<div className='text-sm text-gray-600'>
													현재: {allBooks.length}권 / {achievement.count}권
												</div>
											</div>
										</div>
										<div className='flex items-center gap-2'>
											<span className='text-yellow-500 text-lg'>💰</span>
											<span
												className={`font-bold ${completed ? "text-green-600" : "text-gray-400"}`}
											>
												+{achievement.points}P
											</span>
											{completed && (
												<span className='ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full'>
													완료
												</span>
											)}
										</div>
									</div>
								);
							})}
						</div>
						<div className='mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
							<p className='text-sm text-blue-800'>
								💡 도전과제 완료 시 포인트는 자동으로 지급됩니다. (나중에 알림 기능 추가 예정)
							</p>
						</div>
					</div>
				</div>
			)}

			{/* 구매한 책 탭 */}
			{activeTab === "purchased" && (
				<div>
					{purchasedBooks.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
							{purchasedBooks.map((book) => {
								const isRefundRequested = book.status === "REFUND_REQUESTED";
								return (
									<div
										key={book.id}
										className='group relative bg-white rounded-lg shadow hover:shadow-xl overflow-hidden cursor-pointer border border-gray-200 hover:border-primary/30 transition-all duration-200'
										onClick={() => navigate(`/book/${book.bookId || book.id}`)}
									>
										<div className='relative'>
											{book.frontCoverImageUrl ? (
												<img
													src={book.frontCoverImageUrl}
													alt={book.bookTitle || book.title}
													className='w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300'
												/>
											) : (
												<div className='w-full h-56 bg-gray-100 flex items-center justify-center'>
													<span className='text-4xl'>📚</span>
												</div>
											)}
											<div
												className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold shadow-md ${
													isRefundRequested ? "bg-orange-500 text-white" : "bg-primary text-white"
												}`}
											>
												{isRefundRequested ? "환불 신청" : "구매완료"}
											</div>
										</div>
										<div className='p-4'>
											<h3 className='font-bold text-base text-gray-900 mb-1 line-clamp-2 group-hover:text-primary transition-colors'>
												{book.bookTitle || book.title}
											</h3>
											<p className='text-sm text-gray-600 mb-3'>{book.author}</p>
											<div className='space-y-2'>
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
												{!isRefundRequested && (
													<button
														onClick={(e) => {
															e.stopPropagation();
															handleRefund(book.id, e);
														}}
														className='w-full px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors'
													>
														환불 신청
													</button>
												)}
												{isRefundRequested && book.refundReason && (
													<div className='text-xs text-gray-600 bg-gray-50 p-2 rounded'>
														<div className='font-medium mb-1'>환불 사유:</div>
														<div className='text-gray-700'>{book.refundReason}</div>
													</div>
												)}
											</div>
										</div>
									</div>
								);
							})}
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

			{/* 현재 대여 중인 책 탭 */}
			{activeTab === "active-rentals" && (
				<div>
					{activeRentalsLoading ? (
						<div className='flex justify-center py-12'>
							<div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary'></div>
						</div>
					) : activeRentals.length > 0 ? (
						<div className='space-y-4'>
							{activeRentals.map((rental) => {
								const isUrgent = rental.daysRemaining <= 3;
								const isOverdue = rental.daysRemaining < 0;

								return (
									<div
										key={rental.bookId}
										className='group bg-white rounded-xl shadow-md hover:shadow-lg overflow-hidden border border-gray-200 hover:border-primary/30 transition-all duration-200'
									>
										<div className='p-6'>
											<div className='flex gap-6'>
												<div
													onClick={() => navigate(`/book/${rental.bookId}`)}
													className='cursor-pointer'
												>
													{rental.frontCoverImageUrl ? (
														<img
															src={rental.frontCoverImageUrl}
															alt={rental.title}
															className='w-24 h-32 object-cover rounded-lg shadow-sm'
														/>
													) : (
														<div className='w-24 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden'>
															<span className='text-4xl'>📚</span>
														</div>
													)}
												</div>
												<div className='flex-1'>
													<div className='flex justify-between items-start mb-3'>
														<div>
															<h3
																onClick={() => navigate(`/book/${rental.bookId}`)}
																className='text-xl font-bold text-gray-900 mb-1 cursor-pointer hover:text-primary transition-colors'
															>
																{rental.title}
															</h3>
															<p className='text-sm text-gray-600 mb-2'>{rental.author}</p>
															<p className='text-xs text-gray-500'>{rental.publisher}</p>
														</div>
														<div
															className={`px-3 py-1 rounded-full text-xs font-semibold ${
																isOverdue
																	? "bg-red-500 text-white"
																	: isUrgent
																	? "bg-orange-500 text-white"
																	: "bg-primary-light text-white"
															}`}
														>
															{isOverdue
																? `연체 ${Math.abs(rental.daysRemaining)}일`
																: `D-${rental.daysRemaining}`}
														</div>
													</div>
													<div className='grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg'>
														<div>
															<div className='text-xs text-gray-500 mb-1'>대여일</div>
															<div className='text-sm font-medium text-gray-900'>
																{new Date(rental.startDate).toLocaleDateString("ko-KR")}
															</div>
														</div>
														<div>
															<div className='text-xs text-gray-500 mb-1'>반납 예정일</div>
															<div
																className={`text-sm font-medium ${
																	isOverdue
																		? "text-red-600"
																		: isUrgent
																		? "text-orange-600"
																		: "text-gray-900"
																}`}
															>
																{new Date(rental.dueDate).toLocaleDateString("ko-KR")}
															</div>
														</div>
													</div>
													<button
														onClick={(e) => handleReturnRental(rental.rentalId || rental.id, e)}
														className='w-full px-4 py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md'
													>
														반납하기
													</button>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className='text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300'>
							<div className='text-5xl mb-3 opacity-50'>📖</div>
							<p className='text-base font-semibold text-gray-700 mb-1'>
								현재 대여 중인 책이 없습니다
							</p>
							<p className='text-sm text-gray-500'>원하는 책을 대여해보세요</p>
						</div>
					)}
				</div>
			)}

			{/* 대여 이력 탭 */}
			{activeTab === "rented" && (
				<div>
					{rentedBooks.length > 0 ? (
						<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
							{rentedBooks.map((book) => {
								const rentalKey = book.rentalId || book.id || book.bookId;
								const isCurrentlyActive = activeRentalKeys.has(rentalKey);
								const daysLeft =
									isCurrentlyActive && book.returnDate
										? Math.ceil((new Date(book.returnDate) - new Date()) / (1000 * 60 * 60 * 24))
										: null;
								const isOverdue = isCurrentlyActive && typeof daysLeft === "number" && daysLeft < 0;
								const isUrgent =
									isCurrentlyActive &&
									typeof daysLeft === "number" &&
									daysLeft <= 3 &&
									daysLeft >= 0;

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
													isCurrentlyActive
														? isOverdue
															? "bg-red-500 text-white"
															: isUrgent
															? "bg-orange-500 text-white"
															: "bg-primary-light text-white"
														: "bg-gray-200 text-gray-700"
												}`}
											>
												{isCurrentlyActive
													? isOverdue
														? "연체"
														: isUrgent
														? `D-${daysLeft}`
														: "대여중"
													: "반납완료"}
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
															isCurrentlyActive
																? isOverdue
																	? "text-red-500"
																	: isUrgent
																	? "text-orange-500"
																	: "text-primary"
																: "text-gray-400"
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
													<span
														className={
															isCurrentlyActive && isOverdue ? "text-red-600 font-medium" : ""
														}
													>
														{isCurrentlyActive
															? `반납 예정: ${
																	book.returnDate
																		? new Date(book.returnDate).toLocaleDateString("ko-KR")
																		: "-"
															  }`
															: `반납 완료: ${
																	book.returnDate
																		? new Date(book.returnDate).toLocaleDateString("ko-KR")
																		: "-"
															  }`}
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
