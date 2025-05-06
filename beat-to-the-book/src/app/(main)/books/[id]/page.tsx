// src/app/(main)/books/[id]/page.tsx
import Link from "next/link";
import { fetchBookById } from "@/lib/api/book";
import { Book } from "@/lib/types/book";
import RecommendedBooks from "@/components/books/RecommendedBooks";
import { cookies } from "next/headers";
import AddToCartButton from "@/components/books/AddToCartButton";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
	const bookId = parseInt(params.id, 10);

	let book: Book;
	try {
		book = await fetchBookById(bookId);
	} catch {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-lg font-semibold'>책을 찾을 수 없습니다.</p>
				<Link href='/' className='ml-4 text-forestGreen hover:underline'>
					홈으로 돌아가기
				</Link>
			</div>
		);
	}

	const authCookie = (await cookies()).get("auth-storage")?.value;
	let token: string | null = null;
	let isAuthenticated = false;
	if (authCookie) {
		const { state } = JSON.parse(authCookie);
		token = state.token as string | null;
		isAuthenticated = state.isAuthenticated as boolean;
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
					{/* 3) 로그인 상태라면 장바구니/대여/구매/찜 버튼 활성화 */}
					{isAuthenticated ? (
						<>
							<AddToCartButton book={book} />
							<button className='bg-springGreen text-stateBlue px-4 py-2 rounded-md hover:bg-forestGreen hover:text-white'>
								대여하기
							</button>
							<button className='bg-stateBlue text-white px-4 py-2 rounded-md hover:bg-everGreen'>
								구매하기
							</button>
							<button className='bg-gray text-stateBlue px-4 py-2 rounded-md hover:bg-lightGray'>
								찜하기
							</button>
						</>
					) : (
						<Link
							href='/auth/signin'
							className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'
						>
							로그인 후 이용
						</Link>
					)}
				</section>

				<section>
					<h2 className='text-2xl font-semibold text-stateBlue mb-2'>소개</h2>
					<p className='text-gray-700 leading-relaxed'>{book.intro}</p>
				</section>

				<section className='mt-8'>
					<h2 className='text-2xl font-semibold text-stateBlue mb-4'>추천 도서</h2>
					{/* 4) RecommendedBooks 내부에서 useAuthStore로 토큰 관리하므로, token prop 제거 */}
					<RecommendedBooks className='flex-col items-start' />
				</section>
			</div>
		</div>
	);
}
