import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import RecommendedBooks from "../components/RecommendedBooks";

const SearchPage = () => {
	const [searchParams] = useSearchParams();
	const navigate = useNavigate();
	const [books, setBooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const keyword = searchParams.get("keyword");

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				const response = await bookAPI.search(keyword);
				setBooks(response.data);
			} catch (error) {
				console.error("검색 실패:", error);
			} finally {
				setLoading(false);
			}
		};

		if (keyword) {
			fetchBooks();
		}
	}, [keyword]);

	const handleBookClick = (bookId) => {
		navigate(`/book/${bookId}`);
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<h1 className='text-2xl font-bold text-gray-900 mb-6'>"{keyword}" 검색 결과</h1>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
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
			<div className='hidden lg:block fixed right-8 top-24'>
				<RecommendedBooks layout='vertical' />
			</div>
		</div>
	);
};

export default SearchPage;
