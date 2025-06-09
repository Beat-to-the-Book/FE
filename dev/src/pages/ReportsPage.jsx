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
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-900'>독후감</h1>
				{isAuthenticated && (
					<button
						onClick={() => navigate("/reports/write")}
						className='bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
					>
						독후감 작성
					</button>
				)}
			</div>

			{/* 탭 메뉴 */}
			<div className='flex border-b mb-6'>
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === "all"
							? "text-primary border-b-2 border-primary"
							: "text-gray-500 hover:text-primary"
					}`}
					onClick={() => setActiveTab("all")}
				>
					전체 독후감
				</button>
				{isAuthenticated && (
					<button
						className={`px-4 py-2 font-semibold ${
							activeTab === "my"
								? "text-primary border-b-2 border-primary"
								: "text-gray-500 hover:text-primary"
						}`}
						onClick={() => setActiveTab("my")}
					>
						내 독후감
					</button>
				)}
			</div>

			{/* 독후감 목록 */}
			<div className='space-y-6'>
				{reports.map((report) => (
					<div
						key={report.id}
						className='bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-shadow'
						onClick={() => navigate(`/reports/${report.id}`)}
					>
						<div className='flex justify-between items-start mb-4'>
							<div>
								<h2 className='text-xl font-semibold text-gray-900 mb-2'>{report.bookTitle}</h2>
								<div className='flex items-center space-x-4 text-sm text-gray-500'>
									<span>작성자: {report.authorName}</span>
									<span>작성일: {new Date(report.createdAt).toLocaleDateString()}</span>
									{!report.publicVisible && (
										<span className='bg-gray-100 px-2 py-1 rounded'>비공개</span>
									)}
								</div>
							</div>
							<div className='text-yellow-500'>
								{"★".repeat(report.rating)}
								{"☆".repeat(5 - report.rating)}
							</div>
						</div>
						<p className='text-gray-700 line-clamp-3'>{report.content}</p>
					</div>
				))}
				{reports.length === 0 && (
					<div className='text-center text-gray-500 py-8'>
						{activeTab === "my" ? "작성한 독후감이 없습니다." : "등록된 독후감이 없습니다."}
					</div>
				)}
			</div>
		</div>
	);
};

export default ReportsPage;
