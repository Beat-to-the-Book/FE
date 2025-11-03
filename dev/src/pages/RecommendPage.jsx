import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { recommendAPI } from "../lib/api/recommend";
import { bookAPI } from "../lib/api/book";

// 더미 추천 이유 데이터
const DUMMY_REASONS = [
	"추천 도서인 '달러 자산 1억으로 평생 월급 완성하라'는 사용자가 이미 읽은 '박곰희 연금 부자 수업'과 관련이 깊어요. 또한 '트렌드 코리아 2026'과 '시대예보: 경량문명의 탄생'과 같은 미래 전망에 관심이 있는 사용자에게 적합할 것으로 보입니다. 이 책은 ETF 투자와 관련된 내용",
	"이 책은 사용자가 최근에 관심을 보인 경제/재테크 분야의 심화 내용을 다루고 있어요. 특히 '박곰희 연금 부자 수업'에서 다룬 내용을 실제 투자 전략으로 확장할 수 있는 실용적인 가이드를 제공합니다.",
	"사용자의 독서 패턴을 분석한 결과, 미래 트렌드와 사회 변화에 대한 관심이 높습니다. 이 책은 현재 트렌드 분석과 미래 전망을 연결하는 인사이트를 제공하며, 독자들의 깊은 사고를 자극합니다.",
	"이 책은 사용자가 선호하는 자기계발 분야의 새로운 관점을 제시합니다. 실용적인 조언과 함께 구체적인 실행 방법을 제시하여 독자들이 쉽게 적용할 수 있는 내용으로 구성되어 있습니다.",
	"최근 본 책들과의 연관성을 분석한 결과, 이 책은 사용자의 관심사와 일치하는 주제를 다루고 있어요. 특히 현재 읽고 있는 책의 내용을 보완하고 심화할 수 있는 내용을 포함하고 있습니다.",
];

