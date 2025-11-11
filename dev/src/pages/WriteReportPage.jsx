import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reportAPI } from "../lib/api/report";
import { pointsAPI } from "../lib/api/points";
import useAuthStore from "../lib/store/authStore";

const WriteReportPage = () => {
	const navigate = useNavigate();
	const { bookId: routeBookId } = useParams();
	const { isAuthenticated } = useAuthStore();
	const parsedRouteBookId = routeBookId ? Number(routeBookId) : null;
	const initialBookId =
		parsedRouteBookId !== null && !Number.isNaN(parsedRouteBookId) ? parsedRouteBookId : null;
	const [formData, setFormData] = useState({
		bookId: initialBookId,
		content: "",
		rating: 5,
		publicVisible: true,
	});
	const [loading, setLoading] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [books, setBooks] = useState([]);
	const [booksLoading, setBooksLoading] = useState(false);
	const [bookError, setBookError] = useState("");
	const [bookDropdownOpen, setBookDropdownOpen] = useState(false);
	const dropdownRef = useRef(null);

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}

		if (!formData.bookId) {
			setSubmitError("독후감을 작성할 책을 선택해주세요.");
			return;
		}

		try {
			setLoading(true);
			setSubmitError("");
			await reportAPI.create(formData);
			navigate("/reports");
		} catch (error) {
			setSubmitError("독후감 작성에 실패했습니다.");
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]:
				type === "checkbox"
					? checked
					: name === "rating"
					? Number(value)
					: value,
		}));
	};

	const handleBookSelect = (bookId) => {
		setFormData((prev) => ({
			...prev,
			bookId,
		}));
		setSubmitError("");
		setBookDropdownOpen(false);
	};

	const handleBookClear = () => {
		setFormData((prev) => ({
			...prev,
			bookId: null,
		}));
		setBookDropdownOpen(false);
	};

	const loadMyBooks = useCallback(async () => {
		if (!isAuthenticated) {
			return;
		}

		setBooksLoading(true);
		try {
			const response = await pointsAPI.getMyBooks();
			const items = Array.isArray(response.data) ? response.data : [];
			setBooks(items);
			setBookError("");

			setFormData((prev) => {
				if (prev.bookId && !items.some((book) => book.bookId === prev.bookId)) {
					return {
						...prev,
						bookId: null,
					};
				}

				if (!prev.bookId && initialBookId && items.some((book) => book.bookId === initialBookId)) {
					return {
						...prev,
						bookId: initialBookId,
					};
				}

				return prev;
			});
		} catch (error) {
			console.error("책 목록을 불러오지 못했습니다.", error);
			setBookError("책 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
		} finally {
			setBooksLoading(false);
		}
	}, [initialBookId, isAuthenticated]);

	useEffect(() => {
		loadMyBooks();
	}, [loadMyBooks]);

	useEffect(() => {
		if (!bookDropdownOpen) {
			return;
		}

		const handleClickOutside = (event) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setBookDropdownOpen(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [bookDropdownOpen]);

	const selectedBookId = formData.bookId;
	const selectedBook = selectedBookId ? books.find((book) => book.bookId === selectedBookId) : null;

	if (!isAuthenticated) {
		return (
			<div className='flex items-center justify-center min-h-screen p-4'>
				<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center max-w-md'>
					<div className='w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6'>
						<svg
							className='w-10 h-10 text-primary'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
							/>
						</svg>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 mb-2'>로그인이 필요합니다</h2>
					<p className='text-gray-600 mb-6'>독후감을 작성하려면 로그인이 필요합니다</p>
					<button
						onClick={() => navigate("/login")}
						className='w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg'
					>
						로그인하기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-primary mb-2'>독후감 작성</h1>
				<p className='text-gray-600'>책을 읽고 느낀 점을 자유롭게 작성해보세요</p>
			</div>

			<div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100'>
				<form onSubmit={handleSubmit} className='space-y-6'>
					<div className='space-y-4'>
						<div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
							<div className='space-y-1'>
								<h2 className='text-lg font-semibold text-gray-800'>책 선택</h2>
								<p className='text-sm text-gray-500'>구매하거나 대여한 책 중에서 독후감을 작성할 책을 선택해주세요.</p>
							</div>
							<button
								type='button'
								onClick={loadMyBooks}
								disabled={booksLoading}
								className='px-4 py-2 text-sm font-semibold text-primary hover:text-primary-dark disabled:text-gray-400 disabled:cursor-not-allowed transition-colors'
							>
								{booksLoading ? "불러오는 중..." : "다시 불러오기"}
							</button>
						</div>

						{bookError && (
							<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4'>
								{bookError}
							</div>
						)}

						{!bookError && (
							<>
								{booksLoading ? (
									<div className='flex items-center justify-between gap-4 p-4 border-2 border-gray-100 rounded-2xl animate-pulse'>
										<div className='w-16 h-24 bg-gray-200 rounded-xl' />
										<div className='flex-1 space-y-2'>
											<div className='h-4 bg-gray-200 rounded' />
											<div className='h-4 bg-gray-200 rounded w-1/2' />
										</div>
										<div className='w-10 h-10 bg-gray-200 rounded-full' />
									</div>
								) : books.length > 0 ? (
									<div className='space-y-4' ref={dropdownRef}>
										<div className='relative'>
											<button
												type='button'
												onClick={() => setBookDropdownOpen((prev) => !prev)}
												className={`w-full flex items-center justify-between gap-3 px-4 py-3 border-2 rounded-xl transition-all ${
													selectedBook
														? "border-primary/60 bg-primary/5 hover:border-primary hover:bg-primary/10"
														: "border-gray-200 hover:border-primary-light hover:bg-gray-50"
												}`}
												aria-haspopup='listbox'
												aria-expanded={bookDropdownOpen}
											>
												<div className='flex items-center gap-3 min-w-0'>
													<div className='w-12 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0'>
														{selectedBook ? (
															<img
																src={selectedBook.frontCoverImageUrl}
																alt={`${selectedBook.title} 표지`}
																className='w-full h-full object-cover'
															/>
														) : (
															<div className='w-full h-full flex items-center justify-center text-gray-400 text-xs'>
																표지
															</div>
														)}
													</div>
													<div className='flex flex-col text-left min-w-0'>
														<span className='text-sm font-semibold text-gray-800 truncate'>
															{selectedBook ? selectedBook.title : "독후감 작성할 책을 선택하세요"}
														</span>
														<span className='text-xs text-gray-500'>
															{selectedBook
																? `${selectedBook.purchased ? "구매" : ""}${
																		selectedBook.purchased && selectedBook.rented ? " · " : ""
																  }${selectedBook.rented ? "대여" : ""}`
																: "구매 또는 대여했던 책 목록"}
														</span>
													</div>
												</div>
												<span
													className={`text-sm transition-transform ${
														bookDropdownOpen ? "rotate-180 text-primary" : "text-gray-400"
													}`}
													aria-hidden='true'
												>
													▾
												</span>
											</button>

											{bookDropdownOpen && (
												<div className='absolute z-20 mt-2 w-full max-h-72 overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl ring-1 ring-black/5'>
													<button
														type='button'
														onClick={handleBookClear}
														className='w-full text-left px-4 py-3 text-sm text-gray-500 hover:bg-gray-50 border-b border-gray-100'
													>
														선택 해제
													</button>
													<ul role='listbox' className='divide-y divide-gray-100'>
														{books.map((book) => {
															const isActive = selectedBookId === book.bookId;
															return (
																<li key={book.bookId}>
																	<button
																		type='button'
																		onClick={() => handleBookSelect(book.bookId)}
																		role='option'
																		aria-selected={isActive}
																		className={`w-full flex items-center gap-4 px-4 py-3 transition-colors ${
																			isActive
																				? "bg-primary/10 text-primary"
																				: "hover:bg-gray-50"
																		}`}
																	>
																		<div className='w-12 h-16 rounded-lg overflow-hidden shadow-sm bg-gray-100 flex-shrink-0'>
																			<img
																				src={book.frontCoverImageUrl}
																				alt={`${book.title} 표지`}
																				className='w-full h-full object-cover'
																			/>
																		</div>
																		<div className='flex-1 text-left min-w-0'>
																			<p className='text-sm font-semibold truncate'>{book.title}</p>
																			<div className='mt-1 flex flex-wrap gap-2'>
																				{book.purchased && (
																					<span className='inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-100 text-emerald-700'>
																						구매
																					</span>
																				)}
																				{book.rented && (
																					<span className='inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full bg-sky-100 text-sky-700'>
																						대여
																					</span>
																				)}
																			</div>
																		</div>
																		{isActive && (
																			<div className='w-6 h-6 flex items-center justify-center rounded-full bg-primary text-white text-xs shadow'>
																				✓
																			</div>
																		)}
																	</button>
																</li>
															);
														})}
													</ul>
												</div>
											)}
										</div>

										{selectedBook && (
											<div className='flex items-center gap-4 rounded-2xl border-2 border-primary/20 bg-primary/5 p-4'>
												<div className='w-20 h-28 rounded-xl overflow-hidden shadow-md bg-white flex-shrink-0'>
													<img
														src={selectedBook.frontCoverImageUrl}
														alt={`${selectedBook.title} 표지`}
														className='w-full h-full object-cover'
													/>
												</div>
												<div className='space-y-2'>
													<p className='text-base font-semibold text-gray-800'>
														{selectedBook.title}
													</p>
													<div className='flex flex-wrap gap-2'>
														{selectedBook.purchased && (
															<span className='px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700'>
																구매
															</span>
														)}
														{selectedBook.rented && (
															<span className='px-3 py-1 text-xs font-semibold rounded-full bg-sky-100 text-sky-700'>
																대여
															</span>
														)}
													</div>
												</div>
											</div>
										)}
									</div>
								) : (
									<div className='rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center'>
										<p className='text-sm text-gray-600'>
											구매하거나 대여한 책이 없습니다. 먼저 책을 구매 또는 대여한 후 독후감을 작성해보세요.
										</p>
									</div>
								)}
							</>
						)}
					</div>

					<div>
						<label htmlFor='content' className='block text-sm font-semibold text-gray-700 mb-2'>
							독후감 내용
						</label>
						<textarea
							id='content'
							name='content'
							value={formData.content}
							onChange={handleChange}
							required
							rows={12}
							className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none'
							placeholder='책을 읽고 느낀 점을 작성해주세요'
						/>
					</div>

					<div>
						<label htmlFor='rating' className='block text-sm font-semibold text-gray-700 mb-2'>
							평점
						</label>
						<select
							id='rating'
							name='rating'
							value={formData.rating}
							onChange={handleChange}
							required
							className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
						>
							{[5, 4, 3, 2, 1].map((rating) => (
								<option key={rating} value={rating}>
									{"★".repeat(rating)} {rating}점
								</option>
							))}
						</select>
					</div>

					<div className='flex items-center bg-gray-50 p-4 rounded-xl'>
						<input
							type='checkbox'
							id='publicVisible'
							name='publicVisible'
							checked={formData.publicVisible}
							onChange={handleChange}
							className='w-4 h-4 text-primary focus:ring-primary-light border-gray-300 rounded'
						/>
						<label htmlFor='publicVisible' className='ml-3 text-sm font-medium text-gray-700'>
							이 독후감을 공개합니다
						</label>
					</div>

					{submitError && (
						<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl'>
							{submitError}
						</div>
					)}

					<div className='flex justify-end space-x-3 pt-4 border-t border-gray-100'>
						<button
							type='button'
							onClick={() => navigate(-1)}
							className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
						>
							취소
						</button>
						<button
							type='submit'
							disabled={loading}
							className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all'
						>
							{loading ? "작성 중..." : "작성하기"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default WriteReportPage;
