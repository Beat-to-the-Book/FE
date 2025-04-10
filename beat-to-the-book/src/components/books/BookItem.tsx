// src/components/books/BookItem.tsx
import Link from "next/link";
import { Book } from "@/lib/api/mockBooks";

export default function BookItem({ book }: { book: Book }) {
	return (
		<Link href={`/books/${book.id}`} className='block'>
			<div className='bg-white shadow-md rounded-lg overflow-hidden w-64 hover:shadow-lg transition-shadow'>
				<div className='h-80'>
					<img src={book.coverImage} alt={book.title} className='w-full h-full object-contain' />
				</div>
				<div className='p-4'>
					<h2 className='text-lg font-semibold text-stateBlue truncate'>{book.title}</h2>
					<p className='text-gray'>{book.author}</p>
				</div>
			</div>
		</Link>
	);
}
