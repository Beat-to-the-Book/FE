import { privateApi } from "./axios";

export const rentalAPI = {
	add: (data) => privateApi.post("/rental", data),
	getActive: () => privateApi.get("/rental/active"),
	getHistory: () => privateApi.get("/rental/history"),
	return: (rentalId) => privateApi.post("/rental/return", { rentalId }),
};
