import { useNavigate } from "react-router-dom";
import useBehaviorStore from "../lib/store/behaviorStore";

const RecentBooks = ({ layout = "vertical", onBookClick }) => {
	const navigate = useNavigate();
	const { getRecentBooks } = useBehaviorStore();
	const recentBooks = getRecentBooks(3);

	if (!recentBooks?.length) {
		return (
			<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
				<div className={layout === "vertical" ? "w-32" : "w-full"}>
					<h2 className='text-lg font-bold text-primary mb-4'>최근 본 책</h2>
					<div className='text-gray-500 text-sm'>최근 본 책이 없습니다.</div>
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
		<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4'>
			<div className={layout === "vertical" ? "w-32" : "w-full"}>
				<h2 className='text-lg font-bold text-primary mb-4'>최근 본 책</h2>
				<div className={layout === "vertical" ? "space-y-4" : "grid grid-cols-3 gap-4"}>
					{recentBooks.map((book) => (
						<div
							key={book.id}
							onClick={() => handleBookClick(book.id)}
							className='bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1 border border-gray-100 hover:border-primary-light/30'
						>
							<div className='aspect-[3/4] relative overflow-hidden'>
								<img
									src={book.frontCoverImageUrl}
									alt={book.title}
									className='w-full h-full object-cover transition-transform duration-300 hover:scale-105'
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
		</div>
	);
};

export default RecentBooks;
