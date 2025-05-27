import api from "./axios";

export const purchaseAPI = {
	add: (data) => api.post("/purchase/add", data),

	getHistory: () => api.get("/purchase/history"),
};

export const rentalAPI = {
	add: (data) => api.post("/rental/add", data),

	getHistory: () => api.get("/rental/history"),
};
