import { privateApi, publicApi } from "./axios";

export const reportAPI = {
	// 본인 독후감 작성
	create: (data) => privateApi.post("/reports/me", data),

	// 본인 독후감 전체 조회
	getMyReports: () => privateApi.get("/reports/me"),

	// 본인 독후감 단건 조회
	getMyReport: (id) => privateApi.get(`/reports/me/${id}`),

	// 본인 독후감 수정
	updateMyReport: (id, data) => privateApi.put(`/reports/me/${id}`, data),

	// 본인 독후감 삭제
	deleteMyReport: (id) => privateApi.delete(`/reports/me/${id}`),

	// 특정 책의 공개된 독후감 조회
	getBookReports: (bookId) => publicApi.get(`/reports/book/${bookId}`),

	// 전체 공개 독후감 목록 조회
	getPublicReports: () => publicApi.get("/reports/public"),

	// 공개된 단건 독후감 조회
	getPublicReport: (id) => publicApi.get(`/reports/public/${id}`),
};
