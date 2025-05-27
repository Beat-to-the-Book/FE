import { useState, useEffect } from "react";
import { bookAPI } from "../lib/api/book";
import { useNavigate } from "react-router-dom";
import useBehaviorStore from "../lib/store/behaviorStore";
import RecommendedBooks from "../components/RecommendedBooks";

const HomePage = () => {
	const [books, setBooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				const response = await bookAPI.getAll();
				setBooks(response.data);
			} catch (error) {
				setError("책 목록을 불러오는데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		fetchBooks();

		// 페이지 진입 시 행동 로그 전송
		const logBehavior = async () => {
			await useBehaviorStore.getState().logBehavior(null, 0, 0);
		};
		logBehavior();
	}, []);

	const handleBookClick = (bookId) => {
		navigate(`/book/${bookId}`);
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-red-500'>{error}</div>
			</div>
		);
	}

	return (
		<div className='flex gap-8'>
			<div className='flex-1 space-y-8'>
				<h1 className='text-3xl font-bold text-primary'>도서 목록</h1>
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6'>
					{books.map((book) => (
						<div
							key={book.id}
							onClick={() => handleBookClick(book.id)}
							className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer'
						>
							<div className='aspect-[3/4] relative'>
								<img
									src={book.frontCoverImageUrl}
									alt={book.title}
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='p-4'>
								<h2 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
									{book.title}
								</h2>
								<p className='text-sm text-gray-600'>{book.author}</p>
							</div>
						</div>
					))}
				</div>
			</div>
			<div className='hidden lg:block fixed right-8 top-24'>
				<RecommendedBooks layout='vertical' />
			</div>
		</div>
	);
};

export default HomePage;
