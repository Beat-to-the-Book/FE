// src/app/(main)/books/[id]/page.tsx

import Link from "next/link";
import { fetchBookById, fetchBooks } from "@/lib/api/book";
import RecommendedBooks from "@/components/books/RecommendedBooks";
import BookDetailClient from "@/components/books/BookDetailClient";
import BookActionSection from "@/components/books/BookActionSection";
import { Book } from "@/lib/types/book";

type Params = { id: string };

/* ──────────────── SEO 메타 ──────────────── */
export async function generateMetadata({ params }: { params: Params }) {
	const book = await fetchBookById(Number(params.id));
	return {
		title: `${book.title} | MyBookStore`,
		description: `${book.author}의 『${book.title}』 상세 정보 및 소개`,
		openGraph: { images: [{ url: book.frontCoverImageUrl }] },
	};
}

/* ──────────────── ISR(선택) ──────────────── */
export async function generateStaticParams() {
	const books = await fetchBooks(); // 책 수백 권 수준이면 충분히 빌드 가능
	return books.map((b: Book) => ({ id: String(b.id) }));
}
export const revalidate = 60 * 60; // 1시간마다 갱신

/* ──────────────── 페이지 컴포넌트 ──────────────── */
export default async function BookDetailPage({ params }: { params: Params }) {
	const bookId = Number(params.id);
	const book = await fetchBookById(bookId).catch(() => null);

	if (!book) {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-lg font-semibold'>책을 찾을 수 없습니다.</p>
				<Link href='/' className='ml-4 text-forestGreen hover:underline'>
					홈으로 돌아가기
				</Link>
			</div>
		);
	}

	return (
		<div className='min-h-screen p-6 bg-lightGray'>
			<div className='max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6'>
				{/* 책 제목 / 표지 */}
				<h1 className='text-3xl font-bold text-stateBlue mb-4'>{book.title}</h1>
				{book.frontCoverImageUrl && (
					<img
						src={book.frontCoverImageUrl}
						alt={`${book.title} 표지`}
						className='w-full max-w-xs mx-auto rounded-md mb-6'
					/>
				)}

				{/* 기본 정보 */}
				<section className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
					<p>
						<strong className='text-everGreen'>저자:</strong> {book.author}
					</p>
					<p>
						<strong className='text-everGreen'>장르:</strong> {book.genre}
					</p>
					<p>
						<strong className='text-everGreen'>가격:</strong> {book.price.toLocaleString()}원
					</p>
					<p>
						<strong className='text-everGreen'>출판사:</strong> {book.publisher}
					</p>
					<p>
						<strong className='text-everGreen'>출판 연도:</strong> {book.publishDate}
					</p>
				</section>

				{/* 로그인-의존 액션 버튼 */}
				<section className='flex gap-4 mb-6'>
					<BookActionSection book={book} />
				</section>

				{/* 책 소개 */}
				<section>
					<h2 className='text-2xl font-semibold text-stateBlue mb-2'>소개</h2>
					<p className='text-gray-700 leading-relaxed'>{book.intro}</p>
				</section>

				{/* 추천 도서 */}
				<section className='mt-8'>
					<h2 className='text-2xl font-semibold text-stateBlue mb-4'>추천 도서</h2>
					<RecommendedBooks className='flex-col items-start' />
				</section>
			</div>

			{/* 사용자 행동 로그 (클라이언트) */}
			<BookDetailClient bookId={bookId} />
		</div>
	);
}
