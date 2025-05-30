import { privateApi } from "./axios";

export const purchaseAPI = {
	add: (data) => privateApi.post("/purchase/add", data),

	getHistory: () => privateApi.get("/purchase/history"),
};

export const rentalAPI = {
	add: (data) => privateApi.post("/rental/add", data),

	getHistory: () => privateApi.get("/rental/history"),
};
