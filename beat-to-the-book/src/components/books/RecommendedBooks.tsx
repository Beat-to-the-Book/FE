"use client";

import { useEffect, useState } from "react";
import { fetchRecommendBooks } from "@/lib/api/book";
import { RecommendedBook } from "@/lib/types/book";
import RecommendedBookItem from "./RecommendedBookItem";

type RecommendedBooksProps = {
	className?: string;
};

export default function RecommendedBooks({ className = "" }: RecommendedBooksProps) {
	const [books, setBooks] = useState<RecommendedBook[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const fetchedBooks = await fetchRecommendBooks();
				setBooks(fetchedBooks);
			} catch {
				setBooks([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <div>Loading...</div>;

	return (
		<section className={`flex flex-wrap gap-6 ${className}`}>
			{books.length > 0 ? (
				books.map((b) => (
					<RecommendedBookItem
						key={b.bookId}
						book={{
							bookId: b.bookId,
							title: b.title,
							author: b.author,
							coverImageUrl: b.coverImageUrl,
						}}
					/>
				))
			) : (
				<p className='text-gray'>추천 도서가 없습니다.</p>
			)}
		</section>
	);
}
