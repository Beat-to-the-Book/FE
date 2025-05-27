import { publicApi, privateApi } from "./axios";

export const bookAPI = {
	getAll: () => publicApi.get("/book"),
	search: (keyword) => publicApi.get(`/book/search?keyword=${keyword}`),
	getById: (bookId) => publicApi.get(`/book/${bookId}`),
};
