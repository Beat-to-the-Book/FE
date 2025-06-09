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
		<header className='bg-white shadow-md'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					{/* 왼쪽: 로고 */}
					<Link to='/' className='text-primary font-bold text-xl'>
						홈
					</Link>

					{/* 중앙: 검색 */}
					<div className='flex-1 max-w-2xl mx-8'>
						<div className='relative search-container'>
							<input
								type='text'
								placeholder='책 검색...'
								value={searchTerm}
								onChange={(e) => handleSearch(e.target.value)}
								onKeyPress={handleKeyPress}
								className='w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light'
							/>
							{showResults && (
								<SearchResults results={searchResults} onClose={() => setShowResults(false)} />
							)}
						</div>
					</div>

					{/* 오른쪽: 메뉴 */}
					<div className='flex items-center space-x-8'>
						<Link to='/ranking' className='text-gray-700 hover:text-primary'>
							랭킹
						</Link>
						<Link to='/community' className='text-gray-700 hover:text-primary'>
							커뮤니티
						</Link>
						<Link to='/reports' className='text-gray-700 hover:text-primary'>
							독후감
						</Link>
						{isAuthenticated ? (
							<>
								<div className='relative group'>
									<button className='text-gray-700 hover:text-primary'>MY</button>
									<div className='absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50'>
										<Link
											to='/bookshelf'
											className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
										>
											책장꾸미기
										</Link>
										<Link
											to='/calendar'
											className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
										>
											달력
										</Link>
										<Link
											to='/minigame'
											className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
										>
											미니게임
										</Link>
										<Link
											to='/mypage'
											className='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
										>
											마이페이지
										</Link>
									</div>
								</div>
								<Link to='/cart' className='relative text-gray-700 hover:text-primary'>
									장바구니
									{getTotalItems() > 0 && (
										<span className='absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
											{getTotalItems()}
										</span>
									)}
								</Link>
								<button onClick={handleLogout} className='text-gray-700 hover:text-primary'>
									로그아웃
								</button>
							</>
						) : (
							<>
								<Link to='/cart' className='relative text-gray-700 hover:text-primary'>
									장바구니
									{getTotalItems() > 0 && (
										<span className='absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center'>
											{getTotalItems()}
										</span>
									)}
								</Link>
								<Link to='/login' className='text-gray-700 hover:text-primary'>
									로그인
								</Link>
								<Link to='/signup' className='text-gray-700 hover:text-primary'>
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
