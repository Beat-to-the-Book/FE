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
			<div className='max-w-4xl mx-auto p-8'>
				<h1 className='text-3xl font-bold text-primary mb-8'>장바구니</h1>
				<div className='text-center py-12'>
					<p className='text-gray-600 mb-4'>장바구니가 비어있습니다.</p>
					<button
						onClick={() => navigate("/")}
						className='bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors'
					>
						쇼핑 계속하기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto p-8'>
			<h1 className='text-3xl font-bold text-primary mb-8'>장바구니</h1>

			<div className='space-y-4'>
				{items.map((item) => (
					<div key={item.id} className='flex items-center gap-4 bg-white p-4 rounded-lg shadow'>
						<img
							src={item.frontCoverImageUrl}
							alt={item.title}
							className='w-24 h-32 object-cover rounded'
						/>
						<div className='flex-1'>
							<h3 className='font-semibold text-lg'>{item.title}</h3>
							<p className='text-gray-600'>{item.author}</p>
							<p className='text-primary font-bold'>{item.price.toLocaleString()}원</p>
						</div>
						<div className='flex items-center gap-2'>
							<button
								onClick={() => updateQuantity(item.id, item.quantity - 1)}
								className='px-2 py-1 bg-gray-200 rounded'
							>
								-
							</button>
							<span>{item.quantity}</span>
							<button
								onClick={() => updateQuantity(item.id, item.quantity + 1)}
								className='px-2 py-1 bg-gray-200 rounded'
							>
								+
							</button>
						</div>
						<button onClick={() => removeItem(item.id)} className='text-red-500 hover:text-red-700'>
							삭제
						</button>
					</div>
				))}
			</div>

			<div className='mt-8 bg-white p-6 rounded-lg shadow'>
				<div className='flex justify-between items-center mb-4'>
					<span className='text-lg font-semibold'>총 금액</span>
					<span className='text-2xl font-bold text-primary'>
						{getTotalPrice().toLocaleString()}원
					</span>
				</div>
				<div className='flex gap-4'>
					<button
						onClick={clearCart}
						className='flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg hover:bg-gray-300 transition-colors'
					>
						장바구니 비우기
					</button>
					<button
						onClick={handleCheckout}
						className='flex-1 bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors'
					>
						결제하기
					</button>
				</div>
			</div>
		</div>
	);
};

export default CartPage;
