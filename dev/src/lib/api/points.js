import { privateApi } from "./axios";

export const pointsAPI = {
	// 총 포인트 조회
	getMyPoints: () => privateApi.get("/points/me"),

	// 내 책 목록 조회 (던진 여부 포함)
	getMyBooks: () => privateApi.get("/points/my-books"),

	// 미니게임 성공 시 포인트 획득
	throwBook: (data) => privateApi.post("/points/throw", data),
};
