// src/components/layout/Header.tsx
"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/lib/api/auth";
import SearchBar from "./SearchBar";

export default function Header() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("로그아웃 실패:", error);
		}
	};

	return (
		<header className='bg-stateBlue text-white p-4 relative top-0 z-10'>
			<nav className='max-w-4xl mx-auto flex items-center justify-between'>
				{/* 좌측 메뉴 */}
				<ul className='flex items-center space-x-6'>
					<li>
						<Link href='/' className='hover:text-springGreen'>
							홈
						</Link>
					</li>
					<li>
						<Link href='/community' className='hover:text-springGreen'>
							커뮤니티
						</Link>
					</li>
					<li className='relative group'>
						<span className='cursor-pointer hover:text-springGreen'>My</span>
						<ul
							className='absolute left-0 mt-2 w-44 bg-stateBlue text-white rounded-md shadow-lg
                            opacity-0 group-hover:opacity-100 invisible group-hover:visible transition-all duration-200'
						>
							<li>
								<Link href='/mypage/bookshelf' className='block px-4 py-2 hover:bg-everGreen'>
									책장 꾸미기
								</Link>
							</li>
							<li>
								<Link href='/mypage/calendar' className='block px-4 py-2 hover:bg-everGreen'>
									달력
								</Link>
							</li>
							<li>
								<Link href='/minigame' className='block px-4 py-2 hover:bg-everGreen'>
									미니게임
								</Link>
							</li>
							<li>
								<Link href='/mypage' className='block px-4 py-2 hover:bg-everGreen'>
									마이페이지
								</Link>
							</li>
						</ul>
					</li>
					<li>
						<Link href='/ranking' className='hover:text-springGreen'>
							랭킹(명예의 전당)
						</Link>
					</li>
				</ul>

				{/* 중앙 검색창 */}
				<SearchBar />

				{/* 우측 로그인/로그아웃 */}
				<div className='flex items-center space-x-4'>
					{isAuthenticated ? (
						<button
							onClick={handleLogout}
							className='bg-forestGreen px-3 py-1 rounded-md hover:bg-everGreen'
						>
							로그아웃
						</button>
					) : (
						<>
							<Link href='/auth/signin' className='hover:text-springGreen'>
								로그인
							</Link>
							<Link href='/auth/signup' className='hover:text-springGreen'>
								회원가입
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
