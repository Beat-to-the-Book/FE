import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { bookAPI } from "../lib/api/book";
import useAuthStore from "../lib/store/authStore";
import useCartStore from "../lib/store/cartStore";
import SearchResults from "./SearchResults";

const Header = () => {
	const navigate = useNavigate();
	const { isAuthenticated, clearAuth } = useAuthStore();
	const { getTotalItems } = useCartStore();
	const [searchTerm, setSearchTerm] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [showResults, setShowResults] = useState(false);
	const searchTimeout = useRef(null);

	const handleSearch = async (value) => {
		setSearchTerm(value);
		if (value.trim()) {
			// 디바운스 처리
			if (searchTimeout.current) {
				clearTimeout(searchTimeout.current);
			}
			searchTimeout.current = setTimeout(async () => {
				try {
					const response = await bookAPI.search(value);
					setSearchResults(response.data);
					setShowResults(true);
				} catch (error) {
					console.error("검색 실패:", error);
				}
			}, 300);
		} else {
			setSearchResults([]);
			setShowResults(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === "Enter" && searchTerm.trim()) {
			navigate(`/search?keyword=${encodeURIComponent(searchTerm.trim())}`);
			setShowResults(false);
		}
	};

	const handleClickOutside = (e) => {
		if (!e.target.closest(".search-container")) {
			setShowResults(false);
		}
	};

	useEffect(() => {
		document.addEventListener("click", handleClickOutside);
		return () => {
			document.removeEventListener("click", handleClickOutside);
		};
	}, []);

	const handleLogout = () => {
		clearAuth();
		navigate("/login");
	};

	return (
		<header className='bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					{/* 왼쪽: 로고 */}
					<Link to='/' className='flex items-center'>
						<div className='w-10 h-10 bg-primary rounded-xl flex items-center justify-center mr-2'>
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
						<span className='text-primary font-bold text-xl'>Beat to the Book</span>
					</Link>

					{/* 중앙: 검색 */}
					<div className='flex-1 max-w-2xl mx-8'>
						<div className='relative search-container'>
							<div className='relative'>
								<input
									type='text'
									placeholder='책 제목, 저자를 검색하세요...'
									value={searchTerm}
									onChange={(e) => handleSearch(e.target.value)}
									onKeyPress={handleKeyPress}
									className='w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all'
								/>
								<svg
									className='absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
									/>
								</svg>
							</div>
							{showResults && (
								<SearchResults results={searchResults} onClose={() => setShowResults(false)} />
							)}
						</div>
					</div>

					{/* 오른쪽: 메뉴 */}
					<div className='flex items-center space-x-6'>
						<Link
							to='/community'
							className='text-gray-700 hover:text-primary font-medium transition-colors'
						>
							커뮤니티
						</Link>
						<Link
							to='/reports'
							className='text-gray-700 hover:text-primary font-medium transition-colors'
						>
							독후감
						</Link>
						{isAuthenticated ? (
							<>
								<Link
									to='/ranking'
									className='text-gray-700 hover:text-primary font-medium transition-colors'
								>
									랭킹
								</Link>
								<div className='relative group'>
									<button className='text-gray-700 hover:text-primary font-medium transition-colors'>
										MY
									</button>
									<div className='absolute right-0 w-48 mt-3 py-2 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
										<Link
											to='/bookshelf'
											className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors'
										>
											책장꾸미기
										</Link>
										<Link
											to='/minigame'
											className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors'
										>
											미니게임
										</Link>
										<Link
											to='/mypage'
											className='block px-4 py-2.5 text-sm text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors'
										>
											마이페이지
										</Link>
									</div>
								</div>
								<Link
									to='/cart'
									className='relative text-gray-700 hover:text-primary font-medium transition-colors'
								>
									장바구니
									{getTotalItems() > 0 && (
										<span className='absolute -top-2 -right-2 bg-primary-light text-primary-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md'>
											{getTotalItems()}
										</span>
									)}
								</Link>
								<button
									onClick={handleLogout}
									className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all'
								>
									로그아웃
								</button>
							</>
						) : (
							<>
								<Link
									to='/cart'
									className='relative text-gray-700 hover:text-primary font-medium transition-colors'
								>
									장바구니
									{getTotalItems() > 0 && (
										<span className='absolute -top-2 -right-2 bg-primary-light text-primary-dark text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md'>
											{getTotalItems()}
										</span>
									)}
								</Link>
								<Link
									to='/login'
									className='px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-all'
								>
									로그인
								</Link>
								<Link
									to='/signup'
									className='px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg'
								>
									회원가입
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</header>
	);
};

export default Header;
