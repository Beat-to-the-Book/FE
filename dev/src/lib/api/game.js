import { privateApi } from "./axios";

export const gameAPI = {
	getPurchaseHistory: () => privateApi.get("/purchase/history"),
	getRentalHistory: () => privateApi.get("/rental/history"),
};
