// src/components/books/CartItem.tsx
"use client";
import { useCartStore } from "@/store/cartStore";
import { Book } from "@/lib/types/book";
import Link from "next/link";
import Image from "next/image";

interface CartItemProps {
	item: { book: Book; quantity: number };
}

export default function CartItem({ item }: CartItemProps) {
	const { updateQuantity, removeItem } = useCartStore();

	return (
		<div className='bg-white shadow-md rounded-lg p-4 flex items-center gap-4'>
			<Link href={`/books/${item.book.id}`}>
				<Image
					src={(item.book as any).imageUrl || "/default-cover.jpg"}
					alt={item.book.title}
					width={64}
					height={96}
					className='w-16 h-24 object-cover rounded'
				/>
			</Link>
			<div className='flex-1'>
				<Link href={`/books/${item.book.id}`}>
					<h3 className='text-lg font-semibold text-stateBlue'>{item.book.title}</h3>
				</Link>
				<p className='text-gray'>{item.book.author}</p>
				<p className='text-gray'>{(item.book.price * item.quantity).toLocaleString()}원</p>
			</div>
			<div className='flex items-center gap-2'>
				<button
					onClick={() => updateQuantity(item.book.id, item.quantity - 1)}
					className='bg-gray px-2 py-1 rounded'
				>
					-
				</button>
				<span>{item.quantity}</span>
				<button
					onClick={() => updateQuantity(item.book.id, item.quantity + 1)}
					className='bg-gray px-2 py-1 rounded'
				>
					+
				</button>
			</div>
			<button onClick={() => removeItem(item.book.id)} className='text-red-500 hover:underline'>
				삭제
			</button>
		</div>
	);
}
