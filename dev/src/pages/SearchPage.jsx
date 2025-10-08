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
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-primary mb-2'>
					"{keyword}" <span className='text-gray-600'>검색 결과</span>
				</h1>
				<p className='text-gray-500'>
					총 <span className='text-primary-light font-semibold'>{books.length}</span>개의 도서를
					찾았습니다
				</p>
			</div>

			{books.length === 0 ? (
				<div className='text-center py-16'>
					<div className='w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4'>
						<svg
							className='w-10 h-10 text-gray-400'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
							/>
						</svg>
					</div>
					<p className='text-gray-600 text-lg'>검색 결과가 없습니다</p>
					<p className='text-gray-500 text-sm mt-2'>다른 키워드로 검색해보세요</p>
				</div>
			) : (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
					{books.map((book) => (
						<div
							key={book.id}
							onClick={() => handleBookClick(book.id)}
							className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2 border border-gray-100 hover:border-primary-light/30'
						>
							<div className='aspect-[3/4] relative overflow-hidden rounded-t-xl'>
								<img
									src={book.frontCoverImageUrl}
									alt={book.title}
									className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
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
			)}

			<div className='hidden lg:block fixed right-8 top-24'>
				<RecommendedBooks layout='vertical' />
			</div>
		</div>
	);
};

export default SearchPage;
