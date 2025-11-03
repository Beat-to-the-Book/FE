import { privateApi } from "./axios";

export const purchaseAPI = {
	add: (data) => privateApi.post("/purchase/add", data),
	checkout: (data) => privateApi.post("/purchase/checkout", data),
	confirm: (orderId) => privateApi.post(`/purchase/confirm?orderId=${orderId}`),
	getHistory: () => privateApi.get("/purchase/history"),
	refund: (data) => privateApi.post("/purchase/refund", data),
};
