import { privateApi, publicApi } from "./axios";

export const reviewAPI = {
	// 특정 책의 리뷰 조회
	getBookReviews: (bookId) => publicApi.get(`/reviews/book/${bookId}`),

	// 리뷰 작성
	create: (data) => privateApi.post("/reviews", data),

	// 리뷰 수정
	update: (reviewId, data) => privateApi.put(`/reviews/${reviewId}`, data),

	// 리뷰 삭제
	delete: (reviewId) => privateApi.delete(`/reviews/${reviewId}`),
};
