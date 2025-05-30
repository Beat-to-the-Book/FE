// src//app/(main)/page.tsx
"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { useBehaviorStore } from "@/store/behaviorStore";
import { fetchBooks, fetchRecommendBooks } from "@/lib/api/book";
import { Book, RecommendedBook } from "@/lib/types/book";
import BookItem from "@/components/books/BookItem";
import RecommendedBookItem from "@/components/books/RecommendedBookItem";

export default function Home() {
	const { isAuthenticated } = useAuthStore();
	const behaviors = useBehaviorStore((s) => s.behaviors);

	const [allBooks, setAllBooks] = useState<Book[]>([]);
	const [recBooks, setRecBooks] = useState<RecommendedBook[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		/** 전체 도서 먼저 로드 */
		const loadAll = async () => {
			try {
				const books = await fetchBooks();
				setAllBooks(books);
			} catch (e) {
				console.error("전체 도서 불러오기 실패", e);
			}
		};

		/** 로그인 사용자인 경우에만 ‘추천’ 시도 */
		const loadRec = async () => {
			if (!isAuthenticated) return;
			try {
				const recs = await fetchRecommendBooks();

				if (recs.length) {
					const mapped = recs.map(
						(r: RecommendedBook): RecommendedBook => ({
							bookId: r.bookId,
							title: r.title,
							coverImageUrl: r.coverImageUrl,
							author: (r as any).author ?? "",
						})
					);
					setRecBooks(mapped);
				}
			} catch (err) {
				// 👉 추천이 실패해도 여기서만 처리하고 넘어간다
				console.warn("추천 도서를 가져오지 못했습니다.", err);
			}
		};

		/** 순차 실행 */
		Promise.all([loadAll(), loadRec()]).finally(() => setLoading(false));
	}, [isAuthenticated]);

	/* ──────────────── 렌더 ──────────────── */
	if (loading) return <div className='min-h-screen p-6'>로딩 중...</div>;

	return (
		<div className='min-h-screen p-6'>
			{/* 추천 도서 섹션 */}
			{recBooks.length > 0 && (
				<>
					<h1 className='text-3xl font-bold text-stateBlue mb-4'>추천 도서</h1>
					<div className='flex flex-wrap justify-center gap-6 mb-10'>
						{recBooks.map((b) => (
							<RecommendedBookItem
								key={b.bookId}
								book={{
									bookId: b.bookId,
									title: b.title,
									author: (b as any).author ?? "",
									coverImageUrl: (b as any).coverImage ?? null,
								}}
							/>
						))}
					</div>
				</>
			)}

			{/* 전체 도서 섹션 */}
			<h1 className='text-3xl font-bold text-stateBlue mb-4'>
				{recBooks.length ? "전체 도서" : "도서 목록"}
			</h1>
			<div className='flex flex-wrap justify-center gap-6'>
				{allBooks.length ? (
					allBooks.map((b) => <BookItem key={b.id} book={b} />)
				) : (
					<p className='text-gray'>책이 없습니다.</p>
				)}
			</div>
		</div>
	);
}
