import { publicApi, privateApi } from "./axios";

export const bookAPI = {
	getAll: () => publicApi.get("/book"),
	getById: (id) => publicApi.get(`/book/${id}`),
	search: (keyword) => publicApi.get(`/book/search?keyword=${keyword}`),
};
