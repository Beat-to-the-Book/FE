// src/components/books/BookItem.tsx
import Link from "next/link";

interface Book {
	id: number;
	title: string;
	author: string;
	coverImage: string;
}

export default function BookItem({ book }: { book: Book }) {
	return (
		<Link href={`/books/${book.id}`}>
			<div>
				<img src={book.coverImage} alt={book.title} />
				<div>
					<h2>{book.title}</h2>
					<p>{book.author}</p>
				</div>
			</div>
		</Link>
	);
}
