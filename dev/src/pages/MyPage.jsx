import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import { purchaseAPI } from "../lib/api/purchase";
import { rentalAPI } from "../lib/api/rental";
import { reportAPI } from "../lib/api/report";
import useAuthStore from "../lib/store/authStore";

// 임시 데이터 (API 연동 전까지 사용)
const TEMP_BOOK_REPORTS = [
	{
		id: 1,
		bookId: 1,
		bookTitle: "인생을 바꾼 한 권의 책",
		title: "나의 독서 여정",
		content: "이 책을 통해 많은 것을 배웠습니다...",
		createdAt: "2024-03-15",
	},
	{
		id: 2,
		bookId: 2,
		bookTitle: "미움받을 용기",
		title: "자기 수용의 여정",
		content: "이 책은 제 인생의 전환점이 되었습니다...",
		createdAt: "2024-03-14",
	},
];

const TEMP_REVIEWS = [
	{
		id: 1,
		bookId: 1,
		bookTitle: "인생을 바꾼 한 권의 책",
		rating: 5,
		content: "정말 좋은 책이었습니다. 추천합니다!",
		createdAt: "2024-03-15",
	},
	{
		id: 2,
		bookId: 2,
		bookTitle: "미움받을 용기",
		rating: 4,
		content: "기대했던 것보다 좋았어요.",
		createdAt: "2024-03-14",
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
	const { isAuthenticated } = useAuthStore();
	const [activeTab, setActiveTab] = useState("reports");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [purchasedBooks, setPurchasedBooks] = useState([]);
	const [rentedBooks, setRentedBooks] = useState([]);
	const [myReports, setMyReports] = useState([]);

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
			<h1 className='text-3xl font-bold text-gray-900 mb-8'>마이페이지</h1>

			{/* 탭 메뉴 */}
			<div className='flex border-b mb-8'>
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === "reports"
							? "text-primary border-b-2 border-primary"
							: "text-gray-500 hover:text-primary"
					}`}
					onClick={() => setActiveTab("reports")}
				>
					내 독후감
				</button>
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === "reviews"
							? "text-primary border-b-2 border-primary"
							: "text-gray-500 hover:text-primary"
					}`}
					onClick={() => setActiveTab("reviews")}
				>
					내 리뷰
				</button>
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === "purchased"
							? "text-primary border-b-2 border-primary"
							: "text-gray-500 hover:text-primary"
					}`}
					onClick={() => setActiveTab("purchased")}
				>
					구매한 책
				</button>
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === "rented"
							? "text-primary border-b-2 border-primary"
							: "text-gray-500 hover:text-primary"
					}`}
					onClick={() => setActiveTab("rented")}
				>
					대여한 책
				</button>
			</div>

			{/* 독후감 탭 */}
			{activeTab === "reports" && (
				<div className='space-y-4'>
					{myReports.map((report) => (
						<div
							key={report.id}
							className='bg-white rounded-lg shadow p-4 cursor-pointer hover:shadow-md transition-shadow'
							onClick={() => navigate(`/reports/${report.id}`)}
						>
							<div className='flex justify-between items-start'>
								<div>
									<h3 className='font-semibold text-gray-900'>{report.bookTitle}</h3>
									<div className='flex items-center space-x-4 text-sm text-gray-500 mt-1'>
										<span>작성일: {new Date(report.createdAt).toLocaleDateString()}</span>
										{!report.publicVisible && (
											<span className='bg-gray-100 px-2 py-1 rounded'>비공개</span>
										)}
									</div>
								</div>
								<div className='text-yellow-500'>
									{"★".repeat(report.rating)}
									{"☆".repeat(5 - report.rating)}
								</div>
							</div>
							<p className='text-gray-600 mt-2 line-clamp-2'>{report.content}</p>
						</div>
					))}
					{myReports.length === 0 && (
						<div className='text-center text-gray-500 py-4'>작성한 독후감이 없습니다.</div>
					)}
				</div>
			)}

			{/* 리뷰 탭 */}
			{activeTab === "reviews" && (
				<div className='space-y-6'>
					{TEMP_REVIEWS.map((review) => (
						<div
							key={review.id}
							className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
							onClick={() => navigate(`/book/${review.bookId}`)}
						>
							<div className='flex justify-between items-start mb-4'>
								<div>
									<h3 className='text-xl font-semibold text-gray-900 mb-2'>{review.bookTitle}</h3>
									<div className='flex items-center space-x-2'>
										<div className='text-yellow-500'>
											{"★".repeat(review.rating)}
											{"☆".repeat(5 - review.rating)}
										</div>
										<span className='text-sm text-gray-500'>{review.rating}점</span>
									</div>
								</div>
								<span className='text-sm text-gray-500'>{review.createdAt}</span>
							</div>
							<p className='text-gray-700 line-clamp-2'>{review.content}</p>
						</div>
					))}
				</div>
			)}

			{/* 구매한 책 탭 */}
			{activeTab === "purchased" && (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{purchasedBooks.map((book) => (
						<div
							key={book.id}
							className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
							onClick={() => navigate(`/book/${book.id}`)}
						>
							<img
								src={book.frontCoverImageUrl}
								alt={book.title}
								className='w-full h-48 object-cover'
							/>
							<div className='p-4'>
								<h3 className='font-semibold text-gray-900 mb-2 line-clamp-2'>{book.title}</h3>
								<p className='text-sm text-gray-600 mb-2'>{book.author}</p>
								<p className='text-sm text-gray-500'>
									구매일: {new Date(book.purchaseDate).toLocaleDateString()}
								</p>
							</div>
						</div>
					))}
				</div>
			)}

			{/* 대여한 책 탭 */}
			{activeTab === "rented" && (
				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
					{rentedBooks.map((book) => (
						<div
							key={book.id}
							className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer'
							onClick={() => navigate(`/book/${book.id}`)}
						>
							<img
								src={book.frontCoverImageUrl}
								alt={book.title}
								className='w-full h-48 object-cover'
							/>
							<div className='p-4'>
								<h3 className='font-semibold text-gray-900 mb-2 line-clamp-2'>{book.title}</h3>
								<p className='text-sm text-gray-600 mb-2'>{book.author}</p>
								<div className='text-sm text-gray-500 space-y-1'>
									<p>대여일: {new Date(book.rentalDate).toLocaleDateString()}</p>
									<p>반납예정일: {new Date(book.returnDate).toLocaleDateString()}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
};

export default MyPage;
