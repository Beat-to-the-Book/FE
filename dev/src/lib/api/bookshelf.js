import { privateApi } from "./axios";

/**
 * 책장 API
 * 사용자의 책장 장식품 배치 정보를 관리합니다.
 */
export const bookshelfAPI = {
	/**
	 * 책장 데이터 조회
	 * @returns {Promise} 책장 장식품 데이터
	 */
	getBookshelfData: () => privateApi.get("/bookshelf"),

	/**
	 * 장식품 보유 개수 조회
	 */
	getDecorationCounts: () => privateApi.get("/decoration/my-counts"),

	/**
	 * 장식품 구매
	 */
	buyDecoration: (decorationType) => privateApi.post("/decoration/buy", { decorationType }),

	/**
	 * 책장 데이터 저장
	 * @param {Object} data - 책장 장식품 데이터
	 * @returns {Promise} 저장 결과
	 */
	saveBookshelfData: (data) => privateApi.post("/bookshelf", data),

	/**
	 * 책장 데이터 업데이트
	 * @param {Object} data - 업데이트할 책장 장식품 데이터
	 * @returns {Promise} 업데이트 결과
	 */
	updateBookshelfData: (data) => privateApi.put("/bookshelf", data),
};
