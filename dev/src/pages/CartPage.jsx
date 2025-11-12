import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useCartStore from "../lib/store/cartStore";
import useAuthStore from "../lib/store/authStore";
import { purchaseAPI } from "../lib/api/purchase";
import { rentalAPI } from "../lib/api/rental";

const CartPage = () => {
	const navigate = useNavigate();
	const { items, removeItem, updateQuantity, clearCart, getTotalPrice } = useCartStore();
	const { isAuthenticated } = useAuthStore();
	const [isProcessing, setIsProcessing] = useState(false);
	const [selectedItems, setSelectedItems] = useState(new Set());
	const [processingType, setProcessingType] = useState(null); // 'purchase' or 'rental'

	// items가 변경될 때 selectedItems 동기화 (기존 선택 유지)
	useEffect(() => {
		setSelectedItems((prev) => {
			const newSelected = new Set();
			items.forEach((item) => {
				if (prev.has(item.id)) {
					newSelected.add(item.id);
				}
			});
			return newSelected;
		});
	}, [items.length]); // items가 추가/삭제될 때만 업데이트

	// 선택된 아이템만 필터링
	const selectedItemsList = useMemo(
		() => items.filter((item) => selectedItems.has(item.id)),
		[items, selectedItems]
	);

	// 선택된 아이템의 총 금액
	const selectedTotalPrice = useMemo(
		() => selectedItemsList.reduce((total, item) => total + item.price * item.quantity, 0),
		[selectedItemsList]
	);

	// 선택된 아이템의 총 수량
	const selectedTotalQuantity = useMemo(
		() => selectedItemsList.reduce((total, item) => total + item.quantity, 0),
		[selectedItemsList]
	);

	// 전체 선택/해제
	const toggleSelectAll = () => {
		if (selectedItems.size === items.length) {
			setSelectedItems(new Set());
		} else {
			setSelectedItems(new Set(items.map((item) => item.id)));
		}
	};

	// 개별 선택/해제
	const toggleSelectItem = (itemId) => {
		const newSelected = new Set(selectedItems);
		if (newSelected.has(itemId)) {
			newSelected.delete(itemId);
		} else {
			newSelected.add(itemId);
		}
		setSelectedItems(newSelected);
	};

	// 선택된 아이템 제거
	const removeSelectedItems = () => {
		selectedItems.forEach((itemId) => removeItem(itemId));
		setSelectedItems(new Set());
	};

	// 구매 처리
	const handlePurchase = async () => {
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		if (selectedItemsList.length === 0) {
			alert("구매할 상품을 선택해주세요.");
			return;
		}

		try {
			setIsProcessing(true);
			setProcessingType("purchase");

			const checkoutResults = [];

			for (const item of selectedItemsList) {
				const response = await purchaseAPI.checkout({
					bookId: item.id,
					quantity: item.quantity,
				});
				const { orderId, payUrl } = response.data || {};

				if (!orderId || !payUrl) {
					throw new Error("주문 정보를 확인할 수 없습니다.");
				}

				checkoutResults.push({
					orderId,
					payUrl,
					itemId: item.id,
					title: item.title,
					quantity: item.quantity,
				});
			}

			if (checkoutResults.length === 0) {
				alert("생성된 주문이 없습니다. 다시 시도해주세요.");
				return;
			}

			sessionStorage.setItem("pendingOrders", JSON.stringify(checkoutResults));
			sessionStorage.setItem("completedOrders", JSON.stringify([]));

			alert("결제 페이지로 이동합니다. 결제를 완료해주세요.");
			navigate(checkoutResults[0].payUrl, {
				state: { orderId: checkoutResults[0].orderId },
			});
		} catch (error) {
			console.error("결제 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
				navigate("/login");
			} else {
				alert(
					`결제에 실패했습니다: ${
						error.response?.data?.message || error.message || "알 수 없는 오류"
					}`
				);
			}
		} finally {
			setIsProcessing(false);
			setProcessingType(null);
		}
	};

	// 대여 처리
	const handleRental = async () => {
		if (!isAuthenticated) {
			alert("로그인이 필요합니다.");
			navigate("/login");
			return;
		}

		if (selectedItemsList.length === 0) {
			alert("대여할 상품을 선택해주세요.");
			return;
		}

		try {
			setIsProcessing(true);
			setProcessingType("rental");

			// 각 상품별로 대여 처리 (수량만큼 반복)
			const rentalResults = [];
			const failedBooksMap = new Map(); // bookId -> { title, count }

			for (const item of selectedItemsList) {
				let successCount = 0;
				let failCount = 0;

				// 수량만큼 개별 대여 시도
				for (let i = 0; i < item.quantity; i++) {
					try {
						await rentalAPI.add({
							bookId: item.id,
						});
						successCount++;
					} catch (error) {
						failCount++;
						console.error(`대여 실패 (${item.title}):`, error);

						// 첫 번째 실패 시에만 맵에 추가
						if (!failedBooksMap.has(item.id)) {
							const errorMessage = error.response?.data?.message || "";
							failedBooksMap.set(item.id, {
								title: item.title,
								count: 1,
								errorMessage,
							});
						} else {
							const existing = failedBooksMap.get(item.id);
							existing.count++;
						}
					}
				}

				rentalResults.push({
					item,
					successCount,
					failCount,
				});
			}

			// 결과 처리
			const totalSuccess = rentalResults.reduce((sum, r) => sum + r.successCount, 0);
			const totalFail = rentalResults.reduce((sum, r) => sum + r.failCount, 0);

			if (failedBooksMap.size > 0) {
				const failedTitles = Array.from(failedBooksMap.values())
					.map((book) => `${book.title} (${book.count}권)`)
					.join("\n");

				if (totalSuccess > 0) {
					alert(
						`일부 책 대여에 실패했습니다.\n\n✅ 성공: ${totalSuccess}권\n❌ 실패: ${totalFail}권\n\n대여 실패한 책:\n${failedTitles}\n\n이미 대여 중인 책은 다시 대여할 수 없습니다.\n성공한 책만 장바구니에서 제거됩니다.`
					);

					// 성공한 책만 장바구니에서 제거 (부분 성공도 처리)
					rentalResults.forEach((result) => {
						if (result.successCount === result.item.quantity) {
							// 모두 성공한 경우에만 장바구니에서 제거
							removeItem(result.item.id);
							const newSelected = new Set(selectedItems);
							newSelected.delete(result.item.id);
							setSelectedItems(newSelected);
						} else if (result.successCount > 0) {
							// 부분 성공인 경우 수량 조정 (모두 성공한 것처럼 처리)
							// 실제로는 이미 대여되었으므로 장바구니에서 제거
							removeItem(result.item.id);
							const newSelected = new Set(selectedItems);
							newSelected.delete(result.item.id);
							setSelectedItems(newSelected);
						}
					});

					setSelectedItems(new Set());
				} else {
					alert(
						`대여에 실패했습니다.\n\n대여 실패한 책:\n${failedTitles}\n\n이미 대여 중인 책은 다시 대여할 수 없습니다.`
					);
				}
			} else {
				alert(`대여가 완료되었습니다!\n총 ${totalSuccess}권의 책이 대여되었습니다.`);

				// 선택된 아이템만 장바구니에서 제거
				selectedItems.forEach((itemId) => removeItem(itemId));
				setSelectedItems(new Set());
				navigate("/mypage");
			}
		} catch (error) {
			console.error("대여 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
				navigate("/login");
			} else {
				alert(
					`대여에 실패했습니다: ${
						error.response?.data?.message || error.message || "알 수 없는 오류"
					}`
				);
			}
		} finally {
			setIsProcessing(false);
			setProcessingType(null);
		}
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
					{selectedItems.size > 0 && (
						<span className='ml-2'>
							(<span className='text-primary font-semibold'>{selectedItems.size}개 선택됨</span>)
						</span>
					)}
				</p>
			</div>

			<div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
				<div className='lg:col-span-2 space-y-4'>
					{/* 전체 선택/해제 */}
					<div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between'>
						<label className='flex items-center gap-3 cursor-pointer'>
							<input
								type='checkbox'
								checked={selectedItems.size === items.length && items.length > 0}
								onChange={toggleSelectAll}
								className='w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2'
							/>
							<span className='font-semibold text-gray-900'>
								전체 선택 ({selectedItems.size}/{items.length})
							</span>
						</label>
						{selectedItems.size > 0 && (
							<button
								onClick={removeSelectedItems}
								className='text-red-500 hover:text-red-700 font-medium text-sm'
							>
								선택 삭제
							</button>
						)}
					</div>

					{/* 아이템 목록 */}
					{items.map((item) => (
						<div
							key={item.id}
							className={`bg-white rounded-xl shadow-sm border-2 p-6 hover:shadow-md transition-all ${
								selectedItems.has(item.id) ? "border-primary" : "border-gray-100"
							}`}
						>
							<div className='flex items-center gap-6'>
								{/* 체크박스 */}
								<label className='cursor-pointer'>
									<input
										type='checkbox'
										checked={selectedItems.has(item.id)}
										onChange={() => toggleSelectItem(item.id)}
										className='w-5 h-5 text-primary border-gray-300 rounded focus:ring-primary focus:ring-2'
									/>
								</label>

								{/* 책 이미지 */}
								<img
									src={item.frontCoverImageUrl}
									alt={item.title}
									className='w-20 h-28 object-cover rounded-lg shadow-sm'
								/>

								{/* 책 정보 */}
								<div className='flex-1'>
									<h3 className='font-semibold text-lg text-gray-900 mb-1'>{item.title}</h3>
									<p className='text-gray-600 text-sm mb-2'>{item.author}</p>
									<p className='text-primary font-bold text-xl mb-2'>{item.price.toLocaleString()}원</p>
									<div className='flex flex-wrap gap-2 text-xs text-gray-500'>
										<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary font-medium'>
											구매 재고
											<strong className='text-primary-dark'>
												{item.purchaseStock !== undefined && item.purchaseStock !== null
													? `${item.purchaseStock}권`
													: "-"}
											</strong>
										</span>
										<span className='inline-flex items-center gap-1 px-2 py-1 rounded-full bg-secondary-light/30 text-secondary-dark font-medium'>
											대여 재고
											<strong className='text-secondary-dark'>
												{item.rentalStock !== undefined && item.rentalStock !== null
													? `${item.rentalStock}권`
													: "-"}
											</strong>
										</span>
									</div>
								</div>

								{/* 수량 조절 및 삭제 */}
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
										onClick={() => {
											removeItem(item.id);
											const newSelected = new Set(selectedItems);
											newSelected.delete(item.id);
											setSelectedItems(newSelected);
										}}
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
								<span>선택된 상품</span>
								<span className='font-semibold'>
									{selectedItemsList.length}개 ({selectedTotalQuantity}권)
								</span>
							</div>
							<div className='flex justify-between text-gray-600'>
								<span>상품 금액</span>
								<span>{selectedTotalPrice.toLocaleString()}원</span>
							</div>
							<div className='flex justify-between text-gray-600'>
								<span>배송비</span>
								<span className='text-primary-light font-semibold'>무료</span>
							</div>
							<div className='border-t border-gray-200 pt-4'>
								<div className='flex justify-between items-center'>
									<span className='text-lg font-semibold text-gray-900'>총 금액</span>
									<span className='text-2xl font-bold text-primary'>
										{selectedTotalPrice.toLocaleString()}원
									</span>
								</div>
							</div>
						</div>
						<div className='space-y-3'>
							<button
								onClick={handlePurchase}
								disabled={
									isProcessing || selectedItemsList.length === 0 || processingType === "rental"
								}
								className='w-full bg-primary text-white py-4 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2'
							>
								{isProcessing && processingType === "purchase" ? (
									<>
										<div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white'></div>
										<span>결제 진행 중...</span>
									</>
								) : (
									<span>구매하기</span>
								)}
							</button>
							<button
								onClick={handleRental}
								disabled={
									isProcessing || selectedItemsList.length === 0 || processingType === "purchase"
								}
								className='w-full bg-primary-light text-primary-dark py-4 rounded-xl hover:bg-secondary-light transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2'
							>
								{isProcessing && processingType === "rental" ? (
									<>
										<div className='animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary-dark'></div>
										<span>대여 진행 중...</span>
									</>
								) : (
									<span>대여하기</span>
								)}
							</button>
							<button
								onClick={clearCart}
								disabled={isProcessing}
								className='w-full bg-white border-2 border-gray-200 text-gray-800 py-3 rounded-xl hover:bg-gray-50 hover:border-primary-light transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
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
