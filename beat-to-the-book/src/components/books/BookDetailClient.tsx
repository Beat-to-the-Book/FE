// src/components/books/BookDetailClient.tsx
"use client";

import { useEffect, useRef } from "react";
import { useBehaviorStore } from "@/store/behaviorStore";

interface Props {
	bookId: number;
}

export default function BookDetailClient({ bookId }: Props) {
	const addBehavior = useBehaviorStore((state) => state.addBehavior);
	const startTimeRef = useRef<number>(Date.now());
	const maxScrollYRef = useRef<number>(0);

	useEffect(() => {
		// 초기 클릭 로그 기록
		addBehavior({ bookId, stayTime: 0, scrollDepth: 0 });

		// 스크롤 이벤트에서 최대 스크롤 위치 캐치
		const handleScroll = () => {
			const currentY = window.scrollY;
			if (currentY > maxScrollYRef.current) {
				maxScrollYRef.current = currentY;
			}
		};
		window.addEventListener("scroll", handleScroll);

		return () => {
			window.removeEventListener("scroll", handleScroll);

			// 체류시간 및 스크롤 깊이 계산
			const staySec = Math.floor((Date.now() - startTimeRef.current) / 1000);
			const docHeight = document.documentElement.scrollHeight - window.innerHeight;
			const depthPercent =
				docHeight > 0 ? Math.min(100, Math.round((maxScrollYRef.current / docHeight) * 100)) : 0;

			addBehavior({ bookId, stayTime: staySec, scrollDepth: depthPercent });
		};
	}, [bookId, addBehavior]);

	return null;
}
