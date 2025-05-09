// src/app/(main)/cart/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import CartItem from "@/components/books/CartItem";
import { addPurchase } from "@/lib/api/transaction";

export default function CartPage() {
	const user = useAuthStore((s) => s.user);
	const router = useRouter();
	const { items, clearCart } = useCartStore();

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const totalPrice = items.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

	const handleCheckout = async () => {
		if (!user) {
			router.push("/auth/signin");
			return;
		}

		setLoading(true);
		setError(null);
		// TODO: 책 여러권 대여 구매 api 구분, 수정 필요
		try {
			// quantity만큼 반복 호출하거나, 서버에서 지원한다면 배열로 한 번에 전송해도 됩니다
			const promises = items.flatMap((item) =>
				Array(item.quantity)
					.fill(0)
					.map(() => addPurchase(user.id, item.book.id))
			);
			await Promise.all(promises);

			alert("구매가 완료되었습니다!");
			clearCart();
			router.push("/purchase/history?userId=" + encodeURIComponent(user.id));
		} catch (err: any) {
			console.error(err);
			setError(err.message || "결제 중 오류가 발생했습니다.");
		} finally {
			setLoading(false);
		}
	};

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
									disabled={loading}
									className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
								>
									장바구니 비우기
								</button>
								<button
									onClick={handleCheckout}
									disabled={loading}
									className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'
								>
									{loading ? "결제 중..." : "결제하기"}
								</button>
							</div>
						</div>
						{error && <p className='text-red-500 mt-2'>{error}</p>}
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
