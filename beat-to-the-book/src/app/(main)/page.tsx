// src/app/(main)/page.tsx
import { cookies } from "next/headers";

import { fetchBooks, fetchRecommendBooks } from "@/lib/api/book";
import { extractUserIdFromCookie } from "@/lib/api/auth";

import { Book } from "@/lib/types/book";

import BookItem from "@/components/books/BookItem";

export default async function Home() {
	const cookieStore = await cookies();
	const authData = cookieStore.get("auth-storage")?.value;
	const userId = extractUserIdFromCookie(authData);

	let books: Book[] = [];
	try {
		books = await fetchBooks();
	} catch (error) {
		console.error("책 목록 불러오기 실패:", error);
		books = [];
	}

	let recommendBooks: Book[] = [];
	if (userId) {
		try {
			recommendBooks = await fetchRecommendBooks(userId);
			if (recommendBooks.length > 0) {
				books = recommendBooks;
			}
		} catch (error) {
			console.error("추천 도서 목록 불러오기 실패:", error);
			recommendBooks = [];
		}
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
