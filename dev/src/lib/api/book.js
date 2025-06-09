import { publicApi, privateApi } from "./axios";

export const bookAPI = {
	getAll: () => publicApi.get("/books"),
	getById: (id) => publicApi.get(`/books/${id}`),
	search: (keyword) => publicApi.get(`/books/search?keyword=${keyword}`),
	getMyBookReports: () => privateApi.get("/books/reports/my"),
	getMyPurchasedBooks: () => privateApi.get("/books/purchased/my"),
	getMyRentedBooks: () => privateApi.get("/books/rented/my"),
};
