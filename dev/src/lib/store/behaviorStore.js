import { create } from "zustand";
import { persist } from "zustand/middleware";
import { recommendAPI } from "../api/recommend";
import { behaviorAPI } from "../api/behavior";

const useBehaviorStore = create(
	persist(
		(set, get) => ({
			recommendedBooks: [],
			loading: false,
			error: null,
			currentBehavior: {
				bookId: null,
				stayTime: 0,
				scrollDepth: 0,
				timestamp: null,
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
				const timestamp = new Date().toISOString().slice(0, 19);
				set({
					currentBehavior: {
						bookId,
						stayTime: 0,
						scrollDepth: 0,
						timestamp,
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
				const state = get();
				const { currentBehavior } = state;
				if (!currentBehavior.bookId) return;

				// stayTime 1초 증가 및 타임스탬프 업데이트
				const nextStayTime = currentBehavior.stayTime + 1;
				const timestamp = new Date().toISOString().slice(0, 19);
				set((state) => ({
					currentBehavior: {
						...state.currentBehavior,
						stayTime: nextStayTime,
						timestamp,
					},
				}));

				// 30초마다 백엔드로 전송 (증가된 값 기준)
				if (nextStayTime % 30 === 0) {
					try {
						await behaviorAPI.log({
							bookId: Number(currentBehavior.bookId),
							stayTime: nextStayTime,
							scrollDepth: currentBehavior.scrollDepth,
							timestamp,
						});
					} catch (error) {
						console.error("행동 로그 전송 실패:", error);
					}
				}
			},
		}),
		{
			name: "behavior-storage",
			partialize: (state) => ({
				currentBehavior: state.currentBehavior,
			}),
		}
	)
);

export default useBehaviorStore;
