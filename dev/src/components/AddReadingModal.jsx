import { useState, useEffect } from "react";

const AddReadingModal = ({
	isOpen,
	onClose,
	onSubmit,
	selectedDate,
	books = [],
	editData = null,
}) => {
	const [formData, setFormData] = useState({
		bookId: "",
		startDate: "",
		endDate: "",
		memo: "",
	});

	const [selectedBook, setSelectedBook] = useState(null);

	useEffect(() => {
		if (editData) {
			// 수정 모드
			setFormData({
				bookId: editData.bookId,
				startDate: editData.startDate,
				endDate: editData.endDate,
				memo: editData.memo || "",
			});
			const book = books.find((b) => b.id === editData.bookId);
			setSelectedBook(book);
		} else if (selectedDate) {
			// 추가 모드
			const dateStr = new Date(selectedDate).toISOString().split("T")[0];
			setFormData({
				bookId: "",
				startDate: dateStr,
				endDate: dateStr,
				memo: "",
			});
			setSelectedBook(null);
		}
	}, [editData, selectedDate, books]);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === "bookId") {
			const book = books.find((b) => b.id === parseInt(value));
			setSelectedBook(book);
		}
	};

	const handleSubmit = (e) => {
		e.preventDefault();

		if (!formData.bookId) {
			alert("책을 선택해주세요.");
			return;
		}

		if (!formData.startDate || !formData.endDate) {
			alert("시작일과 종료일을 입력해주세요.");
			return;
		}

		if (new Date(formData.startDate) > new Date(formData.endDate)) {
			alert("종료일은 시작일보다 이후여야 합니다.");
			return;
		}

		onSubmit(formData);
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn'>
			<div className='bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl transform animate-slideUp border border-gray-100'>
				<div className='flex items-center gap-3 mb-6 pb-4 border-b border-gray-100'>
					<div className='w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white text-xl'>
						📚
					</div>
					<h2 className='text-xl font-bold text-primary'>
						{editData ? "독서 기록 수정" : "독서 기록 추가"}
					</h2>
				</div>

				<form onSubmit={handleSubmit} className='space-y-4'>
					{/* 책 선택 */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5'>
							<span className='text-primary'>📖</span>책 선택{" "}
							<span className='text-red-500'>*</span>
						</label>
						<select
							name='bookId'
							value={formData.bookId}
							onChange={handleChange}
							className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 bg-white'
							required
							disabled={!!editData}
						>
							<option value=''>책을 선택하세요</option>
							{books.map((book) => (
								<option key={book.id} value={book.id}>
									{book.title} - {book.author}
								</option>
							))}
						</select>
					</div>

					{/* 선택된 책 미리보기 */}
					{selectedBook && (
						<div className='bg-primary/5 p-4 rounded-lg border border-primary/20 flex items-center gap-4'>
							<img
								src={selectedBook.frontCoverImageUrl}
								alt={selectedBook.title}
								className='w-16 h-24 object-cover rounded shadow-md'
							/>
							<div>
								<h3 className='font-bold text-base text-gray-900 mb-1'>{selectedBook.title}</h3>
								<p className='text-sm text-gray-600'>{selectedBook.author}</p>
							</div>
						</div>
					)}

					{/* 날짜 입력 그룹 */}
					<div className='bg-gray-50 p-4 rounded-lg space-y-3 border border-gray-100'>
						{/* 시작일 */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5'>
								<span className='text-primary'>📅</span>
								시작일 <span className='text-red-500'>*</span>
							</label>
							<input
								type='date'
								name='startDate'
								value={formData.startDate}
								onChange={handleChange}
								className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 bg-white'
								required
							/>
						</div>

						{/* 종료일 */}
						<div>
							<label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5'>
								<span className='text-primary'>🏁</span>
								종료일 <span className='text-red-500'>*</span>
							</label>
							<input
								type='date'
								name='endDate'
								value={formData.endDate}
								onChange={handleChange}
								className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 bg-white'
								required
							/>
						</div>
					</div>

					{/* 메모 */}
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5'>
							<span className='text-primary'>✏️</span>
							메모
						</label>
						<textarea
							name='memo'
							value={formData.memo}
							onChange={handleChange}
							rows='3'
							className='w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-light focus:border-primary transition-all duration-200 bg-white resize-none'
							placeholder='독서 소감이나 기억하고 싶은 내용을 적어보세요.'
						/>
					</div>

					{/* 버튼 */}
					<div className='flex gap-2 pt-2'>
						<button
							type='button'
							onClick={onClose}
							className='flex-1 px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-all duration-200'
						>
							취소
						</button>
						<button
							type='submit'
							className='flex-1 px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark font-medium transition-all duration-200 shadow-sm hover:shadow-md'
						>
							{editData ? "수정" : "추가"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddReadingModal;
