// src/lib/api/search.ts
import api from "@/lib/api/axios";

export interface BookSuggestion {
	id: number;
	title: string;
	author: string;
	genre: string;
	price: number;
	publisher: string;
	publishedDate: string;
	frontCoverImageUrl?: string;
	leftCoverImageUrl?: string;
	backCoverImageUrl?: string;
}

export async function getSearchSuggestions(keyword: string): Promise<BookSuggestion[]> {
	if (!keyword) return [];
	try {
		const res = await api.get<BookSuggestion[]>("/search", {
			params: { keyword },
		});
		return res.data;
	} catch (error) {
		console.error("추천어 조회 실패:", error);
		return [];
	}
}
