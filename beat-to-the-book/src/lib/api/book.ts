// src/lib/api/book.ts
import { UserBehavior } from "@/store/behaviorStore";
import axios from "./axios";
import { Book, RecommendedBook } from "@/lib/types/book";

export const fetchBooks = async (): Promise<Book[]> => {
	const response = await axios.get("/book");
	return response.data;
};

export const fetchRecommendBooks = async (): Promise<RecommendedBook[]> => {
	try {
		const response = await axios.post("/recommend");
		return response.data;
	} catch (error: any) {
		if (error.response && error.response.status === 400) {
			console.error("추천 도서 조회 실패: 잘못된 요청 형식", error);
			return [];
		}
		if (error.response && error.response.status === 500) {
			console.error("추천 도서 조회 실패: 서버 오류", error);
			return [];
		}
		console.error("추천 도서 조회 실패:", error);
		throw error;
	}
};

export const logBookBehavior = async (behavior: UserBehavior[]): Promise<void> => {
	try {
		await axios.post("/behavior/log", { behavior });
	} catch (error) {
		console.error("책 행동 데이터 로깅 실패:", error);
		throw error;
	}
};

export const fetchBookById = async (id: number): Promise<Book> => {
	const response = await axios.get(`/book/${id}`);
	return response.data;
};
