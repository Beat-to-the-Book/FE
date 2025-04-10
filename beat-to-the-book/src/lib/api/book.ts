// src/lib/api/book.ts
import axios from "./axios";
import { Book } from "@/lib/types/book";

export const fetchBooks = async (): Promise<Book[]> => {
	try {
		const response = await axios.get("/book");
		return response.data;
	} catch (error) {
		console.error("책 목록 불러오기 실패:", error);
		throw error;
	}
};

export const fetchRecommendBooks = async (userId?: string): Promise<Book[]> => {
	try {
		const endpoint = userId ? `/recommend?userId=${userId}` : "/book";
		const response = await axios.get(endpoint);
		return response.data;
	} catch (error) {
		console.error("책 목록 불러오기 실패:", error);
		throw error;
	}
};

// TODO: 책 상세 페이지에서 사용, 책 ID로 책 정보를 가져오는 함수
export const fetchBookById = async (id: number): Promise<Book> => {
	try {
		const response = await axios.get(`/book/${id}`);
		return response.data;
	} catch (error) {
		console.error(`책 ID ${id} 불러오기 실패:`, error);
		throw error;
	}
};
