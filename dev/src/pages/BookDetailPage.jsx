import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import { purchaseAPI, rentalAPI } from "../lib/api/purchase";
import { reportAPI } from "../lib/api/report";
import { reviewAPI } from "../lib/api/review";
import useAuthStore from "../lib/store/authStore";
import useBehaviorStore from "../lib/store/behaviorStore";
import RecommendedBooks from "../components/RecommendedBooks";
import useCartStore from "../lib/store/cartStore";
import EditReportModal from "../components/EditReportModal";
import EditReviewModal from "../components/EditReviewModal";

// 임시 데이터
const TEMP_REVIEWS = [
	{
		id: 1,
		userId: "user1",
		rating: 5,
		content: "정말 좋은 책이었습니다. 추천합니다!",
		createdAt: "2024-03-15",
	},
	{
		id: 2,
		userId: "user2",
		rating: 4,
		content: "기대했던 것보다 좋았어요.",
		createdAt: "2024-03-14",
	},
];

const TEMP_BOOK_REPORTS = [
	{
		id: 1,
		userId: "user1",
		title: "인생을 바꾼 한 권의 책",
		content: "이 책을 통해 많은 것을 배웠습니다...",
		createdAt: "2024-03-15",
	},
	{
		id: 2,
		userId: "user2",
		title: "나의 독서 여정",
		content: "이 책은 제 인생의 전환점이 되었습니다...",
		createdAt: "2024-03-14",
	},
];

