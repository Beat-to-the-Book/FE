// src/components/books/AddToCartButton.tsx
"use client";
import { useCartStore } from "@/store/cartStore";
import { Book } from "@/lib/types/book";

interface AddToCartButtonProps {
	book: Book;
}

export default function AddToCartButton({ book }: AddToCartButtonProps) {
	const { addItem } = useCartStore();

	return (
		<button
			onClick={() => addItem(book)}
			className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'
		>
			장바구니에 담기
		</button>
	);
}
