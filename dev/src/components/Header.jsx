import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../lib/store/authStore";
import useCartStore from "../lib/store/cartStore";

const Header = () => {
	const navigate = useNavigate();
	const { isAuthenticated, clearAuth } = useAuthStore();
	const { getTotalItems } = useCartStore();

	const handleLogout = () => {
		clearAuth();
		navigate("/login");
	};

	return (
		<header className='bg-white shadow-md'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex justify-between items-center h-16'>
					{/* 왼쪽 영역: 홈, 검색 */}
					<div className='flex items-center space-x-8'>
						<Link to='/' className='text-primary font-bold text-xl'>
							홈
						</Link>
						<div className='relative'>
							<input
								type='text'
								placeholder='책 검색...'
								className='w-64 px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary-light'
							/>
						</div>
					</div>

					{/* 중앙 영역: 랭킹, 커뮤니티 */}
					<div className='flex items-center space-x-6'>
						<Link to='/ranking' className='text-gray-700 hover:text-primary'>
							랭킹
						</Link>
						<Link to='/community' className='text-gray-700 hover:text-primary'>
							커뮤니티
						</Link>
					</div>

					{/* 오른쪽 영역: MY, 장바구니, 로그인/회원가입 */}
					<div className='flex items-center space-x-6'>
						{isAuthenticated ? (
							<>
								<div className='relative group'>
									<button className='text-gray-700 hover:text-primary'>MY</button>
									<div className='absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-xl hidden group-hover:block'>
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
