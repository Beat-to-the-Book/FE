// src/app/(main)/books/[id]/page.tsx
import Link from "next/link";
import { fetchBookById } from "@/lib/api/book";
import { Book } from "@/lib/types/book"; // 새 파일에서 임포트

export default async function BookDetailPage({ params }: { params: { id: string } }) {
	const bookId = parseInt(params.id, 10);
	let book: Book;

	try {
		book = await fetchBookById(bookId);
	} catch (error) {
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
				<h1 className='text-3xl font-bold text-stateBlue mb-4'>{book.title}</h1>
				{book.coverImage && (
					<img
						src={book.coverImage}
						alt={`${book.title} 표지`}
						className='w-full max-w-xs mx-auto rounded-md mb-6'
					/>
				)}
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
						<strong className='text-everGreen'>출판 연도:</strong> {book.publishYear}
					</p>
				</section>
				<section className='flex gap-4 mb-6'>
					<button className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'>
						장바구니에 담기
					</button>
					<button className='bg-springGreen text-stateBlue px-4 py-2 rounded-md hover:bg-forestGreen hover:text-white'>
						대여하기
					</button>
					<button className='bg-stateBlue text-white px-4 py-2 rounded-md hover:bg-everGreen'>
						구매하기
					</button>
					<button className='bg-gray text-stateBlue px-4 py-2 rounded-md hover:bg-lightGray'>
						찜하기
					</button>
				</section>
				<section>
					<h2 className='text-2xl font-semibold text-stateBlue mb-2'>소개</h2>
					<p className='text-gray-700 leading-relaxed'>{book.intro}</p>
				</section>
			</div>
		</div>
	);
}
