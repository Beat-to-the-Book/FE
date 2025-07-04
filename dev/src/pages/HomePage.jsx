import { useState, useEffect } from "react";
import { bookAPI } from "../lib/api/book";
import { useNavigate } from "react-router-dom";
import useBehaviorStore from "../lib/store/behaviorStore";
import RecommendedBooks from "../components/RecommendedBooks";

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

		// 페이지 진입 시 행동 로그 전송
		const logBehavior = async () => {
			await useBehaviorStore.getState().logBehavior(null, 0, 0);
		};
		logBehavior();
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
			{/* 메인 배너 */}
			<div className='relative h-[400px] rounded-2xl overflow-hidden mb-12 bg-gradient-to-br from-[#00ED64] via-[#00684A] to-[#023430] animate-gradient'>
				<div className='absolute inset-0 bg-[#001E2B]/30 backdrop-blur-sm'></div>
				<div className='absolute inset-0 flex items-center'>
					<div className='text-white p-8 max-w-2xl relative z-10 animate-fade-in'>
						<div className='space-y-4'>
							<h1 className='text-5xl font-bold mb-4 leading-tight animate-slide-up'>
								당신의 독서 여정을
								<br />
								<span className='text-[#00ED64] animate-pulse-slow'>공유</span>하세요
							</h1>
							<p className='text-xl text-gray-100 animate-slide-up-delay'>
								같은 책을 읽은 사람들과 이야기를 나누며 더 깊은 독서 경험을 만들어보세요.
							</p>
							<div className='flex gap-4 mt-6 animate-slide-up-delay-2'>
								<button
									onClick={() => navigate("/community")}
									className='px-6 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-[#00ED64]/20'
								>
									커뮤니티에서 이야기 나누기
								</button>
							</div>
						</div>
					</div>
				</div>
				{/* 장식용 원형 요소들 */}
				<div className='absolute top-1/4 right-1/4 w-64 h-64 bg-[#00ED64]/20 rounded-full blur-3xl animate-float'></div>
				<div className='absolute bottom-1/4 left-1/4 w-48 h-48 bg-[#00684A]/20 rounded-full blur-2xl animate-float-delay'></div>
				<div className='absolute top-1/2 left-1/3 w-32 h-32 bg-[#00ED64]/10 rounded-full blur-xl animate-float-delay-2'></div>
				<div className='absolute top-1/3 right-1/3 w-24 h-24 bg-[#00ED64]/15 rounded-full blur-lg animate-spin-slow'></div>
				<div className='absolute bottom-1/3 right-1/4 w-40 h-40 bg-[#00684A]/15 rounded-full blur-2xl animate-pulse-slow'></div>
				{/* 반짝이는 효과 */}
				<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-gradient-shine'></div>
			</div>

			<div className='flex gap-8'>
				<div className='flex-1 space-y-8 max-w-[calc(100%)]'>
					<div className='flex justify-between items-center'>
						<h2 className='text-2xl font-bold text-gray-900'>도서 목록</h2>
						<div className='text-sm text-gray-500'>{books.length}개의 책</div>
					</div>
					<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
						{getCurrentPageBooks().map((book) => (
							<div
								key={book.id}
								onClick={() => handleBookClick(book.id)}
								className='bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1'
							>
								<div className='aspect-[3/4] relative'>
									<img
										src={book.frontCoverImageUrl}
										alt={book.title}
										className='w-full h-full object-cover rounded-t-xl'
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
					<div className='flex justify-center items-center space-x-2 mt-8'>
						<button
							onClick={() => handleGroupChange("prev")}
							disabled={getCurrentGroup() === 0}
							className='px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200'
						>
							{"<<"}
						</button>
						<button
							onClick={() => handlePageChange(currentPage - 1)}
							disabled={currentPage === 1}
							className='px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200'
						>
							이전
						</button>
						{getPageGroups()[getCurrentGroup()].map((pageNum) => (
							<button
								key={pageNum}
								onClick={() => handlePageChange(pageNum)}
								className={`px-3 py-1 rounded-md ${
									currentPage === pageNum
										? "bg-primary text-white"
										: "bg-gray-100 text-gray-700 hover:bg-gray-200"
								}`}
							>
								{pageNum}
							</button>
						))}
						<button
							onClick={() => handlePageChange(currentPage + 1)}
							disabled={currentPage === totalPages}
							className='px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200'
						>
							다음
						</button>
						<button
							onClick={() => handleGroupChange("next")}
							disabled={getCurrentGroup() === getPageGroups().length - 1}
							className='px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200'
						>
							{">>"}
						</button>
					</div>
				</div>
				<div className='hidden xl:block fixed right-8 top-20 w-42'>
					<RecommendedBooks layout='vertical' />
				</div>
			</div>
		</div>
	);
};

export default HomePage;
