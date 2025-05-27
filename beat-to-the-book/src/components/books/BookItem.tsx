// src/components/books/BookItem.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Book } from "@/lib/types/book";

export default function BookItem({ book }: { book: Book }) {
	const hasImage = Boolean(book.frontCoverImageUrl);

	return (
		<Link href={`/books/${book.id}`} className='block'>
			<div className='bg-white shadow-md rounded-lg overflow-hidden w-64 hover:shadow-lg transition-shadow'>
				{/* 이미지 또는 흰색 배경 */}
				<div className='relative w-full h-80 bg-white'>
					{hasImage ? (
						<Image
							src={book.frontCoverImageUrl!}
							alt={book.title}
							fill
							sizes='256px'
							className='object-cover'
						/>
					) : (
						// 이미지가 없을 때는 흰색 배경 채우기
						<div className='w-full h-full bg-white' />
					)}
				</div>

				<div className='p-4'>
					<h2 className='text-lg font-semibold text-stateBlue truncate'>{book.title}</h2>
					<p className='text-gray'>{book.author}</p>
				</div>
			</div>
		</Link>
	);
}
