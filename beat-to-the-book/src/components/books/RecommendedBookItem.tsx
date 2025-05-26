"use client";

import React from "react";
import Image from "next/image";
import { RecommendedBook } from "@/lib/types/book";

export default function RecommendedBookItem({ book }: { book: RecommendedBook }) {
	return (
		<article className='w-[150px] ml-auto bg-white rounded-2xl shadow-soft p-2 grid gap-2'>
			<div className='relative h-64 w-full rounded-lg overflow-hidden'>
				<Image
					src={book.coverImageUrl ?? "/default-cover.png"}
					alt={`Cover of ${book.title}`}
					fill
					className='object-cover'
				/>
			</div>
			<div className='mt-2'>
				<h3 className='text-base font-semibold leading-snug truncate' title={book.title}>
					{book.title}
				</h3>
				<p className='text-sm text-muted-foreground truncate' title={book.author}>
					{book.author}
				</p>
			</div>
		</article>
	);
}
