// src/components/BehaviorBatchSender.tsx
"use client";

import { useEffect } from "react";
import { useBehaviorStore } from "@/store/behaviorStore";
import { logBookBehavior } from "@/lib/api/book";

export default function BehaviorBatchSender() {
	const behaviors = useBehaviorStore((state) => state.behaviors);
	const clearBehaviors = useBehaviorStore((state) => state.clearBehaviors);

	useEffect(() => {
		const interval = setInterval(async () => {
			if (behaviors.length === 0) return;
			try {
				// 1분마다 누적된 로그를 한 번에 전송
				await logBookBehavior(behaviors);
				clearBehaviors();
			} catch (error) {
				console.error("배치 로그 전송 실패:", error);
			}
		}, 60000);

		return () => clearInterval(interval);
	}, [behaviors, clearBehaviors]);

	return null;
}
