import { useNavigate } from "react-router-dom";

const SearchResults = ({ results, onClose }) => {
	const navigate = useNavigate();

	const handleBookClick = (bookId) => {
		navigate(`/book/${bookId}`);
		onClose();
	};

	if (!results.length) return null;

	return (
		<div className='absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden'>
			<div className='p-2'>
				{results.slice(0, 5).map((book) => (
					<div
						key={book.id}
						onClick={() => handleBookClick(book.id)}
						className='flex items-center p-3 hover:bg-primary/5 rounded-lg cursor-pointer transition-all group'
					>
						<img
							src={book.frontCoverImageUrl}
							alt={book.title}
							className='w-12 h-16 object-cover rounded-md shadow-sm'
						/>
						<div className='ml-3 flex-1'>
							<h3 className='text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors line-clamp-1'>
								{book.title}
							</h3>
							<p className='text-xs text-gray-600 mt-0.5'>{book.author}</p>
						</div>
						<svg
							className='w-5 h-5 text-gray-400 group-hover:text-primary transition-colors'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M9 5l7 7-7 7' />
						</svg>
					</div>
				))}
				{results.length > 5 && (
					<div className='px-3 py-2 text-xs text-gray-500 text-center border-t border-gray-100'>
						+{results.length - 5}개 더 있습니다
					</div>
				)}
			</div>
		</div>
	);
};

export default SearchResults;
