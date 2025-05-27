// src/app/search/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getSearchSuggestions, BookSuggestion } from "@/lib/api/search";

export default function SearchResultsPage() {
	const params = useSearchParams();
	const keyword = params.get("keyword")?.trim() ?? "";

	const [books, setBooks] = useState<BookSuggestion[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string>("");

	useEffect(() => {
		if (!keyword) return;
		setLoading(true);
		getSearchSuggestions(keyword)
			.then((data) => {
				setBooks(data);
				setError("");
			})
			.catch((e: Error) => {
				setBooks([]);
				setError(e.message);
			})
			.finally(() => setLoading(false));
	}, [keyword]);

	if (!keyword) {
		return <div className='p-6 text-gray-500'>검색어를 입력한 후 Enter 키를 눌러주세요.</div>;
	}

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold mb-4'>&quot;{keyword}&quot; 검색 결과</h1>

			{loading && <p className='text-gray-500'>로딩 중...</p>}
			{error && <p className='text-red-500 mb-4'>{error}</p>}

			{!loading && !error && books.length === 0 && (
				<p className='text-gray-500'>검색 결과가 없습니다.</p>
			)}

			{!loading && books.length > 0 && (
				<ul className='grid grid-cols-1 gap-4'>
					{books.map((book) => (
						<li key={book.id} className='flex items-center gap-4 p-4 border rounded hover:shadow'>
							<Link href={`/books/${book.id}`}>
								<img
									src={book.frontCoverImageUrl}
									alt={book.title}
									className='w-16 h-24 object-cover rounded cursor-pointer'
								/>
							</Link>
							<div>
								<Link href={`/books/${book.id}`}>
									<a className='text-lg font-medium hover:underline'>{book.title}</a>
								</Link>
								<p className='text-sm text-gray-500'>{book.author}</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
