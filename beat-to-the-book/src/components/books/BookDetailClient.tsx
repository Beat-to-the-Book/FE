// src/components/books/BookDetailClient.tsx
"use client";
import { useEffect, useRef } from "react";
import { Book } from "@/lib/types/book";
import { useBehaviorStore } from "@/store/behaviorStore";

interface Props {
	bookId: number;
}

export default function BookDetailClient({ bookId }: Props) {
	const addBehavior = useBehaviorStore((state) => state.addBehavior);
	const startTimeRef = useRef(Date.now());

	useEffect(() => {
		// 클릭 로그
		addBehavior({ bookId, clickCount: 1, stayTime: 0 });
		return () => {
			// 체류 로그
			const staySec = Math.floor((Date.now() - startTimeRef.current) / 1000);
			addBehavior({ bookId, clickCount: 0, stayTime: staySec });
		};
	}, [bookId, addBehavior]);

	return null;
}
