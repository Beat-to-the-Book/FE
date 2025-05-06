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
			} catch {
				setBooks([]);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [token]);

	if (loading) return <div>Loading...</div>;

	return (
		<section className={`flex flex-wrap gap-6 ${className}`}>
			{books.length > 0 ? (
				books.map((b) => (
					<BookItem
						/* BookItem이 요구하는 속성(id 등)에 맞춰 변환 */
						key={b.bookId}
						book={{
							id: b.bookId,
							title: b.title,
							coverImage: b.coverImage,
							author: b.author ?? "", // API에도 author가 있으면 그대로, 없으면 빈 문자열
						}}
					/>
				))
			) : (
				<p className='text-gray'>추천 도서가 없습니다.</p>
			)}
		</section>
	);
}
