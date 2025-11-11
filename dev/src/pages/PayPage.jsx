import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { purchaseAPI } from "../lib/api/purchase";
import useCartStore from "../lib/store/cartStore";

const parseStoredJSON = (value, fallback) => {
	if (!value) {
		return fallback;
	}

	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : fallback;
	} catch (error) {
		console.error("세션 데이터 파싱 실패:", error);
		return fallback;
	}
};

const PayPage = () => {
	const { removeItem } = useCartStore();
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams] = useSearchParams();

	const [pendingOrders, setPendingOrders] = useState(() =>
		parseStoredJSON(sessionStorage.getItem("pendingOrders"), [])
	);
	const [error, setError] = useState("");
	const [processing, setProcessing] = useState(false);
	const [copied, setCopied] = useState(false);

	const orderIdFromQuery = searchParams.get("orderId");
	const orderIdFromState = location.state?.orderId;

	const currentOrder = useMemo(() => {
		if (!pendingOrders || pendingOrders.length === 0) {
			return null;
		}

		if (orderIdFromQuery) {
			const matched = pendingOrders.find(
				(order) => String(order.orderId) === String(orderIdFromQuery)
			);
			if (matched) {
				return matched;
			}
		}

		if (orderIdFromState) {
			const matched = pendingOrders.find(
				(order) => String(order.orderId) === String(orderIdFromState)
			);
			if (matched) {
				return matched;
			}
		}

		return pendingOrders[0];
	}, [pendingOrders, orderIdFromQuery, orderIdFromState]);

	useEffect(() => {
		if (currentOrder) {
			const url = new URL(window.location.href);
			url.searchParams.set("orderId", currentOrder.orderId);
			window.history.replaceState({}, "", url.toString());
		}
	}, [currentOrder]);

	useEffect(() => {
		if (!pendingOrders || pendingOrders.length === 0) {
			setError("진행 중인 결제가 없습니다. 다시 시도해주세요.");
		} else {
			setError("");
		}
	}, [pendingOrders]);

	const handleConfirm = async () => {
		if (!currentOrder) {
			return;
		}

		setProcessing(true);
		setError("");

		try {
			const response = await purchaseAPI.confirm(currentOrder.orderId);
			const milestone = response.data?.milestone ?? null;

			const completedRaw = sessionStorage.getItem("completedOrders");
			const completed = parseStoredJSON(completedRaw, []);

			const completedWithCurrent = [
				...completed,
				{
					orderId: currentOrder.orderId,
					title: currentOrder.title,
					quantity: currentOrder.quantity,
					itemId: currentOrder.itemId,
					milestone,
				},
			];

			sessionStorage.setItem("completedOrders", JSON.stringify(completedWithCurrent));

			if (currentOrder.itemId) {
				removeItem(currentOrder.itemId);
			}

			const remaining = pendingOrders.filter(
				(order) => String(order.orderId) !== String(currentOrder.orderId)
			);

			if (remaining.length > 0) {
				sessionStorage.setItem("pendingOrders", JSON.stringify(remaining));
				setPendingOrders(remaining);

				const nextOrder = remaining[0];
				navigate(nextOrder.payUrl, {
					replace: true,
					state: { orderId: nextOrder.orderId },
				});
			} else {
				sessionStorage.removeItem("pendingOrders");
				navigate("/pay/success", { replace: true });
			}
		} catch (err) {
			console.error("결제 확인 실패:", err);
			const message =
				err?.response?.data?.message ||
				err?.message ||
				"결제를 완료하는 중 오류가 발생했습니다.";
			setError(message);
		} finally {
			setProcessing(false);
		}
	};

	if (!currentOrder) {
		return (
			<div className='max-w-2xl mx-auto px-4 py-16'>
				<div className='bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-xl'>
					<h1 className='text-2xl font-bold text-gray-900 mb-3'>결제 내역이 없습니다</h1>
					<p className='text-gray-600 mb-8'>이미 결제를 완료했거나 세션이 만료되었습니다.</p>
					<div className='flex justify-center gap-3'>
						<button
							onClick={() => navigate("/")}
							className='px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold transition-all'
						>
							홈으로 가기
						</button>
						<button
							onClick={() => navigate("/cart")}
							className='px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg'
						>
							장바구니로 이동
						</button>
					</div>
				</div>
			</div>
		);
	}

	const remainingCount = pendingOrders.length;
	const progressPercentage =
		pendingOrders.length > 0
			? Math.round(((pendingOrders.length - (currentOrder ? pendingOrders.indexOf(currentOrder) : 0)) / pendingOrders.length) * 100)
			: 0;

	const handleCopyOrderId = async () => {
		if (!currentOrder) {
			return;
		}

		try {
			await navigator.clipboard.writeText(String(currentOrder.orderId));
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch (err) {
			console.warn("클립보드 복사 실패:", err);
		}
	};

	return (
		<div className='min-h-[calc(100vh-120px)] bg-gray-50 py-16'>
			<div className='max-w-4xl mx-auto px-4'>
				<div className='rounded-3xl bg-white shadow-xl ring-1 ring-gray-900/5'>
					<div className='relative px-6 py-10 sm:px-10'>
						<header className='space-y-5'>
							<p className='inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-gray-600'>
								<span className='text-lg'>💳</span>
								{remainingCount > 1 ? `결제 대기 중인 주문 ${remainingCount}건` : "결제 확인 대기"}
							</p>

							<div className='flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between'>
								<div>
									<h1 className='text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight'>
										결제를 완료해주세요
									</h1>
									<p className='mt-2 text-gray-600'>
										아래 버튼을 눌러 결제를 확정하면 주문이 완료됩니다. 결제 내역은 마이페이지에서 확인할 수 있어요.
									</p>
								</div>
								<div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
									<span className='text-gray-400 mr-2'>진행률</span>
									<span>{progressPercentage}%</span>
								</div>
							</div>

							<div className='relative mt-4 h-2 w-full overflow-hidden rounded-full border border-gray-200 bg-white'>
								<div
									className='absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-primary-light to-primary/80 transition-all duration-500'
									style={{
										width: `${Math.min(progressPercentage, 100)}%`,
									}}
								/>
							</div>
						</header>

						<section className='mt-10 grid gap-6 rounded-2xl border border-gray-200 bg-gray-50 p-6'>
							<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
								<div>
									<p className='text-xs uppercase tracking-wide text-gray-500'>주문 번호</p>
									<div className='mt-1 flex items-center gap-3'>
										<span className='text-2xl font-semibold text-gray-900'>{currentOrder.orderId}</span>
										<button
											type='button'
											onClick={handleCopyOrderId}
											className='rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-500 transition-all hover:border-primary/50 hover:text-primary'
										>
											{copied ? "복사 완료!" : "복사"}
										</button>
									</div>
								</div>
								<div className='rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700'>
									<span className='text-gray-400 mr-2'>결제 예정 권수</span>
									<span>{currentOrder.quantity}권</span>
								</div>
							</div>

							{currentOrder.title && (
								<div className='rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 shadow-sm'>
									<p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>도서 정보</p>
									<p className='mt-1 line-clamp-2 text-base font-medium text-gray-900'>
										{currentOrder.title}
									</p>
								</div>
							)}

							<dl className='grid gap-3 sm:grid-cols-2'>
								<div className='rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-700 shadow-sm'>
									<dt className='font-semibold text-gray-900'>결제 단계 안내</dt>
									<dd className='mt-2 space-y-2 text-gray-600'>
										<p>1. 결제 완료하기 버튼을 누르면 결제가 확정됩니다.</p>
										<p>2. 여러 주문이 있다면 다음 주문 페이지로 자동 이동합니다.</p>
										<p>3. 모든 결제 완료 후 완료 페이지에서 결과를 확인하세요.</p>
									</dd>
								</div>
								<div className='rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm text-gray-700 shadow-sm'>
									<dt className='font-semibold text-gray-700'>주의 사항</dt>
									<dd className='mt-2 space-y-2'>
										<p>• 브라우저 새로고침 시 결제가 중단될 수 있습니다.</p>
										<p>• 다른 창에서 이동한 경우, 다시 장바구니에서 결제를 진행해주세요.</p>
										<p>• 결제가 정상적으로 처리되지 않으면 고객센터로 문의 바랍니다.</p>
									</dd>
								</div>
							</dl>

							{remainingCount > 1 && (
								<div className='rounded-2xl border border-gray-200 bg-white px-4 py-5 shadow-sm'>
									<div className='flex items-center justify-between mb-3'>
										<p className='text-sm font-semibold text-gray-900'>대기 중인 나머지 주문</p>
										<span className='rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-500'>
											{remainingCount - 1}개
										</span>
									</div>
									<div className='space-y-2 text-sm text-gray-600'>
										{pendingOrders
											.filter((order) => String(order.orderId) !== String(currentOrder.orderId))
											.map((order) => (
												<div
													key={order.orderId}
													className='flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-3 py-2'
												>
													<span className='font-medium'>주문번호 {order.orderId}</span>
													<span className='font-semibold text-gray-700'>{order.quantity}권</span>
												</div>
											))}
									</div>
								</div>
							)}
						</section>

						{error && (
							<div className='mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600'>
								<div className='flex items-center gap-2 font-semibold'>
									<span>⚠️</span>
									<span>결제 확인 실패</span>
								</div>
								<p className='mt-1'>{error}</p>
							</div>
						)}

						<footer className='mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end'>
							<button
								onClick={() => navigate("/cart")}
								className='w-full sm:w-auto rounded-2xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100 disabled:opacity-50'
								disabled={processing}
							>
								장바구니로 돌아가기
							</button>
							<button
								onClick={handleConfirm}
								disabled={processing}
								className='w-full sm:w-auto rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-primary-dark disabled:opacity-50 disabled:shadow-none'
							>
								{processing ? "결제를 확인하는 중..." : "결제 완료하기"}
							</button>
						</footer>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PayPage;


