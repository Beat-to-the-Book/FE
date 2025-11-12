import { useState, useEffect } from "react";
import { bookAPI } from "../lib/api/book";
import { useNavigate } from "react-router-dom";
import useBehaviorStore from "../lib/store/behaviorStore";
import RecentBooks from "../components/RecentBooks";

const ITEMS_PER_PAGE = 20; // 한 페이지당 보여줄 책의 개수

const HomePage = () => {
	const [books, setBooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const navigate = useNavigate();

	// 현재 페이지의 책들만 필터링
	const getCurrentPageBooks = () => {
		const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
		const endIndex = startIndex + ITEMS_PER_PAGE;
		return books.slice(startIndex, endIndex);
	};

	// 전체 페이지 수 계산
	const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);

	// 페이지 그룹 계산
	const getPageGroups = () => {
		const groups = [];
		const groupSize = 5;
		for (let i = 0; i < totalPages; i += groupSize) {
			groups.push(
				Array.from({ length: Math.min(groupSize, totalPages - i) }, (_, index) => i + index + 1)
			);
		}
		return groups;
	};

	// 현재 페이지가 속한 그룹 찾기
	const getCurrentGroup = () => {
		return Math.floor((currentPage - 1) / 5);
	};

	// 페이지 변경 핸들러
	const handlePageChange = (pageNumber) => {
		setCurrentPage(pageNumber);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	// 그룹 이동 핸들러
	const handleGroupChange = (direction) => {
		const currentGroup = getCurrentGroup();
		const pageGroups = getPageGroups();

		if (direction === "next" && currentGroup < pageGroups.length - 1) {
			setCurrentPage(pageGroups[currentGroup + 1][0]);
		} else if (direction === "prev" && currentGroup > 0) {
			setCurrentPage(pageGroups[currentGroup - 1][0]);
		}
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				const response = await bookAPI.getAll();
				setBooks(response.data);
			} catch (error) {
				setError("책 목록을 불러오는데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		fetchBooks();
	}, []);

	const handleBookClick = (bookId) => {
		navigate(`/book/${bookId}`);
	};

	if (loading) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<div className='text-red-500'>{error}</div>
			</div>
		);
	}

	return (
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			{/* 메인 배너 - 추천 도서 섹션 */}
			<div
				onClick={() => navigate("/recommend")}
				className='relative h-[500px] rounded-3xl overflow-hidden mb-12 cursor-pointer group'
			>
				{/* 그라데이션 배경 */}
				<div className='absolute inset-0 bg-gradient-to-br from-primary-dark via-[#023430] to-primary/90'></div>

				{/* 장식용 원형 요소들 - 애니메이션 */}
				<div className='absolute top-1/4 right-1/4 w-96 h-96 bg-primary-light/20 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700'></div>
				<div className='absolute bottom-1/4 left-1/4 w-72 h-72 bg-primary-light/15 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700'></div>
				<div className='absolute top-1/2 right-1/3 w-64 h-64 bg-secondary-light/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700'></div>

				{/* 콘텐츠 */}
				<div className='absolute inset-0 flex items-center'>
					<div className='text-white p-8 md:p-12 max-w-3xl relative z-10'>
						<div className='space-y-6'>
							{/* 아이콘 및 배지 */}
							<div className='flex items-center gap-3 mb-4'>
								<div className='w-12 h-12 rounded-full bg-primary-light/20 backdrop-blur-sm flex items-center justify-center group-hover:rotate-12 transition-transform duration-300'>
									<svg
										className='w-6 h-6 text-primary-light'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
										/>
									</svg>
								</div>
								<span className='px-4 py-1.5 bg-primary-light/20 backdrop-blur-sm rounded-full text-sm font-semibold text-primary-light border border-primary-light/30'>
									맞춤 추천
								</span>
							</div>

							<h1 className='text-5xl md:text-6xl font-bold mb-4 leading-tight'>
								당신을 위한
								<br />
								<span className='text-primary-light relative inline-block'>
									<span className='relative z-10'>추천 도서</span>
									<span className='absolute bottom-2 left-0 right-0 h-3 bg-primary-light/30 -z-0 transform -rotate-1'></span>
								</span>
								를 만나보세요
							</h1>

							<p className='text-xl md:text-2xl text-gray-100 leading-relaxed max-w-2xl'>
								AI가 분석한 당신의 독서 취향과 관심사를 바탕으로
								<br />
								<span className='text-primary-light font-semibold'>5권의 맞춤 도서</span>와 추천
								이유를 확인해보세요
							</p>

							<div className='flex flex-col sm:flex-row gap-4 mt-8'>
								<button
									onClick={(e) => {
										e.stopPropagation();
										navigate("/recommend");
									}}
									className='group/btn px-8 py-4 bg-primary-light text-primary-dark rounded-xl font-bold text-lg hover:bg-secondary-light transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 flex items-center justify-center gap-2'
								>
									<span>추천 도서 보기</span>
									<svg
										className='w-5 h-5 group-hover/btn:translate-x-1 transition-transform duration-300'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth={2}
											d='M13 7l5 5m0 0l-5 5m5-5H6'
										/>
									</svg>
								</button>
							</div>

							{/* 특징 설명 */}
							<div className='flex flex-wrap gap-4 mt-8 pt-6 border-t border-white/20'>
								<div className='flex items-center gap-2 text-sm text-gray-200'>
									<svg
										className='w-5 h-5 text-primary-light'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span>독서 패턴 분석</span>
								</div>
								<div className='flex items-center gap-2 text-sm text-gray-200'>
									<svg
										className='w-5 h-5 text-primary-light'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span>맞춤 추천 이유 제공</span>
								</div>
								<div className='flex items-center gap-2 text-sm text-gray-200'>
									<svg
										className='w-5 h-5 text-primary-light'
										fill='currentColor'
										viewBox='0 0 20 20'
									>
										<path
											fillRule='evenodd'
											d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
											clipRule='evenodd'
										/>
									</svg>
									<span>실시간 업데이트</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* 화살표 아이콘 (우측 하단) */}
				<div className='absolute bottom-8 right-8 w-16 h-16 rounded-full bg-primary-light/20 backdrop-blur-sm flex items-center justify-center border border-primary-light/30 group-hover:translate-x-2 transition-transform duration-300'>
					<svg
						className='w-8 h-8 text-primary-light'
						fill='none'
						stroke='currentColor'
						viewBox='0 0 24 24'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M13 7l5 5m0 0l-5 5m5-5H6'
						/>
					</svg>
				</div>
			</div>

			<div className='flex gap-8'>
				<div className='flex-1 space-y-8 max-w-[calc(100%)]'>
					<div className='flex justify-between items-center'>
						<h2 className='text-2xl font-bold text-primary'>베스트셀러</h2>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
						{getCurrentPageBooks().map((book) => (
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
									<h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2'>
										{book.title}
									</h3>
									<p className='text-sm text-gray-600'>{book.author}</p>
								</div>
							</div>
						))}
					</div>

					{/* 페이지네이션 UI */}
					{totalPages > 0 && (
						<div className='flex justify-center items-center space-x-2 mt-8'>
							<button
								onClick={() => handleGroupChange("prev")}
								disabled={getCurrentGroup() === 0}
								className='px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-light transition-all'
							>
								{"<<"}
							</button>
							<button
								onClick={() => handlePageChange(currentPage - 1)}
								disabled={currentPage === 1}
								className='px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-light transition-all'
							>
								이전
							</button>
							{getPageGroups()[getCurrentGroup()]?.map((pageNum) => (
								<button
									key={pageNum}
									onClick={() => handlePageChange(pageNum)}
									className={`px-4 py-2 rounded-lg transition-all ${
										currentPage === pageNum
											? "bg-primary text-white shadow-md"
											: "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-primary-light"
									}`}
								>
									{pageNum}
								</button>
							))}
							<button
								onClick={() => handlePageChange(currentPage + 1)}
								disabled={currentPage === totalPages}
								className='px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-light transition-all'
							>
								다음
							</button>
							<button
								onClick={() => handleGroupChange("next")}
								disabled={getCurrentGroup() === getPageGroups().length - 1}
								className='px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-primary-light transition-all'
							>
								{">>"}
							</button>
						</div>
					)}
				</div>
				<div className='hidden xl:block fixed right-8 top-20 w-42'>
					<RecentBooks layout='vertical' />
				</div>
			</div>
		</div>
	);
};

export default HomePage;
