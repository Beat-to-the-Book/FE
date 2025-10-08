import { privateApi } from "./axios";

// ===== 더미 데이터 (개발용) =====
let dummyReadings = [
	{
		id: 1,
		bookId: 1,
		bookTitle: "클린 코드",
		author: "로버트 C. 마틴",
		frontCoverImageUrl: "https://via.placeholder.com/150x200?text=Clean+Code",
		startDate: "2024-03-01",
		endDate: "2024-03-15",
		memo: "코드 작성의 기본을 다시 한번 생각하게 된 책입니다.",
		createdAt: "2024-03-20T10:00:00",
	},
	{
		id: 2,
		bookId: 2,
		bookTitle: "리팩터링",
		author: "마틴 파울러",
		frontCoverImageUrl: "https://via.placeholder.com/150x200?text=Refactoring",
		startDate: "2024-03-10",
		endDate: "2024-03-25",
		memo: "레거시 코드를 개선하는 방법을 배웠습니다.",
		createdAt: "2024-03-26T10:00:00",
	},
];

let nextId = 3;

// 더미 데이터 함수들
const dummyAPI = {
	add: (data, bookInfo) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				const newReading = {
					id: nextId++,
					...data,
					// 실제로는 백엔드에서 book 정보를 조인해서 반환
					// 더미에서는 프론트에서 전달받은 책 정보 사용
					bookTitle: bookInfo?.title || "선택한 책",
					author: bookInfo?.author || "저자",
					frontCoverImageUrl: bookInfo?.frontCoverImageUrl || "https://via.placeholder.com/150x200",
					createdAt: new Date().toISOString(),
				};
				dummyReadings.push(newReading);
				resolve({ data: newReading });
			}, 500);
		});
	},

	update: (readingId, data) => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = dummyReadings.findIndex((r) => r.id === readingId);
				if (index !== -1) {
					dummyReadings[index] = {
						...dummyReadings[index],
						...data,
					};
					resolve({ data: dummyReadings[index] });
				} else {
					reject(new Error("독서 기록을 찾을 수 없습니다."));
				}
			}, 500);
		});
	},

	delete: (readingId) => {
		return new Promise((resolve, reject) => {
			setTimeout(() => {
				const index = dummyReadings.findIndex((r) => r.id === readingId);
				if (index !== -1) {
					dummyReadings.splice(index, 1);
					resolve({ data: { success: true } });
				} else {
					reject(new Error("독서 기록을 찾을 수 없습니다."));
				}
			}, 500);
		});
	},

	getMyReadings: () => {
		return new Promise((resolve) => {
			setTimeout(() => {
				resolve({ data: dummyReadings });
			}, 500);
		});
	},

	getBookReadings: (bookId) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				const readings = dummyReadings.filter((r) => r.bookId === bookId);
				resolve({ data: readings });
			}, 500);
		});
	},

	getReadingsByDateRange: (startDate, endDate) => {
		return new Promise((resolve) => {
			setTimeout(() => {
				const start = new Date(startDate);
				const end = new Date(endDate);
				const readings = dummyReadings.filter((r) => {
					const rStart = new Date(r.startDate);
					const rEnd = new Date(r.endDate);
					return rStart <= end && rEnd >= start;
				});
				resolve({ data: readings });
			}, 500);
		});
	},
};

// 독서 기록 API
export const readingAPI = {
	// ===== 실제 API 사용 시 아래 주석을 해제하고 더미 API 부분을 삭제하세요 =====

	// 독서 기록 추가
	add: (data, bookInfo) => dummyAPI.add(data, bookInfo), // 더미: bookInfo 추가 전달
	// add: (data) =>
	// 	privateApi.post("/reading/add", {
	// 		bookId: data.bookId,
	// 		startDate: data.startDate,
	// 		endDate: data.endDate,
	// 		memo: data.memo,
	// 	}),

	// 독서 기록 수정
	update: (readingId, data) => dummyAPI.update(readingId, data),
	// update: (readingId, data) =>
	// 	privateApi.put(`/reading/${readingId}`, {
	// 		startDate: data.startDate,
	// 		endDate: data.endDate,
	// 		memo: data.memo,
	// 	}),

	// 독서 기록 삭제
	delete: (readingId) => dummyAPI.delete(readingId),
	// delete: (readingId) => privateApi.delete(`/reading/${readingId}`),

	// 내 독서 기록 전체 조회
	getMyReadings: () => dummyAPI.getMyReadings(),
	// getMyReadings: () => privateApi.get("/reading/my"),

	// 특정 책의 독서 기록 조회
	getBookReadings: (bookId) => dummyAPI.getBookReadings(bookId),
	// getBookReadings: (bookId) => privateApi.get(`/reading/book/${bookId}`),

	// 특정 기간의 독서 기록 조회
	getReadingsByDateRange: (startDate, endDate) =>
		dummyAPI.getReadingsByDateRange(startDate, endDate),
	// getReadingsByDateRange: (startDate, endDate) =>
	// 	privateApi.get("/reading/range", {
	// 		params: {
	// 			startDate,
	// 			endDate,
	// 		},
	// 	}),
};
