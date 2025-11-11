import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

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

const PaySuccessPage = () => {
	const navigate = useNavigate();

	const completedOrders = useMemo(
		() => parseStoredJSON(sessionStorage.getItem("completedOrders"), []),
		[]
	);

	useEffect(() => {
		sessionStorage.removeItem("pendingOrders");
	}, []);

	const totalQuantity = completedOrders.reduce(
		(sum, order) => sum + (Number(order.quantity) || 0),
		0
	);

	const milestoneMessages = completedOrders
		.map((order) => order.milestone)
		.filter(Boolean)
		.map((milestone, index) => {
			const parts = [`총 ${milestone.totalBooks}권 달성`];
			if (milestone.awarded && milestone.awarded > 0) {
				parts.push(`추가 포인트 ${milestone.awarded}P 획득`);
			}
			if (typeof milestone.totalPoints === "number") {
				parts.push(`누적 포인트 ${milestone.totalPoints}P`);
			}
			return `${index + 1}. ${parts.join(" · ")}`;
		});

	const handleGoHome = () => {
		sessionStorage.removeItem("completedOrders");
		navigate("/");
	};

	const handleGoMyPage = () => {
		sessionStorage.removeItem("completedOrders");
		navigate("/mypage");
	};

	if (completedOrders.length === 0) {
		return (
			<div className='max-w-2xl mx-auto px-4 py-16'>
				<div className='bg-white border border-gray-200 rounded-3xl p-10 text-center shadow-xl'>
					<h1 className='text-2xl font-bold text-gray-900 mb-3'>결제 정보가 없습니다</h1>
					<p className='text-gray-600 mb-8'>결제 세션이 만료되었거나 직접 접근한 페이지입니다.</p>
					<button
						onClick={handleGoHome}
						className='px-6 py-3 rounded-xl bg-primary text-white font-semibold hover:bg-primary-dark transition-all shadow-md hover:shadow-lg'
					>
						홈으로 이동
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-3xl mx-auto px-4 py-16'>
			<div className='bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden'>
				<div className='bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 text-white px-8 py-10'>
					<p className='text-sm font-medium opacity-80'>결제가 성공적으로 완료되었습니다.</p>
					<h1 className='mt-2 text-3xl font-bold tracking-tight'>감사합니다!</h1>
					<p className='mt-3 text-emerald-200'>
						총 <span className='font-semibold text-white'>{totalQuantity}권</span>의 도서를 결제했습니다.
					</p>
				</div>

				<div className='px-8 py-10 space-y-8'>
					<div className='rounded-2xl border border-gray-200 bg-gray-50 p-6'>
						<h2 className='text-lg font-semibold text-gray-800 mb-4'>결제한 주문</h2>
						<ul className='space-y-3 text-sm text-gray-700'>
							{completedOrders.map((order) => (
								<li
									key={order.orderId}
									className='flex flex-col gap-1 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm'
								>
									<div className='flex justify-between'>
										<span className='font-semibold text-gray-900'>주문번호 {order.orderId}</span>
										<span className='font-medium text-primary'>{order.quantity}권</span>
									</div>
									{order.title && (
										<p className='text-gray-600 text-sm line-clamp-2'>{order.title}</p>
									)}
								</li>
							))}
						</ul>
					</div>

					{milestoneMessages.length > 0 && (
						<div className='rounded-2xl border border-primary/30 bg-primary/5 p-6'>
							<h2 className='text-lg font-semibold text-primary mb-3'>마일스톤 보상</h2>
							<ul className='space-y-2 text-sm text-primary-dark'>
								{milestoneMessages.map((message) => (
									<li key={message} className='px-4 py-2 rounded-xl bg-white/60 shadow-sm'>
										{message}
									</li>
								))}
							</ul>
						</div>
					)}

					<div className='flex flex-col gap-3 sm:flex-row sm:justify-end'>
						<button
							onClick={handleGoHome}
							className='w-full sm:w-auto rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-100'
						>
							홈으로 이동
						</button>
						<button
							onClick={handleGoMyPage}
							className='w-full sm:w-auto rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-all hover:translate-y-[-1px] hover:bg-primary-dark hover:shadow-xl'
						>
							내 정보 확인하기
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PaySuccessPage;


