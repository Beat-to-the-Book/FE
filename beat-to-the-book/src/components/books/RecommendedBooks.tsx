// src/components/books/RecommendedBooks.tsx
"use client";
import { useEffect, useState } from "react";
import { fetchRecommendBooks } from "@/lib/api/book";
import { RecommendedBook } from "@/lib/types/book";
import { useAuthStore } from "@/store/authStore";
import BookItem from "./BookItem";

type RecommendedBooksProps = {
	className?: string;
};

export default function RecommendedBooks({ className = "" }: RecommendedBooksProps) {
	const { token } = useAuthStore();
	const [books, setBooks] = useState<RecommendedBook[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const fetchedBooks = await fetchRecommendBooks(token);
				setBooks(fetchedBooks);
			} catch (error) {
				setBooks([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [token]);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<section className={`flex flex-wrap gap-6 ${className}`}>
			{books.length > 0 ? (
				books.map((book) => (
					<BookItem
						key={book.bookId}
						book={{ bookId: book.bookId, title: book.title, coverImage: book.coverImage }}
					/>
				))
			) : (
				<p className='text-gray'>추천 도서가 없습니다.</p>
			)}
		</section>
	);
}
