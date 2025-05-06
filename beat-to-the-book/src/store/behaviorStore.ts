// src/store/behaviorStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// 유저 행동 로그 타입
export interface UserBehavior {
	bookId: number;
	clickCount: number;
	stayTime: number;
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
						clickCount: updated[idx].clickCount + entry.clickCount,
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
