import { useNavigate } from "react-router-dom";

const SearchResults = ({ results, onClose }) => {
	const navigate = useNavigate();

	const handleBookClick = (bookId) => {
		navigate(`/book/${bookId}`);
		onClose();
	};

	if (!results.length) return null;

	return (
		<div className='absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50'>
			<div className='p-2'>
				{results.slice(0, 3).map((book) => (
					<div
						key={book.id}
						onClick={() => handleBookClick(book.id)}
						className='flex items-center p-2 hover:bg-gray-100 rounded-lg cursor-pointer'
					>
						<img
							src={book.frontCoverImageUrl}
							alt={book.title}
							className='w-12 h-16 object-cover rounded'
						/>
						<div className='ml-3'>
							<h3 className='text-sm font-medium text-gray-900'>{book.title}</h3>
							<p className='text-xs text-gray-600'>{book.author}</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default SearchResults;
