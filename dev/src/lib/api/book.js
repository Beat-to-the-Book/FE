import api from "./axios";

export const bookAPI = {
	search: (keyword) => api.get(`/book/search?keyword=${keyword}`),

	getAll: () => api.get("/book"),

	getById: (bookId) => api.get(`/book/${bookId}`),
};
