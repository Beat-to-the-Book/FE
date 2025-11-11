import { privateApi } from "./axios";

export const purchaseAPI = {
	checkout: (data) => privateApi.post("/purchase/checkout", data),
	confirm: (orderId) => privateApi.post("/purchase/confirm", null, { params: { orderId } }),
	getHistory: () => privateApi.get("/purchase/history"),
	refund: (data) => privateApi.post("/purchase/refund", data),
};
