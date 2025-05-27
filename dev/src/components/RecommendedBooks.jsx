import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useBehaviorStore from "../lib/store/behaviorStore";

const RecommendedBooks = ({ layout = "vertical" }) => {
	const navigate = useNavigate();
	const { recommendedBooks, loading, error, fetchRecommendations } = useBehaviorStore();

	useEffect(() => {
		fetchRecommendations();
	}, []);

	if (loading) {
		return <div className='animate-pulse'>로딩중...</div>;
	}

	if (error) {
		return <div className='text-red-500'>{error}</div>;
	}

	const handleBookClick = (bookId) => {
		navigate(`/book/${bookId}`);
	};

	return (
		<div className={layout === "vertical" ? "w-64" : "w-full"}>
			<h2 className='text-xl font-bold text-primary mb-4'>추천 도서</h2>
			<div className={layout === "vertical" ? "space-y-4" : "grid grid-cols-3 gap-4"}>
				{recommendedBooks.slice(0, layout === "vertical" ? 3 : 5).map((book) => (
					<div
						key={book.bookId}
						onClick={() => handleBookClick(book.bookId)}
						className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer'
					>
						<div className='aspect-[3/4] relative'>
							<img
								src={book.coverImageUrl}
								alt={book.title}
								className='w-full h-full object-cover'
							/>
						</div>
						<div className='p-3'>
							<h3 className='text-sm font-semibold text-gray-900 mb-1 line-clamp-2'>
								{book.title}
							</h3>
							<p className='text-xs text-gray-600'>{book.author}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default RecommendedBooks;
