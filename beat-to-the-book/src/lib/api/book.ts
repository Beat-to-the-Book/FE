// src/lib/api/book.ts
import axios from "./axios";
import { Book, RecommendedBook } from "@/lib/types/book";
import { createAuthHeaders, handleApiError } from "./utils";

export const fetchBooks = async (): Promise<Book[]> => {
	try {
		const response = await axios.get("/book");
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const fetchRecommendBooks = async (token?: string): Promise<RecommendedBook[]> => {
	try {
		const response = await axios.get("/recommend", { headers: createAuthHeaders(token) });
		return response.data;
	} catch (error) {
		// 202: 추천 도서가 없음 재요청
		if (error.response?.status === 202) {
			const response = await axios.get("/recommend", { headers: createAuthHeaders(token) });
			return response.data;
		}
		handleApiError(error);
		throw error;
	}
};

export const fetchBookById = async (id: number): Promise<Book> => {
	try {
		const response = await axios.get(`/book/${id}`);
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

// TODO: 사용자 로그 데이터 전송
