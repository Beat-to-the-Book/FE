// src/lib/api/book.ts
import axios from "./axios";
import { Book, RecommendedBook } from "@/lib/types/book";

export const fetchBooks = async (): Promise<Book[]> => {
	const response = await axios.get("/book");
	return response.data;
};

export const fetchRecommendBooks = async (
	behaviors: unknown[] | null = null
): Promise<RecommendedBook[]> => {
	try {
		const response = await axios.post("/recommend", { userBehaviors: behaviors });
		return response.data;
	} catch (error: any) {
		if (error.response?.status === 202) {
			const retry = await axios.post("/recommend", { userBehaviors: behaviors });
			return retry.data;
		}
		throw error;
	}
};

export const fetchBookById = async (id: number): Promise<Book> => {
	const response = await axios.get(`/book/${id}`);
	return response.data;
};

// TODO: /recommend의 request 제거와 /behavior 추가
