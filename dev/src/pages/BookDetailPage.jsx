import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import { purchaseAPI, rentalAPI } from "../lib/api/purchase";
import useAuthStore from "../lib/store/authStore";
import useBehaviorStore from "../lib/store/behaviorStore";
import RecommendedBooks from "../components/RecommendedBooks";
import useCartStore from "../lib/store/cartStore";

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
	const { addItem } = useCartStore();
	const [activeTab, setActiveTab] = useState("reviews"); // 'reviews' or 'reports'
	const [newReview, setNewReview] = useState({ rating: 5, content: "" });
	const [newReport, setNewReport] = useState({ title: "", content: "" });

	useEffect(() => {
		const fetchBook = async () => {
			try {
				const response = await bookAPI.getById(bookId);
				setBook(response.data);
			} catch (_) {
				setError("책 정보를 불러오는데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		fetchBook();
	}, [bookId]);

	useEffect(() => {
		// 행동 로깅 초기화
		initBehavior(bookId);

		// 스크롤 이벤트 핸들러
		const handleScroll = () => {
			const scrollPercent =
				(window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
			updateScrollDepth(Math.round(scrollPercent));
		};

		// 30초마다 행동 로그 전송
		timerRef.current = setInterval(() => {
			logBehavior();
		}, 30000);

		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [bookId, initBehavior, updateScrollDepth, logBehavior]);

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

	const handleReviewSubmit = (e) => {
		e.preventDefault();
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}
		// TODO: API 연동
		alert("리뷰가 등록되었습니다.");
		setNewReview({ rating: 5, content: "" });
	};

	const handleReportSubmit = (e) => {
		e.preventDefault();
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}
		// TODO: API 연동
		alert("독후감이 등록되었습니다.");
		setNewReport({ title: "", content: "" });
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
		<div className='space-y-8'>
			<div className='max-w-4xl mx-auto'>
				<div className='bg-white rounded-lg shadow-lg overflow-hidden'>
					<div className='md:flex'>
						{/* 책 표지 이미지 */}
						<div className='md:w-1/3'>
							<img
								src={book.frontCoverImageUrl}
								alt={book.title}
								className='w-full h-full object-cover'
							/>
						</div>

						{/* 책 정보 */}
						<div className='p-8 md:w-2/3'>
							<h1 className='text-3xl font-bold text-gray-900 mb-4'>{book.title}</h1>
							<p className='text-lg text-gray-600 mb-4'>저자: {book.author}</p>
							<p className='text-gray-600 mb-4'>출판사: {book.publisher}</p>
							<p className='text-gray-600 mb-4'>출판일: {book.publishDate}</p>
							<p className='text-gray-600 mb-4'>장르: {book.genre}</p>
							<p className='text-2xl font-bold text-primary mb-6'>
								{book.price.toLocaleString()}원
							</p>

							{/* 버튼 그룹 */}
							<div className='flex flex-wrap gap-4'>
								<button
									onClick={handleRental}
									className='flex-1 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-6 rounded-lg transition-colors'
								>
									대여하기
								</button>
								<button
									onClick={handlePurchase}
									className='flex-1 bg-primary-light hover:bg-primary text-white font-bold py-3 px-6 rounded-lg transition-colors'
								>
									구매하기
								</button>
								<button
									onClick={handleAddToCart}
									className='flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg transition-colors'
								>
									장바구니
								</button>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* 리뷰 및 독후감 섹션 */}
			<div className='max-w-4xl mx-auto'>
				<div className='bg-white rounded-lg shadow-lg p-6'>
					{/* 탭 메뉴 */}
					<div className='flex border-b mb-6'>
						<button
							className={`px-4 py-2 font-semibold ${
								activeTab === "reviews"
									? "text-primary border-b-2 border-primary"
									: "text-gray-500 hover:text-primary"
							}`}
							onClick={() => setActiveTab("reviews")}
						>
							리뷰
						</button>
						<button
							className={`px-4 py-2 font-semibold ${
								activeTab === "reports"
									? "text-primary border-b-2 border-primary"
									: "text-gray-500 hover:text-primary"
							}`}
							onClick={() => setActiveTab("reports")}
						>
							독후감
						</button>
					</div>

					{/* 리뷰 탭 */}
					{activeTab === "reviews" && (
						<div className='space-y-6'>
							{/* 리뷰 작성 폼 */}
							<form onSubmit={handleReviewSubmit} className='space-y-4'>
								<div className='flex items-center space-x-2'>
									<label className='font-semibold'>평점:</label>
									<select
										value={newReview.rating}
										onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
										className='border rounded px-2 py-1'
									>
										{[5, 4, 3, 2, 1].map((rating) => (
											<option key={rating} value={rating}>
												{rating}점
											</option>
										))}
									</select>
								</div>
								<textarea
									value={newReview.content}
									onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
									placeholder='리뷰를 작성해주세요...'
									className='w-full h-24 p-2 border rounded'
									required
								/>
								<button
									type='submit'
									className='bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
								>
									리뷰 작성
								</button>
							</form>

							{/* 리뷰 목록 */}
							<div className='space-y-4'>
								{TEMP_REVIEWS.map((review) => (
									<div key={review.id} className='border-b pb-4'>
										<div className='flex justify-between items-center mb-2'>
											<div className='font-semibold'>{review.userId}</div>
											<div className='text-yellow-500'>
												{"★".repeat(review.rating)}
												{"☆".repeat(5 - review.rating)}
											</div>
										</div>
										<p className='text-gray-700'>{review.content}</p>
										<div className='text-sm text-gray-500 mt-2'>{review.createdAt}</div>
									</div>
								))}
							</div>
						</div>
					)}

					{/* 독후감 탭 */}
					{activeTab === "reports" && (
						<div className='space-y-6'>
							{/* 독후감 작성 폼 */}
							<form onSubmit={handleReportSubmit} className='space-y-4'>
								<input
									type='text'
									value={newReport.title}
									onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
									placeholder='독후감 제목'
									className='w-full p-2 border rounded'
									required
								/>
								<textarea
									value={newReport.content}
									onChange={(e) => setNewReport({ ...newReport, content: e.target.value })}
									placeholder='독후감을 작성해주세요...'
									className='w-full h-32 p-2 border rounded'
									required
								/>
								<button
									type='submit'
									className='bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
								>
									독후감 작성
								</button>
							</form>

							{/* 독후감 목록 */}
							<div className='space-y-4'>
								{TEMP_BOOK_REPORTS.map((report) => (
									<div key={report.id} className='border-b pb-4'>
										<h3 className='font-semibold text-lg mb-2'>{report.title}</h3>
										<p className='text-gray-700'>{report.content}</p>
										<div className='flex justify-between items-center mt-2'>
											<div className='text-sm text-gray-500'>{report.userId}</div>
											<div className='text-sm text-gray-500'>{report.createdAt}</div>
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</div>
			</div>

			{/* 추천 도서 섹션 */}
			<div className='max-w-4xl mx-auto'>
				<div className='w-180'>
					<RecommendedBooks layout='horizontal' />
				</div>
			</div>
		</div>
	);
};

export default BookDetailPage;