const BookDetailPage = () => {
	const { bookId } = useParams();
	const navigate = useNavigate();
	const [book, setBook] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const { isAuthenticated, userId } = useAuthStore();
	const { initBehavior, updateScrollDepth, logBehavior } = useBehaviorStore();
	const timerRef = useRef(null);
	const scrollTimerRef = useRef(null);
	const { addItem } = useCartStore();
	const [activeTab, setActiveTab] = useState("reviews"); // 'reviews' or 'reports'
	const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
	const [newReport, setNewReport] = useState({
		content: "",
		rating: 5,
		publicVisible: true,
	});
	const [reports, setReports] = useState([]);
	const [myReports, setMyReports] = useState([]);
	const [reportsLoading, setReportsLoading] = useState(false);
	const [reportsError, setReportsError] = useState("");
	const [selectedReport, setSelectedReport] = useState(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [reviews, setReviews] = useState([]);
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [reviewsError, setReviewsError] = useState("");
	const [selectedReview, setSelectedReview] = useState(null);
	const [isReviewEditModalOpen, setIsReviewEditModalOpen] = useState(false);

	useEffect(() => {
		const fetchBook = async () => {
			try {
				const response = await bookAPI.getById(bookId);
				setBook(response.data);
			} catch (error) {
				console.error("책 정보 조회 에러:", error);
				if (error.response?.status === 404) {
					setError("존재하지 않는 책입니다.");
				} else {
					setError("책 정보를 불러오는데 실패했습니다.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchBook();
	}, [bookId]);

	useEffect(() => {
		const fetchReports = async () => {
			try {
				setReportsLoading(true);
				// 공개 독후감 조회
				const response = await reportAPI.getBookReports(bookId);
				setReports(response.data);

				// 로그인한 사용자의 경우 본인 독후감 목록 조회
				if (isAuthenticated) {
					try {
						const myReportsResponse = await reportAPI.getMyReports();
						setMyReports(myReportsResponse.data);
					} catch (error) {
						console.error("본인 독후감 조회 에러:", error);
					}
				}

				setReportsError("");
			} catch (error) {
				console.error("독후감 조회 에러:", error);
				if (error.response?.status === 404) {
					setReportsError("존재하지 않는 책입니다.");
				} else if (error.response?.status === 401) {
					setReportsError("로그인이 필요합니다.");
				} else {
					setReportsError("독후감을 불러오는데 실패했습니다.");
				}
			} finally {
				setReportsLoading(false);
			}
		};

		if (activeTab === "reports") {
			fetchReports();
		}
	}, [bookId, activeTab, isAuthenticated]);

	useEffect(() => {
		// 행동 로깅 초기화
		initBehavior(bookId);

		// 스크롤 이벤트 핸들러
		const handleScroll = () => {
			// 스크롤 이벤트 디바운싱
			if (scrollTimerRef.current) {
				clearTimeout(scrollTimerRef.current);
			}

			scrollTimerRef.current = setTimeout(() => {
				const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
				const scrollPercent = (window.scrollY / scrollHeight) * 100;
				updateScrollDepth(Math.min(Math.round(scrollPercent), 100));
			}, 100);
		};

		// 1초마다 stayTime 업데이트
		timerRef.current = setInterval(() => {
			logBehavior();
		}, 1000);

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
			if (scrollTimerRef.current) {
				clearTimeout(scrollTimerRef.current);
			}
		};
	}, [bookId, initBehavior, updateScrollDepth, logBehavior]);

	useEffect(() => {
		const fetchReviews = async () => {
			try {
				setReviewsLoading(true);
				const response = await reviewAPI.getBookReviews(bookId);
				setReviews(response.data.reviews);
				setReviewsError("");
			} catch (error) {
				console.error("리뷰 조회 에러:", error);
				if (error.response?.status === 404) {
					setReviewsError("존재하지 않는 책입니다.");
				} else {
					setReviewsError("리뷰를 불러오는데 실패했습니다.");
				}
			} finally {
				setReviewsLoading(false);
			}
		};

		if (activeTab === "reviews") {
			fetchReviews();
		}
	}, [bookId, activeTab]);

	const handleRental = async () => {
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		try {
			await rentalAPI.add({
				userId,
				bookId: parseInt(bookId),
			});
			alert("대여가 완료되었습니다.");
		} catch (_) {
			alert("대여에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handlePurchase = async () => {
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		try {
			await purchaseAPI.add({
				userId,
				bookId: parseInt(bookId),
			});
			alert("구매가 완료되었습니다.");
		} catch (_) {
			alert("구매에 실패했습니다. 다시 시도해주세요.");
		}
	};

	const handleAddToCart = async () => {
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		addItem(book);
		alert("장바구니에 추가되었습니다.");
	};

	const handleReviewSubmit = async (e) => {
		e.preventDefault();
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		try {
			await reviewAPI.create({
				bookId: parseInt(bookId),
				rating: newReview.rating,
				comment: newReview.comment,
			});
			alert("리뷰가 등록되었습니다.");
			setNewReview({ rating: 5, comment: "" });
			// 리뷰 목록 새로고침
			const response = await reviewAPI.getBookReviews(bookId);
			setReviews(response.data.reviews);
		} catch (error) {
			console.error("리뷰 등록 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
				navigate("/login");
			} else {
				alert("리뷰 등록에 실패했습니다.");
			}
		}
	};

	const handleReportSubmit = async (e) => {
		e.preventDefault();
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		try {
			await reportAPI.create({
				bookId: parseInt(bookId),
				content: newReport.content,
				rating: newReport.rating,
				publicVisible: newReport.publicVisible,
			});
			alert("독후감이 등록되었습니다.");
			setNewReport({ content: "", rating: 5, publicVisible: true });
			// 독후감 목록 새로고침
			const response = await reportAPI.getBookReports(bookId);
			setReports(response.data);
		} catch (error) {
			console.error("독후감 등록 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
				navigate("/login");
			} else {
				alert("독후감 등록에 실패했습니다.");
			}
		}
	};

	const handleDeleteReport = async (reportId) => {
		if (!window.confirm("정말로 이 독후감을 삭제하시겠습니까?")) {
			return;
		}

		try {
			await reportAPI.deleteMyReport(reportId);
			alert("독후감이 삭제되었습니다.");
			// 독후감 목록 새로고침
			const response = await reportAPI.getBookReports(book.id);
			setReports(response.data);
		} catch (error) {
			console.error("독후감 삭제 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 필요합니다.");
				navigate("/login");
			} else if (error.response?.status === 403) {
				alert("삭제 권한이 없습니다.");
			} else {
				alert("독후감 삭제에 실패했습니다.");
			}
		}
	};

	const handleDeleteReview = async (reviewId) => {
		if (!window.confirm("정말로 이 리뷰를 삭제하시겠습니까?")) {
			return;
		}

		try {
			await reviewAPI.delete(reviewId);
			alert("리뷰가 삭제되었습니다.");
			// 리뷰 목록 새로고침
			const response = await reviewAPI.getBookReviews(bookId);
			setReviews(response.data.reviews);
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

	const handleReviewEditSuccess = async () => {
		try {
			// 리뷰 목록 새로고침
			const response = await reviewAPI.getBookReviews(bookId);
			setReviews(response.data.reviews);
		} catch (error) {
			console.error("리뷰 목록 새로고침 에러:", error);
		}
	};

	const handleBookClick = (bookId) => {
		navigate(`/book/${bookId}`);
	};

	const handleEditSuccess = async () => {
		try {
			// 독후감 목록 새로고침
			const response = await reportAPI.getBookReports(bookId);
			setReports(response.data);
		} catch (error) {
			console.error("독후감 목록 새로고침 에러:", error);
		}
	};

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

	if (!book) return null;

	return (
		<div className='space-y-8 pb-12'>
			<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100'>
					<div className='md:flex'>
						{/* 책 표지 이미지 */}
						<div className='md:w-2/5 bg-gray-50'>
							<div className='p-8 flex items-center justify-center'>
								<img
									src={book.frontCoverImageUrl}
									alt={book.title}
									className='w-full max-w-sm rounded-lg shadow-xl'
								/>
							</div>
						</div>

						{/* 책 정보 */}
						<div className='p-8 md:w-3/5 flex flex-col'>
							<div className='flex-1'>
								<div className='inline-block px-3 py-1 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-3'>
									{book.genre}
								</div>
								<h1 className='text-4xl font-bold text-gray-900 mb-4'>{book.title}</h1>
								<div className='space-y-3 text-gray-600 mb-6'>
									<div className='flex items-center'>
										<svg
											className='w-5 h-5 mr-2 text-primary-light'
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path d='M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z' />
										</svg>
										<span className='font-medium'>저자:</span>
										<span className='ml-2'>{book.author}</span>
									</div>
									<div className='flex items-center'>
										<svg
											className='w-5 h-5 mr-2 text-primary-light'
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path d='M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z' />
										</svg>
										<span className='font-medium'>출판사:</span>
										<span className='ml-2'>{book.publisher}</span>
									</div>
									<div className='flex items-center'>
										<svg
											className='w-5 h-5 mr-2 text-primary-light'
											fill='currentColor'
											viewBox='0 0 20 20'
										>
											<path
												fillRule='evenodd'
												d='M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z'
												clipRule='evenodd'
											/>
										</svg>
										<span className='font-medium'>출판일:</span>
										<span className='ml-2'>{book.publishDate}</span>
									</div>
								</div>
								<div className='bg-primary/5 border-l-4 border-primary p-4 rounded-r-lg mb-6'>
									<div className='text-sm text-gray-600 mb-1'>판매가</div>
									<div className='text-3xl font-bold text-primary'>
										{book.price.toLocaleString()}원
									</div>
								</div>
							</div>

							{/* 버튼 그룹 */}
							<div className='flex flex-col sm:flex-row gap-3'>
								<button
									onClick={handleRental}
									className='flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
								>
									대여하기
								</button>
								<button
									onClick={handlePurchase}
									className='flex-1 bg-primary-light hover:bg-secondary-light text-primary-dark font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
								>
									구매하기
								</button>
								<button
									onClick={handleAddToCart}
									className='flex-1 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-4 px-6 rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-primary-light'
								>
									장바구니
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 리뷰 및 독후감 섹션 */}
			<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100'>
					{/* 탭 메뉴 */}
					<div className='flex border-b-2 border-gray-100 mb-8'>
						<button
							className={`px-6 py-3 font-semibold transition-all ${
								activeTab === "reviews"
									? "text-primary border-b-2 border-primary -mb-0.5"
									: "text-gray-500 hover:text-primary"
							}`}
							onClick={() => setActiveTab("reviews")}
						>
							리뷰
						</button>
						<button
							className={`px-6 py-3 font-semibold transition-all ${
								activeTab === "reports"
									? "text-primary border-b-2 border-primary -mb-0.5"
									: "text-gray-500 hover:text-primary"
							}`}
							onClick={() => setActiveTab("reports")}
						>
							독후감
						</button>
					</div>

					{/* 리뷰 탭 */}
					{activeTab === "reviews" && (
						<div className='space-y-8'>
							{/* 리뷰 작성 폼 */}
							<div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
								<h3 className='text-lg font-semibold text-gray-900 mb-4'>리뷰 작성하기</h3>
								<form onSubmit={handleReviewSubmit} className='space-y-4'>
									<div className='flex items-center space-x-3'>
										<label className='font-semibold text-gray-700'>평점:</label>
										<select
											value={newReview.rating}
											onChange={(e) =>
												setNewReview({ ...newReview, rating: Number(e.target.value) })
											}
											className='border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
										>
											{[5, 4, 3, 2, 1].map((rating) => (
												<option key={rating} value={rating}>
													{"★".repeat(rating)} {rating}점
												</option>
											))}
										</select>
									</div>
									<textarea
										value={newReview.comment}
										onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
										placeholder='리뷰를 작성해주세요...'
										className='w-full h-32 p-4 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none'
										required
									/>
									<button
										type='submit'
										className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
									>
										리뷰 등록
									</button>
								</form>
							</div>

							{/* 리뷰 목록 */}
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-4'>모든 리뷰</h3>
								{reviewsLoading ? (
									<div className='flex justify-center py-8'>
										<div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary'></div>
									</div>
								) : reviewsError ? (
									<div className='bg-red-50 border border-red-200 text-red-600 text-center py-4 rounded-lg'>
										{reviewsError}
									</div>
								) : reviews.length === 0 ? (
									<div className='text-center py-8 text-gray-500'>아직 작성된 리뷰가 없습니다</div>
								) : (
									<div className='space-y-4'>
										{reviews.map((review) => (
											<div
												key={review.reviewId}
												className='bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-light/30 transition-all'
											>
												<div className='flex justify-between items-start mb-3'>
													<div className='flex items-center space-x-3'>
														<div className='w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center'>
															<span className='text-primary font-semibold'>{review.author[0]}</span>
														</div>
														<div>
															<div className='font-semibold text-gray-900'>{review.author}</div>
															<div className='text-sm text-gray-500'>{review.createdAt}</div>
														</div>
													</div>
													<div className='flex items-center space-x-3'>
														<div className='text-yellow-500 text-lg'>
															{"★".repeat(review.rating)}
															{"☆".repeat(5 - review.rating)}
														</div>
														{isAuthenticated && review.author === userId && (
															<div className='flex space-x-2'>
																<button
																	onClick={() => {
																		setSelectedReview(review);
																		setIsReviewEditModalOpen(true);
																	}}
																	className='text-primary hover:text-primary-light font-medium text-sm'
																>
																	수정
																</button>
																<button
																	onClick={() => handleDeleteReview(review.reviewId)}
																	className='text-red-500 hover:text-red-600 font-medium text-sm'
																>
																	삭제
																</button>
															</div>
														)}
													</div>
												</div>
												<p className='text-gray-700 leading-relaxed'>{review.comment}</p>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					)}

					{/* 독후감 탭 */}
					{activeTab === "reports" && (
						<div className='space-y-8'>
							{/* 독후감 작성 폼 */}
							<div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
								<h3 className='text-lg font-semibold text-gray-900 mb-4'>독후감 작성하기</h3>
								<form onSubmit={handleReportSubmit} className='space-y-4'>
									<div className='flex items-center space-x-3'>
										<label className='font-semibold text-gray-700'>평점:</label>
										<select
											value={newReport.rating}
											onChange={(e) =>
												setNewReport({ ...newReport, rating: Number(e.target.value) })
											}
											className='border-2 border-gray-200 rounded-lg px-4 py-2 focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
										>
											{[5, 4, 3, 2, 1].map((rating) => (
												<option key={rating} value={rating}>
													{"★".repeat(rating)} {rating}점
												</option>
											))}
										</select>
									</div>
									<textarea
										value={newReport.content}
										onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
										placeholder='독후감을 작성해주세요...'
										className='w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none'
										required
									/>
									<div className='flex items-center space-x-2'>
										<input
											type='checkbox'
											id='publicVisible'
											checked={newReport.publicVisible}
											onChange={(e) =>
												setNewReport({ ...newReport, publicVisible: e.target.checked })
											}
											className='w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary-light'
										/>
										<label htmlFor='publicVisible' className='text-sm text-gray-700 font-medium'>
											공개로 설정
										</label>
									</div>
									<button
										type='submit'
										className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark font-semibold transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
									>
										독후감 등록
									</button>
								</form>
							</div>

							{/* 독후감 목록 */}
							<div>
								<h3 className='text-lg font-semibold text-gray-900 mb-4'>모든 독후감</h3>
								{reportsLoading ? (
									<div className='flex justify-center py-8'>
										<div className='animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary'></div>
									</div>
								) : reportsError ? (
									<div className='bg-red-50 border border-red-200 text-red-600 text-center py-4 rounded-lg'>
										{reportsError}
									</div>
								) : reports.length === 0 ? (
									<div className='text-center py-8 text-gray-500'>
										아직 작성된 독후감이 없습니다
									</div>
								) : (
									<div className='space-y-4'>
										{reports.map((report) => {
											const isMyReport = myReports.some((myReport) => myReport.id === report.id);
											return (
												<div
													key={report.id}
													className='bg-white border border-gray-200 rounded-xl p-6 hover:border-primary-light/30 transition-all'
												>
													<div className='flex justify-between items-start mb-4'>
														<div className='flex items-center space-x-3 flex-1'>
															<div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
																<span className='text-primary font-semibold text-lg'>
																	{report.authorName[0]}
																</span>
															</div>
															<div className='flex-1'>
																<div className='flex items-center space-x-2 mb-1'>
																	<span className='font-semibold text-gray-900'>
																		{report.authorName}
																	</span>
																	<span className='text-gray-400'>•</span>
																	<span className='text-sm text-gray-500'>
																		{new Date(report.createdAt).toLocaleDateString()}
																	</span>
																	{!report.publicVisible && (
																		<span className='bg-gray-100 px-2 py-1 rounded-full text-xs font-medium text-gray-600'>
																			비공개
																		</span>
																	)}
																</div>
																<div className='text-yellow-500'>
																	{"★".repeat(report.rating)}
																	{"☆".repeat(5 - report.rating)}
																</div>
															</div>
														</div>
														{isAuthenticated && isMyReport && (
															<div className='flex space-x-2'>
																<button
																	onClick={() => {
																		setSelectedReport(report);
																		setIsEditModalOpen(true);
																	}}
																	className='text-primary hover:text-primary-light font-medium text-sm'
																>
																	수정
																</button>
																<button
																	onClick={() => handleDeleteReport(report.id)}
																	className='text-red-500 hover:text-red-600 font-medium text-sm'
																>
																	삭제
																</button>
															</div>
														)}
													</div>
													<p className='text-gray-700 whitespace-pre-wrap leading-relaxed'>
														{report.content}
													</p>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* 추천 도서 섹션 */}
			<div className='max-w-6xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='bg-gray-50 rounded-2xl p-6 border border-gray-100'>
					<h2 className='text-2xl font-bold text-primary mb-6'>추천 도서</h2>
					<RecommendedBooks layout='horizontal' />
				</div>
			</div>

			{/* 리뷰 수정 모달 */}
			<EditReviewModal
				isOpen={isReviewEditModalOpen}
				onClose={() => {
					setIsReviewEditModalOpen(false);
					setSelectedReview(null);
				}}
				review={selectedReview}
				onSuccess={handleReviewEditSuccess}
			/>
			{/* 독후감 수정 모달 */}
			<EditReportModal
				isOpen={isEditModalOpen}
				onClose={() => {
					setIsEditModalOpen(false);
					setSelectedReport(null);
				}}
				report={selectedReport}
				onSuccess={handleEditSuccess}
			/>
		</div>
	);
};

export default BookDetailPage;
