import { privateApi } from "./axios";

// 독서 기록 API
export const readingAPI = {
	// 독서 기록 추가
	// 프론트: {bookId, startDate, endDate, memo}
	// 백엔드: {id, bookId, bookTitle, author, frontCoverImageUrl, startDate, endDate, memo}
	add: (data) =>
		privateApi.post("/reading/add", {
			bookId: data.bookId,
			startDate: data.startDate,
			endDate: data.endDate,
			memo: data.memo,
		}),

	// 독서 기록 수정
	update: (readingId, data) =>
		privateApi.put(`/reading/${readingId}`, {
			startDate: data.startDate,
			endDate: data.endDate,
			memo: data.memo,
		}),

	// 독서 기록 삭제
	delete: (readingId) => privateApi.delete(`/reading/${readingId}`),

	// 내 독서 기록 전체 조회
	getMyReadings: () => privateApi.get("/reading/my"),

	// 특정 책의 독서 기록 조회
	getBookReadings: (bookId) => privateApi.get(`/reading/book/${bookId}`),

	// 특정 기간의 독서 기록 조회
	getReadingsByDateRange: (startDate, endDate) =>
		privateApi.get("/reading/range", {
			params: {
				startDate,
				endDate,
			},
		}),
};
