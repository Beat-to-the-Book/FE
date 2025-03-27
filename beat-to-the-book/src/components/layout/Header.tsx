// src/components/layout/Header.tsx
"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
// import { useRouter } from "next/navigation";
import { logout } from "@/lib/api/auth";

export default function Header() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const clearToken = useAuthStore((state) => state.clearToken);
	// const router = useRouter();

	const handleLogout = async () => {
		try {
			await logout(); // 서버에 로그아웃 요청
			clearToken(); // 로컬 상태 초기화
			// router.push("/auth/signin"); // 로그인 페이지로 이동
		} catch (error) {
			console.error("로그아웃 실패:", error);
			// 에러 발생 시에도 로컬 상태 초기화 후 이동
			clearToken();
			// router.push("/auth/signin");
		}
	};

	return (
		<header>
			<nav>
				<Link href='/'>홈</Link>
				{isAuthenticated ? (
					<button onClick={handleLogout}>로그아웃</button>
				) : (
					<>
						<Link href='/auth/signin'>로그인</Link>
						<Link href='/auth/signup'>회원가입</Link>
						<Link href='/cart'>장바구니</Link>
						<Link href='comunity'>커뮤니티</Link>
					</>
				)}
			</nav>
		</header>
	);
}
