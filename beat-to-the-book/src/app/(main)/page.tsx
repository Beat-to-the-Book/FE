// src/pages/index.tsx

"use client";
import { useEffect, useState } from "react";
import BookItem from "@/components/books/BookItem";
import { useAuthStore } from "@/store/authStore";
import { Book, mockBooks } from "@/lib/api/mockBooks";

export default function Home() {
	const [books, setBooks] = useState<Book[]>([]);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true); // 클라이언트에서만 실행
	}, []);

	const isAuthStoreAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isAuthenticated = isMounted && isAuthStoreAuthenticated;

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				// Mock 데이터로 대체
				await new Promise((resolve) => setTimeout(resolve, 500)); // 지연 시뮬레이션
				setBooks(mockBooks);
			} catch (error) {
				console.error("책 목록 불러오기 실패:", error);
			}
		};

		fetchBooks();

		// 주석 처리된 원래 API 호출
		// const fetchBooks = async () => {
		//   try {
		//     const response = await api.get("/books");
		//     setBooks(response.data);
		//   } catch (error) {
		//     console.error("책 목록 불러오기 실패:", error);
		//   }
		// };
		//
		// fetchBooks();
	}, []);

	if (!isMounted) {
		return (
			<div>
				<section>
					<h1>추천 도서</h1>
					<p>로그인 후 더 많은 기능을 이용하세요.</p>
				</section>
				<section>
					<p>책 목록을 불러오는 중입니다...</p>
				</section>
			</div>
		);
	}

	return (
		<div>
			<section>
				<h1>추천 도서</h1>
			</section>
			<section>
				{books.length > 0 ? (
					books.map((book) => <BookItem key={book.id} book={book} />)
				) : (
					<p>책 목록을 불러오는 중입니다...</p>
				)}
			</section>
		</div>
	);
}
