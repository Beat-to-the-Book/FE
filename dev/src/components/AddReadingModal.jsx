import { useEffect, useMemo, useState } from "react";

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

	const normalizedBooks = useMemo(
		() =>
			books.map((book) => ({
				...book,
				id: book.bookId || book.id,
			})),
		[books]
	);

	useEffect(() => {
		if (editData) {
			setFormData({
				bookId: String(editData.bookId),
				startDate: editData.startDate,
				endDate: editData.endDate,
				memo: editData.memo || "",
			});
			const book = normalizedBooks.find((b) => b.id === editData.bookId);
			setSelectedBook(book || null);
		} else if (selectedDate) {
			const dateStr = new Date(selectedDate).toISOString().split("T")[0];
			setFormData({
				bookId: "",
				startDate: dateStr,
				endDate: dateStr,
				memo: "",
			});
			setSelectedBook(null);
		}
	}, [editData, selectedDate, normalizedBooks]);

	const handleChange = (event) => {
		const { name, value } = event.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		if (name === "bookId") {
			const book = normalizedBooks.find((b) => String(b.id) === value);
			setSelectedBook(book || null);
		}
	};

	const handleSubmit = (event) => {
		event.preventDefault();

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

		onSubmit({
			...formData,
			bookId: Number(formData.bookId),
		});
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 sm:px-6'>
			<div className='relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 animate-slideUp'>
				<div className='absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-primary/90 via-primary to-primary-dark blur-3xl opacity-20 pointer-events-none'></div>
				<div className='relative p-7 sm:p-8 space-y-6'>
					<div className='flex items-start justify-between'>
						<div>
							<p className='text-sm font-medium text-primary-light'>
								{selectedBook ? "선택한 책으로 기록 중" : "새 독서 기록 만들기"}
							</p>
							<h2 className='mt-1 text-2xl font-bold text-gray-900'>
								{editData ? "독서 기록 수정" : "독서 기록 추가"}
							</h2>
						</div>
						<button
							type='button'
							onClick={onClose}
							className='flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-all hover:bg-gray-200 hover:text-gray-700'
							aria-label='닫기'
						>
							✕
						</button>
					</div>

					<form onSubmit={handleSubmit} className='space-y-6'>
						<div className='grid gap-4'>
							<label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
								<span className='text-lg'>📙</span>
								<span>책 선택</span>
								<span className='text-xs font-medium text-primary-light'>필수</span>
							</label>
							<div className='relative'>
								<select
									name='bookId'
									value={formData.bookId}
									onChange={handleChange}
									disabled={!!editData}
									className='w-full appearance-none rounded-2xl border-2 border-gray-200 bg-gray-50 px-5 py-3 text-sm font-medium text-gray-800 shadow-inner transition-all hover:border-primary/50 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100'
								>
									<option value=''>어떤 책을 읽었나요?</option>
									{normalizedBooks.map((book) => (
										<option key={book.id} value={book.id}>
											{book.title} · {book.author}
										</option>
									))}
								</select>
								<div className='pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-400'>
									▾
								</div>
							</div>
							{!selectedBook && (
								<p className='text-xs text-gray-500'>
									읽은 책을 선택하면 표지와 정보를 미리 볼 수 있어요.
								</p>
							)}
						</div>

						{selectedBook && (
							<div className='flex gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 shadow-inner'>
								<div className='flex-shrink-0 overflow-hidden rounded-xl border border-white/60 shadow-lg'>
									<img
										src={selectedBook.frontCoverImageUrl}
										alt={selectedBook.title}
										className='h-28 w-20 object-cover'
									/>
								</div>
								<div className='flex flex-1 flex-col justify-center gap-1.5'>
									<p className='text-sm font-semibold text-primary line-clamp-2'>
										{selectedBook.title}
									</p>
									<p className='text-xs text-gray-600'>{selectedBook.author}</p>
									<div className='flex flex-wrap items-center gap-2 text-[11px] text-primary-dark/80'>
										<span className='rounded-full bg-white/60 px-2 py-0.5 shadow-sm'>
											📚 독서 진행 중
										</span>
										{formData.memo && (
											<span className='rounded-full bg-white/60 px-2 py-0.5 shadow-sm'>
												📝 메모 작성 중
											</span>
										)}
									</div>
								</div>
							</div>
						)}

						<div className='grid gap-4 rounded-2xl border border-gray-200 bg-gray-50/60 p-5'>
							<div className='flex items-center justify-between'>
								<h3 className='text-sm font-semibold text-gray-700'>독서 기간</h3>
								<span className='text-xs text-gray-500'>시작일과 종료일을 선택하세요</span>
							</div>
							<div className='grid gap-3 sm:grid-cols-2'>
								<label className='flex flex-col gap-2 rounded-xl border border-transparent bg-white px-4 py-4 shadow-sm transition-all focus-within:border-primary focus-within:shadow-md'>
									<span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
										시작일
									</span>
									<input
										type='date'
										name='startDate'
										value={formData.startDate}
										onChange={handleChange}
										className='w-full text-sm font-semibold text-gray-800 focus:outline-none'
										required
									/>
								</label>
								<label className='flex flex-col gap-2 rounded-xl border border-transparent bg-white px-4 py-4 shadow-sm transition-all focus-within:border-primary focus-within:shadow-md'>
									<span className='text-xs font-medium text-gray-500 uppercase tracking-wide'>
										종료일
									</span>
									<input
										type='date'
										name='endDate'
										value={formData.endDate}
										onChange={handleChange}
										className='w-full text-sm font-semibold text-gray-800 focus:outline-none'
										required
									/>
								</label>
							</div>
						</div>

						<div className='space-y-2'>
							<div className='flex items-center justify-between'>
								<label className='text-sm font-semibold text-gray-700 flex items-center gap-1.5'>
									<span className='text-lg'>📝</span>
									<span>메모</span>
								</label>
								<span className='text-xs text-gray-400'>
									{formData.memo.length} / 300
								</span>
							</div>
							<textarea
								name='memo'
								value={formData.memo}
								onChange={(event) => {
									if (event.target.value.length > 300) {
										return;
									}
									handleChange(event);
								}}
								rows={4}
								className='w-full rounded-2xl border-2 border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 transition-all hover:border-primary/40 focus:border-primary focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary/15 resize-none shadow-inner'
								placeholder='이번 독서를 통해 느낀 점이나 기억하고 싶은 내용을 적어보세요.'
							/>
						</div>

						<div className='flex flex-col gap-3 pt-2 sm:flex-row sm:justify-end sm:gap-4'>
							<button
								type='button'
								onClick={onClose}
								className='w-full sm:w-auto rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100'
							>
								취소
							</button>
							<button
								type='submit'
								className='w-full sm:w-auto rounded-2xl bg-gradient-to-r from-primary to-primary-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:translate-y-[-1px] hover:shadow-xl'
							>
								{editData ? "기록 업데이트" : "기록 추가하기"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default AddReadingModal;
