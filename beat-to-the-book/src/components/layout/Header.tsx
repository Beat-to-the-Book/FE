"use client";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";

export default function Header() {
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const clearToken = useAuthStore((state) => state.clearToken);
	const router = useRouter();

	const handleLogout = () => {
		clearToken();
		router.push("/auth/signin");
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
					</>
				)}
			</nav>
		</header>
	);
}
