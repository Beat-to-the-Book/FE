// src/app/(main)/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { fetchBooks, fetchRecommendBooks } from "@/lib/api/book";
import { Book } from "@/lib/types/book";
import BookItem from "@/components/books/BookItem";

export default function Home() {
	const { token, isAuthenticated } = useAuthStore();
	const [books, setBooks] = useState<Book[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				let fetchedBooks: Book[] = await fetchBooks();
				if (isAuthenticated) {
					const recommendBooks = await fetchRecommendBooks(token);
					if (recommendBooks.length > 0) {
						fetchedBooks = recommendBooks;
					}
				}
				setBooks(fetchedBooks);
			} catch (error) {
				console.error("책 목록 불러오기 실패:", error);
				setBooks([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [isAuthenticated, token]);

	if (loading) {
		return <div className='min-h-screen p-6'>로딩 중...</div>;
	}

	return (
		<div className='min-h-screen p-6'>
			<section className='text-center'>
				<h1 className='text-3xl font-bold text-stateBlue mb-4'>추천 도서</h1>
			</section>
			<section className='flex flex-wrap justify-center gap-6 mt-6'>
				{books.length > 0 ? (
					books.map((book) => <BookItem key={book.id} book={book} />)
				) : (
					<p className='text-gray'>책이 없습니다.</p>
				)}
			</section>
		</div>
	);
}
