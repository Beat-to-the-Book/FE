"use client";
import { useEffect, useState } from "react";
import api from "@/lib/api/axios";
import BookItem from "@/components/books/BookItem";

interface Book {
	id: number;
	title: string;
	author: string;
	coverImage: string;
}

export default function Home() {
	const [books, setBooks] = useState<Book[]>([]);

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

	return (
		<div>
			<section>
				<img src='/assets/main-banner.jpg' alt='메인 배너' />
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
