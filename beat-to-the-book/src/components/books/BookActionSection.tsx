// src/components/books/BookActionSection.tsx

"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import AddToCartButton from "./AddToCartButton"; // 경로 주의
import { Book } from "@/lib/types/book";

export default function BookActionSection({ book }: { book: Book }) {
	const { isAuthenticated } = useAuthStore();

	return isAuthenticated ? (
		<>
			<AddToCartButton book={book} />

			<button className='bg-springGreen text-stateBlue px-4 py-2 rounded-md hover:bg-forestGreen hover:text-white'>
				대여하기
			</button>
			<button className='bg-stateBlue text-white px-4 py-2 rounded-md hover:bg-everGreen'>
				구매하기
			</button>
			<button className='bg-gray text-stateBlue px-4 py-2 rounded-md hover:bg-lightGray'>
				찜하기
			</button>
		</>
	) : (
		<Link
			href='/auth/signin'
			className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'
		>
			로그인 후 이용
		</Link>
	);
}
