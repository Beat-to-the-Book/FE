// src/lib/api/game.ts
import api from "@/lib/api/axios";

export interface BookHistoryItem {
	id: number;
	title: string;
	author: string;
	genre: string;
	price: number;
	publisher: string;
	publishDate: string;
	leftCoverImageUrl: string;
	frontCoverImageUrl: string;
	backCoverImageUrl: string;
}

export const getPurchaseHistory = () =>
	api.get<BookHistoryItem[]>("/purchase/history").then((res) => res.data);

export const getRentalHistory = () =>
	api.get<BookHistoryItem[]>("/rental/history").then((res) => res.data);
