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
			recentBooks: [], // 최근 본 책 목록 (최대 10개)
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

			// 최근 본 책 추가
			addRecentBook: (book) => {
				set((state) => {
					// 이미 있는 책은 제거
					const filtered = state.recentBooks.filter((b) => b.id !== book.id);
					// 최신 것을 맨 앞에 추가하고 최대 10개 유지
					const updated = [book, ...filtered].slice(0, 10);
					return { recentBooks: updated };
				});
			},

			// 최근 본 책 목록 가져오기
			getRecentBooks: (limit = 3) => {
				return get().recentBooks.slice(0, limit);
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
				recentBooks: state.recentBooks,
			}),
		}
	)
);

export default useBehaviorStore;
