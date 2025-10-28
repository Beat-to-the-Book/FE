import { create } from "zustand";
import { bookshelfAPI } from "../api/bookshelf";

/**
 * 책장 상태 관리 Store
 * 장식품 배치 정보를 관리하고 백엔드와 동기화합니다.
 */
const useBookshelfStore = create((set, get) => ({
	// 층별 장식품 데이터
	decorsByFloor: {
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
		7: [],
	},

	// 로딩 상태
	isLoading: false,

	// 에러 상태
	error: null,

	// 마지막 저장 시간
	lastSaved: null,

	/**
	 * 책장 데이터 로드
	 */
	loadBookshelfData: async () => {
		set({ isLoading: true, error: null });
		try {
			const response = await bookshelfAPI.getBookshelfData();
			const data = response.data;

			// 백엔드에서 받은 데이터를 decorsByFloor 형식으로 변환
			if (data && data.decorations) {
				set({
					decorsByFloor: data.decorations,
					lastSaved: data.updatedAt,
					isLoading: false,
				});
			} else {
				// 데이터가 없으면 기본값 사용
				set({
					decorsByFloor: {
						1: [],
						2: [],
						3: [],
						4: [],
						5: [],
						6: [],
						7: [],
					},
					isLoading: false,
				});
			}
		} catch (error) {
			console.error("책장 데이터 로드 실패:", error);

			// 404 에러(데이터 없음)는 에러로 처리하지 않음
			if (error.response?.status === 404) {
				set({
					decorsByFloor: {
						1: [],
						2: [],
						3: [],
						4: [],
						5: [],
						6: [],
						7: [],
					},
					isLoading: false,
					error: null,
				});
			} else {
				set({
					isLoading: false,
					error: error.response?.data?.message || "책장 데이터를 불러오는데 실패했습니다.",
				});
			}
		}
	},

	/**
	 * 책장 데이터 저장
	 */
	saveBookshelfData: async () => {
		const { decorsByFloor } = get();
		set({ isLoading: true, error: null });

		try {
			const payload = {
				decorations: decorsByFloor,
			};

			const response = await bookshelfAPI.updateBookshelfData(payload);

			set({
				isLoading: false,
				lastSaved: new Date().toISOString(),
			});

			return response.data;
		} catch (error) {
			console.error("책장 데이터 저장 실패:", error);
			set({
				isLoading: false,
				error: error.response?.data?.message || "책장 데이터 저장에 실패했습니다.",
			});
			throw error;
		}
	},

	/**
	 * 장식품 배치 업데이트
	 */
	setDecorsByFloor: (decorsByFloor) => {
		set({ decorsByFloor });
	},

	/**
	 * 특정 층의 장식품 업데이트
	 */
	updateFloorDecorations: (floor, decorations) => {
		set((state) => ({
			decorsByFloor: {
				...state.decorsByFloor,
				[floor]: decorations,
			},
		}));
	},

	/**
	 * 에러 초기화
	 */
	clearError: () => {
		set({ error: null });
	},
}));

export default useBookshelfStore;
