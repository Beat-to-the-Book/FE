// src/lib/api/transaction.ts
import api from "./axios";

/**
 * 도서 구매 추가
 */
export async function addPurchase(userId: string, bookId: number): Promise<void> {
	await api.post("/purchase/add", { userId, bookId });
}

// 도서 구매 내역 조회
export async function getPurchaseHistory(
	userId: string
): Promise<{ userId: string; bookId: number }[]> {
	const response = await api.get("/purchase/history", { params: { userId } });
	return response.data;
}

/**
 * 도서 대여 추가
 */
export async function addRental(userId: string, bookId: number): Promise<void> {
	await api.post("/rental/add", { userId, bookId });
}

// 도서 대여 내역 조회
export async function getRentalHistory(
	userId: string
): Promise<{ userId: string; bookId: number }[]> {
	const response = await api.get("/rental/history", { params: { userId } });
	return response.data;
}
