// src/store/behaviorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 유저 행동 로그 타입
export interface UserBehavior {
	bookId: number;
	stayTime: number;
	scrollDepth?: number;
}

type BehaviorState = {
	behaviors: UserBehavior[];
	addBehavior: (entry: UserBehavior) => void;
	clearBehaviors: () => void;
};

export const useBehaviorStore = create<BehaviorState>()(
	persist(
		(set, get) => ({
			behaviors: [],
			addBehavior: (entry: UserBehavior) => {
				const list = get().behaviors;
				const idx = list.findIndex((b) => b.bookId === entry.bookId);
				if (idx > -1) {
					const updated = [...list];
					updated[idx] = {
						bookId: entry.bookId,
						stayTime: updated[idx].stayTime + entry.stayTime,
					};
					set({ behaviors: updated });
				} else {
					set({ behaviors: [...list, entry] });
				}
			},
			clearBehaviors: () => set({ behaviors: [] }),
		}),
		{ name: "user-behaviors" }
	)
);

// TODO: 초기에는 데이터가 없으니 빈 배열로 초기화하여 저장하던가 전송할 때 로컬스토리지에 없다면 빈 배열을 전송하는 로직, 상세페이지 스크롤 얼마나 했는지 측정 후 저장 로직 추가
