// src/components/layout/SearchBar.tsx
"use client";

import { debounce } from "@/lib/utils/debounce";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSearchSuggestions, BookSuggestion } from "@/lib/api/search";

export default function SearchBar() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<BookSuggestion[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	const fetchSuggestions = async (q: string) => {
		const list = await getSearchSuggestions(q);
		setSuggestions(list);
	};
	const debouncedFetch = useRef(debounce(fetchSuggestions, 300)).current;

	useEffect(() => {
		debouncedFetch(query);
	}, [query, debouncedFetch]);

	const handleSearch = (q: string) => {
		const trimmed = q.trim();
		if (!trimmed) return;
		router.push(`/search?keyword=${encodeURIComponent(trimmed)}`);
		setIsOpen(false);
	};

	return (
		<div className='relative w-64'>
			<input
				type='text'
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setIsOpen(true);
				}}
				onKeyDown={(e) => {
					if (e.key === "Enter") handleSearch(query);
				}}
				onBlur={() => setTimeout(() => setIsOpen(false), 100)}
				className='w-full px-3 py-2 rounded-md border focus:outline-none focus:ring'
				placeholder='검색어를 입력하세요'
			/>

			{isOpen && suggestions.length > 0 && (
				<ul className='absolute z-20 w-full bg-white border rounded-md mt-1 max-h-60 overflow-auto shadow'>
					{suggestions.slice(0, 3).map((book) => (
						<li
							key={book.id}
							onMouseDown={() => {
								router.push(`/books/${book.id}`);
								setIsOpen(false);
							}}
							className='flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer'
						>
							<img
								src={book.frontCoverImageUrl}
								alt={book.title}
								className='w-10 h-14 object-cover rounded'
							/>
							<div>
								<div className='font-medium'>{book.title}</div>
								<div className='text-xs text-gray-500'>{book.author}</div>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
