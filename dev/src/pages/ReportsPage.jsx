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
	const [activeTab, setActiveTab] = useState("public");

	useEffect(() => {
		const fetchReports = async () => {
			try {
				setLoading(true);
				const response = await reportAPI.getPublicReports();
				setReports(response.data);
				setLoading(false);
			} catch (error) {
				setError("독후감을 불러오는데 실패했습니다.");
				setLoading(false);
			}
		};

		fetchReports();
	}, []);

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
		<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='flex justify-between items-center mb-8'>
				<h1 className='text-3xl font-bold text-gray-900'>독후감</h1>
				{isAuthenticated && (
					<button
						onClick={() => navigate("/write-report")}
						className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors'
					>
						독후감 작성하기
					</button>
				)}
			</div>

			{/* 탭 메뉴 */}
			<div className='flex border-b mb-8'>
				<button
					className={`px-4 py-2 font-semibold ${
						activeTab === "public"
							? "text-primary border-b-2 border-primary"
							: "text-gray-500 hover:text-primary"
					}`}
					onClick={() => setActiveTab("public")}
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
						className='bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer'
						onClick={() => navigate(`/reports/${report.id}`)}
					>
						<div className='flex justify-between items-start mb-4'>
							<div>
								<p className='text-gray-600'>{report.bookTitle}</p>
							</div>
							<span className='text-sm text-gray-500'>
								{new Date(report.createdAt).toLocaleDateString()}
							</span>
						</div>
						<p className='text-gray-700 line-clamp-2'>{report.content}</p>
						<div className='mt-2 flex items-center space-x-2'>
							<div className='text-yellow-500'>
								{"★".repeat(report.rating)}
								{"☆".repeat(5 - report.rating)}
							</div>
							<span className='text-sm text-gray-500'>{report.rating}점</span>
							<span className='text-sm text-gray-500'>작성자: {report.authorName}</span>
							{!report.publicVisible && (
								<span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded'>비공개</span>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default ReportsPage;
