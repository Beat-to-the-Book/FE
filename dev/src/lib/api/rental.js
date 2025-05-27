import { privateApi } from "./axios";

export const rentalAPI = {
	add: (data) => privateApi.post("/rental/add", data),
	getHistory: () => privateApi.get("/rental/history"),
};
