import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBehaviorStore from "../lib/store/behaviorStore";

const RecommendedBooks = ({ layout = "vertical", onBookClick }) => {
	const navigate = useNavigate();
	const { recommendedBooks = [], loading, error, fetchRecommendations } = useBehaviorStore();

	useEffect(() => {
		fetchRecommendations();
	}, [fetchRecommendations]);

	if (loading) {
		return (
			<div className='bg-white rounded-lg shadow-md p-4'>
				<div className={layout === "vertical" ? "w-32" : "w-full"}>
					<h2 className='text-lg font-bold text-primary mb-3'>추천 도서</h2>
					<div className='animate-pulse space-y-3'>
						{[...Array(3)].map((_, i) => (
							<div key={i} className='bg-gray-200 rounded-lg h-48'></div>
						))}
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='bg-white rounded-lg shadow-md p-4'>
				<div className={layout === "vertical" ? "w-32" : "w-full"}>
					<h2 className='text-lg font-bold text-primary mb-3'>추천 도서</h2>
					<div className='text-red-500 text-sm'>{error}</div>
				</div>
			</div>
		);
	}

	if (!recommendedBooks?.length) {
		return (
			<div className='bg-white rounded-lg shadow-md p-4'>
				<div className={layout === "vertical" ? "w-32" : "w-full"}>
					<h2 className='text-lg font-bold text-primary mb-3'>추천 도서</h2>
					<div className='text-gray-500 text-sm'>추천 도서가 없습니다.</div>
				</div>
			</div>
		);
	}

	const handleBookClick = (bookId) => {
		if (onBookClick) {
			onBookClick(bookId);
		} else {
			navigate(`/book/${bookId}`);
		}
	};

	return (
		<div className='bg-white rounded-lg shadow-md p-4'>
			<div className={layout === "vertical" ? "w-32" : "w-full"}>
				<h2 className='text-lg font-bold text-primary mb-3'>추천 도서</h2>
				<div className={layout === "vertical" ? "space-y-3" : "grid grid-cols-3 gap-2"}>
					{recommendedBooks.slice(0, layout === "vertical" ? 3 : 5).map((book) => (
						<div
							key={book.bookId}
							onClick={() => handleBookClick(book.bookId)}
							className='bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 cursor-pointer'
						>
							<div className='aspect-[3/4] relative'>
								<img
									src={book.coverImageUrl}
									alt={book.title}
									className='w-full h-full object-cover'
								/>
							</div>
							<div className='p-2'>
								<h3 className='text-sm font-semibold text-gray-900 mb-1 line-clamp-2'>
									{book.title}
								</h3>
								<p className='text-xs text-gray-600'>{book.author}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default RecommendedBooks;
