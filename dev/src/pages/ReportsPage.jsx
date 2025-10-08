import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportAPI } from "../lib/api/report";
import useAuthStore from "../lib/store/authStore";

const ReportsPage = () => {
	const navigate = useNavigate();
	const { isAuthenticated } = useAuthStore();
	const [reports, setReports] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("all"); // 'all' or 'my'

	useEffect(() => {
		const fetchReports = async () => {
			try {
				setLoading(true);
				let response;
				if (activeTab === "my" && isAuthenticated) {
					// 본인 독후감 조회
					response = await reportAPI.getMyReports();
				} else {
					// 공개 독후감 조회
					response = await reportAPI.getPublicReports();
				}
				setReports(response.data);
				setError("");
			} catch (error) {
				console.error("독후감 조회 에러:", error);
				if (error.response?.status === 401) {
					setError("로그인이 필요합니다.");
				} else {
					setError("독후감을 불러오는데 실패했습니다.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchReports();
	}, [activeTab, isAuthenticated]);

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary'></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-red-500'>{error}</div>
			</div>
		);
	}

	return (
		<div className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<div>
					<h1 className='text-3xl font-bold text-primary mb-2'>독후감</h1>
					<p className='text-gray-600'>
						다양한 사람들의 독서 경험을 공유하고 나만의 독후감을 작성해보세요
					</p>
				</div>
				{isAuthenticated && (
					<button
						onClick={() => navigate("/write-report")}
						className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
					>
						+ 독후감 작성
					</button>
				)}
			</div>

			{/* 탭 메뉴 */}
			<div className='flex border-b-2 border-gray-100 mb-8'>
				<button
					className={`px-6 py-3 font-semibold transition-all ${
						activeTab === "all"
							? "text-primary border-b-2 border-primary -mb-0.5"
							: "text-gray-500 hover:text-primary"
					}`}
					onClick={() => setActiveTab("all")}
				>
					전체 독후감
				</button>
				{isAuthenticated && (
					<button
						className={`px-6 py-3 font-semibold transition-all ${
							activeTab === "my"
								? "text-primary border-b-2 border-primary -mb-0.5"
								: "text-gray-500 hover:text-primary"
						}`}
						onClick={() => setActiveTab("my")}
					>
						내 독후감
					</button>
				)}
			</div>

			{/* 독후감 목록 */}
			<div className='space-y-4'>
				{reports.map((report) => (
					<div
						key={report.id}
						className='bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-primary-light/30 transform hover:-translate-y-1'
						onClick={() => navigate(`/reports/${report.id}`)}
					>
						<div className='flex justify-between items-start mb-4'>
							<div className='flex-1'>
								<div className='flex items-center gap-3 mb-3'>
									<h2 className='text-xl font-bold text-gray-900'>{report.bookTitle}</h2>
									{!report.publicVisible && (
										<span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600'>
											비공개
										</span>
									)}
								</div>
								<div className='flex items-center space-x-3 text-sm text-gray-500'>
									<div className='flex items-center'>
										<div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mr-1.5'>
											<span className='text-primary font-semibold text-xs'>
												{report.authorName[0]}
											</span>
										</div>
										<span className='font-medium'>{report.authorName}</span>
									</div>
									<span>•</span>
									<span>{new Date(report.createdAt).toLocaleDateString()}</span>
								</div>
							</div>
							<div className='text-yellow-500 text-lg'>
								{"★".repeat(report.rating)}
								{"☆".repeat(5 - report.rating)}
							</div>
						</div>
						<p className='text-gray-700 line-clamp-2 leading-relaxed'>{report.content}</p>
					</div>
				))}
				{reports.length === 0 && (
					<div className='text-center py-16'>
						<div className='w-20 h-20 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-4'>
							<svg
								className='w-10 h-10 text-gray-400'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
								/>
							</svg>
						</div>
						<p className='text-gray-600 text-lg'>
							{activeTab === "my" ? "작성한 독후감이 없습니다" : "등록된 독후감이 없습니다"}
						</p>
						<p className='text-gray-500 text-sm mt-2'>
							{activeTab === "my" && "첫 번째 독후감을 작성해보세요!"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
};

export default ReportsPage;
