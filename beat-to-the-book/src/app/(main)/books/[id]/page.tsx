// src/app/(main)/books/[id]/page.tsx
import { mockBooks } from "@/lib/api/mockBooks";

export default async function BookDetailPage({ params }: { params: { id: string } }) {
	const bookId = parseInt(params.id, 10);
	const book = mockBooks.find((b) => b.id === bookId);

	if (!book) {
		return (
			<div>
				<p>책을 찾을 수 없습니다.</p>
			</div>
		);
	}

	return (
		<div>
			<h1>{book.title}</h1>
			{book.coverImage && (
				<img
					src={book.coverImage}
					alt={`${book.title} 표지`}
					style={{ maxWidth: "300px", height: "auto" }}
				/>
			)}
			<section>
				<p>
					<strong>저자:</strong> {book.author}
				</p>
				<p>
					<strong>장르:</strong> {book.genre}
				</p>
				<p>
					<strong>가격:</strong> {book.price.toLocaleString()}원
				</p>
				<p>
					<strong>출판사:</strong> {book.publisher}
				</p>
				<p>
					<strong>출판 연도:</strong> {book.publishYear}
				</p>
			</section>
			<section>
				<button>장바구니에 담기</button>
				<button>대여하기</button>
				<button>구매하기</button>
				<button>찜하기</button>
			</section>
			<section>
				<h2>소개</h2>
				<p>{book.intro}</p>
			</section>
		</div>
	);
}
