// src/app/(main)/cart/page.tsx
"use client";
import { useCartStore } from "@/store/cartStore";
import CartItem from "@/components/books/CartItem";
import Link from "next/link";

export default function CartPage() {
	const { items, clearCart } = useCartStore();

	const totalPrice = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

	return (
		<div className='min-h-screen p-6'>
			<section className='text-center'>
				<h1 className='text-3xl font-bold text-stateBlue mb-4'>장바구니</h1>
			</section>
			<section className='max-w-4xl mx-auto'>
				{items.length > 0 ? (
					<>
						<div className='space-y-4'>
							{items.map((item) => (
								<CartItem key={item.book.id} item={item} />
							))}
						</div>
						<div className='mt-6 flex justify-between items-center'>
							<p className='text-lg font-semibold'>총액: {totalPrice.toLocaleString()}원</p>
							<div className='space-x-4'>
								<button
									onClick={clearCart}
									className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
								>
									장바구니 비우기
								</button>
								<Link href='/checkout'>
									<button className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'>
										결제하기
									</button>
								</Link>
							</div>
						</div>
					</>
				) : (
					<p className='text-gray text-center'>
						장바구니가 비었습니다.{" "}
						<Link href='/' className='text-forestGreen hover:underline'>
							책을 추가하세요.
						</Link>
					</p>
				)}
			</section>
		</div>
	);
}
