// src/lib/api/search.ts

import api from "@/lib/api/axios";

export async function getSearchSuggestions(q: string): Promise<string[]> {
	if (!q) return [];
	try {
		const res = await api.get<{ suggestions: string[] }>("/search-suggestions", {
			params: { q },
		});
		return res.data.suggestions;
	} catch (error) {
		console.error("추천어 조회 실패:", error);
		return [];
	}
}
