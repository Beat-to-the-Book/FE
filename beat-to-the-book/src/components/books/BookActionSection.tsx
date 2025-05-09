// src/components/books/BookActionSection.tsx

"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuthStore } from "@/store/authStore";
import AddToCartButton from "./AddToCartButton";
import { Book } from "@/lib/types/book";
import { addRental, addPurchase } from "@/lib/api/transaction";

export default function BookActionSection({ book }: { book: Book }) {
	const user = useAuthStore((s) => s.user);
	const isAuthenticated = Boolean(user);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleRental = async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			await addRental(user.id, book.id);
			alert("대여가 완료되었습니다.");
		} catch (err: any) {
			console.error(err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handlePurchase = async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			await addPurchase(user.id, book.id);
			alert("구매가 완료되었습니다.");
		} catch (err: any) {
			console.error(err);
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	if (!isAuthenticated) {
		return (
			<Link
				href='/auth/signin'
				className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'
			>
				로그인 후 이용
			</Link>
		);
	}

	return (
		<>
			<AddToCartButton book={book} />

			<button
				onClick={handleRental}
				disabled={loading}
				className='bg-springGreen text-stateBlue px-4 py-2 rounded-md hover:bg-forestGreen hover:text-white'
			>
				{loading ? "처리중..." : "대여하기"}
			</button>
			<button
				onClick={handlePurchase}
				disabled={loading}
				className='bg-stateBlue text-white px-4 py-2 rounded-md hover:bg-everGreen ml-2'
			>
				{loading ? "처리중..." : "구매하기"}
			</button>
			<button className='bg-gray text-stateBlue px-4 py-2 rounded-md hover:bg-lightGray ml-2'>
				찜하기
			</button>

			{error && <p className='text-red-500 mt-2'>{error}</p>}
		</>
	);
}