const RecommendPage = () => {
	const navigate = useNavigate();
	const [recommendedBooks, setRecommendedBooks] = useState([]);
	const [loading, setLoading] = useState(true);
	const [reasonsLoading, setReasonsLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchRecommendations = async () => {
			try {
				setLoading(true);
				// 추천 책 5개 가져오기
				const response = await recommendAPI.getRecommendations();
				const books = response.data.recommendedBooks?.slice(0, 5) || [];

				// 각 책의 상세 정보 가져오기
				const bookDetails = await Promise.all(
					books.map((book) => bookAPI.getById(book.bookId).then((res) => res.data))
				);

				// 더미 추천 이유 추가 (나중에 API 연동 시 제거)
				const booksWithReasons = bookDetails.map((book, index) => ({
					...book,
					reason: DUMMY_REASONS[index] || "이 책은 사용자의 독서 취향과 관심사에 맞춘 추천입니다.",
				}));

				setRecommendedBooks(booksWithReasons);
				setError("");
			} catch (error) {
				console.error("추천 책 조회 에러:", error);
				setError("추천 책을 불러오는데 실패했습니다.");
			} finally {
				setLoading(false);
			}
		};

		fetchRecommendations();
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
		<div className='min-h-screen bg-gradient-to-b from-gray-50 to-white'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
				{/* 헤더 */}
				<div className='mb-12 text-center'>
					<div className='inline-flex items-center gap-2 px-4 py-2 bg-primary-light/10 rounded-full mb-6'>
						<svg className='w-5 h-5 text-primary' fill='currentColor' viewBox='0 0 20 20'>
							<path
								fillRule='evenodd'
								d='M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z'
								clipRule='evenodd'
							/>
						</svg>
						<span className='text-sm font-semibold text-primary'>AI 맞춤 추천</span>
					</div>
					<h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-4'>
						당신을 위한 <span className='text-primary'>추천 도서</span>
					</h1>
					<p className='text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed'>
						독서 패턴과 관심사를 분석하여 선별한 5권의 맞춤 추천 도서입니다.
						<br />각 책을 추천한 이유도 함께 확인해보세요.
					</p>
				</div>

				{/* 추천 도서 목록 */}
				{recommendedBooks.length === 0 ? (
					<div className='text-center py-20'>
						<div className='inline-block p-6 bg-gray-100 rounded-full mb-4'>
							<svg
								className='w-16 h-16 text-gray-400'
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
						<p className='text-xl text-gray-500'>추천 도서가 없습니다.</p>
					</div>
				) : (
					<div className='space-y-10'>
						{recommendedBooks.map((book, index) => (
							<div
								key={book.id || index}
								className='group relative bg-white rounded-3xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1'
							>
								{/* 순위 배지 */}
								<div className='absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-lg'>
									<span className='text-white font-bold text-lg'>{index + 1}</span>
								</div>

								<div className='md:flex'>
									{/* 책 표지 */}
									<div className='md:w-1/3 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8 md:p-12 relative overflow-hidden'>
										{/* 배경 장식 */}
										<div className='absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -mr-20 -mt-20'></div>
										<div className='absolute bottom-0 left-0 w-32 h-32 bg-primary-light/10 rounded-full -ml-16 -mb-16'></div>

										<div
											onClick={() => handleBookClick(book.id)}
											className='relative z-10 cursor-pointer transform group-hover:scale-105 transition-transform duration-300'
										>
											<img
												src={book.frontCoverImageUrl}
												alt={book.title}
												className='w-full max-w-xs rounded-xl shadow-2xl'
											/>
										</div>
									</div>

									{/* 책 정보 및 추천 이유 */}
									<div className='md:w-2/3 p-8 md:p-10 flex flex-col'>
										<div className='flex-1'>
											{/* 장르 및 메타 정보 */}
											<div className='flex flex-wrap items-center gap-3 mb-4'>
												<span className='px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full'>
													{book.genre}
												</span>
												<span className='text-sm text-gray-500 flex items-center gap-1'>
													<svg className='w-4 h-4' fill='currentColor' viewBox='0 0 20 20'>
														<path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z' />
													</svg>
													{book.author}
												</span>
											</div>

											{/* 책 제목 */}
											<h2
												onClick={() => handleBookClick(book.id)}
												className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 cursor-pointer hover:text-primary transition-colors leading-tight'
											>
												{book.title}
											</h2>

											{/* 책 상세 정보 */}
											<div className='grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-xl'>
												<div className='flex items-center gap-2'>
													<svg
														className='w-5 h-5 text-primary'
														fill='currentColor'
														viewBox='0 0 20 20'
													>
														<path d='M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z' />
													</svg>
													<div>
														<div className='text-xs text-gray-500'>출판사</div>
														<div className='font-medium text-gray-900'>{book.publisher}</div>
													</div>
												</div>
												<div className='flex items-center gap-2'>
													<svg
														className='w-5 h-5 text-primary'
														fill='currentColor'
														viewBox='0 0 20 20'
													>
														<path d='M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z' />
														<path
															fillRule='evenodd'
															d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z'
															clipRule='evenodd'
														/>
													</svg>
													<div>
														<div className='text-xs text-gray-500'>판매가</div>
														<div className='font-bold text-primary text-lg'>
															{book.price?.toLocaleString()}원
														</div>
													</div>
												</div>
											</div>

											{/* 추천 이유 */}
											<div className='relative bg-gradient-to-r from-primary/5 to-primary-light/5 border-l-4 border-primary p-6 md:p-8 rounded-r-2xl mb-6'>
												{/* 아이콘 */}
												<div className='absolute -top-3 -left-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg'>
													<svg
														className='w-5 h-5 text-white'
														fill='currentColor'
														viewBox='0 0 20 20'
													>
														<path
															fillRule='evenodd'
															d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z'
															clipRule='evenodd'
														/>
													</svg>
												</div>
												<h3 className='text-xl font-bold text-primary mb-4 ml-4'>추천 이유</h3>
												{reasonsLoading ? (
													<div className='flex items-center space-x-3'>
														<div className='animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary'></div>
														<span className='text-gray-600'>추천 이유를 분석 중입니다...</span>
													</div>
												) : (
													<p className='text-gray-700 leading-relaxed text-base md:text-lg ml-4'>
														{book.reason}
													</p>
												)}
											</div>
										</div>

										{/* 버튼 그룹 */}
										<div className='flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200'>
											<button
												onClick={() => handleBookClick(book.id)}
												className='flex-1 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2'
											>
												<span>상세 보기</span>
												<svg
													className='w-5 h-5'
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
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default RecommendPage;
