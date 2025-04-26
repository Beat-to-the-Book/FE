// src/components/layout/Header.tsx
"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/lib/api/auth";

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
		<header className='bg-stateBlue text-white p-4 sticky top-0 z-10'>
			<nav className='max-w-4xl mx-auto flex justify-between items-center'>
				<Link href='/' className='text-lg font-bold hover:text-springGreen'>
					홈
				</Link>
				<div className='space-x-4'>
					{isAuthenticated ? (
						<>
							<button
								onClick={handleLogout}
								className='bg-forestGreen px-3 py-1 rounded-md hover:bg-everGreen'
							>
								로그아웃
							</button>
							<Link href='/cart' className='hover:text-springGreen'>
								장바구니
							</Link>
							<Link href='/community' className='hover:text-springGreen'>
								커뮤니티
							</Link>
							{/* 프로필은 아직 미완성 */}
							<Link href='/mypage' className='hover:text-springGreen'>
								마이페이지
							</Link>
						</>
					) : (
						<>
							<Link href='/auth/signin' className='hover:text-springGreen'>
								로그인
							</Link>
							<Link href='/auth/signup' className='hover:text-springGreen'>
								회원가입
							</Link>
							<Link href='/cart' className='hover:text-springGreen'>
								장바구니
							</Link>
							<Link href='/community' className='hover:text-springGreen'>
								커뮤니티
							</Link>
						</>
					)}
				</div>
			</nav>
		</header>
	);
}
