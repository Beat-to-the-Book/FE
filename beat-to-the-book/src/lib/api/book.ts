// src/lib/api/book.ts
import axios from "./axios";
import { Book, RecommendedBook } from "@/lib/types/book";
import { createAuthHeaders, handleApiError } from "./utils";
import { UserBehavior } from "@/store/behaviorStore";

export const fetchBooks = async (): Promise<Book[]> => {
	try {
		const response = await axios.get("/book");
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

/**
 * 추천 도서 조회 (행동 로그 포함)
 * @param token 인증 토큰
 * @param behaviors 사용자 행동 로그 배열 (없으면 null)
 */
export const fetchRecommendBooks = async (
	token?: string,
	behaviors: UserBehavior[] | null = null
): Promise<RecommendedBook[]> => {
	try {
		const response = await axios.post(
			"/recommend",
			{ userBehaviors: behaviors },
			{ headers: createAuthHeaders(token) }
		);
		return response.data;
	} catch (error: any) {
		if (error.response?.status === 202) {
			// 추천 도서 없음, 재요청
			const retry = await axios.post(
				"/recommend",
				{ userBehaviors: behaviors },
				{ headers: createAuthHeaders(token) }
			);
			return retry.data;
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
