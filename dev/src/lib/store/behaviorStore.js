import { create } from "zustand";
import { recommendAPI } from "../api/recommend";

const useBehaviorStore = create((set) => ({
	recommendedBooks: [],
	loading: false,
	error: null,
	currentBehavior: {
		bookId: null,
		stayTime: 0,
		scrollDepth: 0,
	},

	// 추천 책 가져오기
	fetchRecommendations: async () => {
		set({ loading: true, error: null });
		try {
			const response = await recommendAPI.getRecommendations();
			set({ recommendedBooks: response.data.recommendedBooks });
		} catch (_) {
			set({ error: "추천 책을 불러오는데 실패했습니다." });
		} finally {
			set({ loading: false });
		}
	},

	// 행동 로그 초기화
	initBehavior: (bookId) => {
		set({
			currentBehavior: {
				bookId,
				stayTime: 0,
				scrollDepth: 0,
			},
		});
	},

	// 스크롤 깊이 업데이트
	updateScrollDepth: (depth) => {
		set((state) => ({
			currentBehavior: {
				...state.currentBehavior,
				scrollDepth: Math.max(state.currentBehavior.scrollDepth, depth),
			},
		}));
	},

	// 행동 로그 전송
	logBehavior: async () => {
		const { currentBehavior } = useBehaviorStore.getState();
		if (!currentBehavior.bookId) return;

		try {
			await recommendAPI.logBehavior(currentBehavior);
		} catch (_) {
			console.error("행동 로그 전송 실패");
		}
	},
}));

export default useBehaviorStore;
