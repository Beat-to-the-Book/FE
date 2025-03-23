"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api/axios";
import BookItem from "@/components/books/BookItem";
import { useAuthStore } from "@/store/authStore";

interface Book {
	id: number;
	title: string;
	author: string;
	coverImage: string;
}

export default function Home() {
	const [books, setBooks] = useState<Book[]>([]);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true); // 클라이언트에서만 실행
	}, []);

	// 클라이언트 마운트 후에만 useAuthStore 호출
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated) && isMounted;

	useEffect(() => {
		const fetchBooks = async () => {
			try {
				const response = await api.get("/books");
				setBooks(response.data);
			} catch (error) {
				console.error("책 목록 불러오기 실패:", error);
			}
		};

		fetchBooks();
	}, []);

	if (!isMounted) {
		return (
			<div>
				<section>
					<img src='/assets/main-banner.jpg' alt='메인 배너' />
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
				<img src='/assets/main-banner.jpg' alt='메인 배너' />
				<h1>추천 도서</h1>
				{isAuthenticated ? <p>환영합니다!</p> : <p>로그인 후 더 많은 기능을 이용하세요.</p>}
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
