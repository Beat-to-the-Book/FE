// src/store/behaviorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 유저 행동 로그 타입
export interface UserBehavior {
	bookId: number;
	stayTime: number;
	scrollDepth: number;
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
					const prev = updated[idx];
					updated[idx] = {
						bookId: entry.bookId,
						stayTime: prev.stayTime + entry.stayTime,
						scrollDepth: Math.max(prev.scrollDepth, entry.scrollDepth),
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
