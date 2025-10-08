import { useNavigate } from "react-router-dom";
import useCartStore from "../lib/store/cartStore";
import useAuthStore from "../lib/store/authStore";

const CartPage = () => {
	const navigate = useNavigate();
	const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
	const { isAuthenticated } = useAuthStore();

	const handleCheckout = () => {
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}
		// 결제 로직 구현
		alert("결제 기능은 준비 중입니다.");
	};

	if (items.length === 0) {
		return (
			<div className='max-w-6xl mx-auto p-8'>
				<h1 className='text-3xl font-bold text-primary mb-8'>장바구니</h1>
				<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-16 text-center'>
					<div className='w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-6'>
						<svg
							className='w-12 h-12 text-gray-400'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
							/>
						</svg>
					</div>
					<p className='text-gray-600 text-lg mb-6'>장바구니가 비어있습니다</p>
					<button
						onClick={() => navigate("/")}
						className='bg-primary text-white px-8 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
					>
						도서 둘러보기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-6xl mx-auto p-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-primary mb-2'>장바구니</h1>
				<p className='text-gray-600'>
					총 <span className='text-primary-light font-semibold'>{items.length}</span>개의 상품
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2 space-y-4'>
					{items.map((item) => (
						<div
							key={item.id}
							className='bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all'
						>
							<div className='flex items-center gap-6'>
								<img
									src={item.frontCoverImageUrl}
									alt={item.title}
									className='w-20 h-28 object-cover rounded-lg shadow-sm'
								/>
								<div className='flex-1'>
									<h3 className='font-semibold text-lg text-gray-900 mb-1'>{item.title}</h3>
									<p className='text-gray-600 text-sm mb-2'>{item.author}</p>
									<p className='text-primary font-bold text-xl'>{item.price.toLocaleString()}원</p>
								</div>
								<div className='flex flex-col items-center gap-4'>
									<div className='flex items-center gap-3 bg-gray-50 rounded-lg p-2'>
										<button
											onClick={() => updateQuantity(item.id, item.quantity - 1)}
											className='w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all'
										>
											-
										</button>
										<span className='w-8 text-center font-semibold'>{item.quantity}</span>
										<button
											onClick={() => updateQuantity(item.id, item.quantity + 1)}
											className='w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-lg hover:bg-gray-100 transition-all'
										>
											+
										</button>
									</div>
									<button
										onClick={() => removeItem(item.id)}
										className='text-red-500 hover:text-red-700 font-medium text-sm'
									>
										삭제
									</button>
								</div>
							</div>
						</div>
					))}
				</div>

				<div className='lg:col-span-1'>
					<div className='bg-white rounded-xl shadow-lg p-6 border border-gray-100 sticky top-8'>
						<h2 className='text-xl font-bold text-gray-900 mb-6'>주문 요약</h2>
						<div className='space-y-4 mb-6'>
							<div className='flex justify-between text-gray-600'>
								<span>상품 금액</span>
								<span>{getTotalPrice().toLocaleString()}원</span>
							</div>
							<div className='flex justify-between text-gray-600'>
								<span>배송비</span>
								<span className='text-primary-light font-semibold'>무료</span>
							</div>
							<div className='border-t border-gray-200 pt-4'>
								<div className='flex justify-between items-center'>
									<span className='text-lg font-semibold text-gray-900'>총 결제 금액</span>
									<span className='text-2xl font-bold text-primary'>
										{getTotalPrice().toLocaleString()}원
									</span>
								</div>
							</div>
						</div>
						<div className='space-y-3'>
							<button
								onClick={handleCheckout}
								className='w-full bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
							>
								결제하기
							</button>
							<button
								onClick={clearCart}
								className='w-full bg-white border-2 border-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-50 hover:border-primary-light transition-all font-semibold'
							>
								장바구니 비우기
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default CartPage;
