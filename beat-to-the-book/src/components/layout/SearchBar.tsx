// src/components/layout/SearchBar.tsx

"use client";
import { debounce } from "@/lib/utils/debounce";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getSearchSuggestions } from "@/lib/api/search";

export default function SearchBar() {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState<string[]>([]);
	const [isOpen, setIsOpen] = useState(false);

	// 2. API 호출
	const fetchSuggestions = async (q: string) => {
		const list = await getSearchSuggestions(q);
		setSuggestions(list);
	};

	// 3. Debounced 함수 생성
	const debouncedFetch = useRef(debounce(fetchSuggestions, 300)).current;

	// 4. query 변경 시 디바운스된 API 호출
	useEffect(() => {
		debouncedFetch(query);
	}, [query, debouncedFetch]);

	// TODO: 쿼리 수정 필요
	// 5. 검색 실행
	const handleSearch = (q: string) => {
		const trimmed = q.trim();
		if (!trimmed) return;
		router.push(`/search?query=${encodeURIComponent(trimmed)}`);
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
					if (e.key === "Enter") {
						handleSearch(query);
					}
				}}
				onBlur={() => setTimeout(() => setIsOpen(false), 100)}
				className='w-full px-3 py-2 rounded-md border focus:outline-none focus:ring'
				placeholder='검색어를 입력하세요'
			/>

			{isOpen && suggestions.length > 0 && (
				<ul className='absolute z-20 w-full bg-white border rounded-md mt-1 max-h-60 overflow-auto shadow'>
					{suggestions.map((s, i) => (
						<li
							key={i}
							onMouseDown={() => {
								// 추천어 클릭 시 바로 검색
								handleSearch(s);
							}}
							className='px-3 py-2 hover:bg-gray-100 cursor-pointer'
						>
							{s}
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
