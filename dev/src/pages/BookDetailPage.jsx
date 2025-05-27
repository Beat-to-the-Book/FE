import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import { purchaseAPI, rentalAPI } from "../lib/api/purchase";
import useAuthStore from "../lib/store/authStore";
import useBehaviorStore from "../lib/store/behaviorStore";
import RecommendedBooks from "../components/RecommendedBooks";
import useCartStore from "../lib/store/cartStore";

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

			<div className='max-w-4xl mx-auto'>
				<div className='w-180'>
					<RecommendedBooks layout='horizontal' />
				</div>
			</div>
		</div>
	);
};

export default BookDetailPage;
