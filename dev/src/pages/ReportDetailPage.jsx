import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reportAPI } from "../lib/api/report";
import useAuthStore from "../lib/store/authStore";

const ReportDetailPage = () => {
	const { reportId } = useParams();
	const navigate = useNavigate();
	const { isAuthenticated, userId } = useAuthStore();
	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isAuthor, setIsAuthor] = useState(false);

	useEffect(() => {
		const fetchReport = async () => {
			try {
				setLoading(true);
				// 공개 독후감 조회
				const publicResponse = await reportAPI.getPublicReport(reportId);
				const publicReport = publicResponse.data;
				setReport(publicReport);

				// 로그인한 사용자의 경우 본인 독후감 목록 조회
				if (isAuthenticated) {
					try {
						const myReportsResponse = await reportAPI.getMyReports();
						const myReports = myReportsResponse.data;
						// 본인 독후감 중 현재 보고 있는 독후감이 있는지 확인
						const isMyReport = myReports.some((report) => report.id === parseInt(reportId));
						setIsAuthor(isMyReport);
					} catch (error) {
						console.error("본인 독후감 조회 에러:", error);
					}
				}

				setError("");
			} catch (error) {
				console.error("독후감 조회 에러:", error);
				if (error.response?.status === 404) {
					setError("존재하지 않는 독후감입니다.");
				} else {
					setError("독후감을 불러오는데 실패했습니다.");
				}
			} finally {
				setLoading(false);
			}
		};

		fetchReport();
	}, [reportId, isAuthenticated]);

	const handleDelete = async () => {
		if (!window.confirm("정말로 이 독후감을 삭제하시겠습니까?")) {
			return;
		}

		try {
			await reportAPI.deleteMyReport(reportId);
			alert("독후감이 삭제되었습니다.");
			navigate("/reports");
		} catch (error) {
			console.error("독후감 삭제 에러:", error);
			if (error.response?.status === 401) {
				alert("로그인이 필요합니다.");
				navigate("/login");
			} else if (error.response?.status === 403) {
				alert("삭제 권한이 없습니다.");
			} else {
				alert("독후감 삭제에 실패했습니다.");
			}
		}
	};

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

	if (!report) return null;

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='bg-white rounded-lg shadow-lg p-8'>
				{/* 헤더 */}
				<div className='flex justify-between items-start mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-gray-900 mb-2'>{report.bookTitle}</h1>
						<div className='flex items-center space-x-4 text-sm text-gray-500'>
							<span>작성자: {report.authorName}</span>
							<span>작성일: {new Date(report.createdAt).toLocaleDateString()}</span>
							{!report.publicVisible && (
								<span className='bg-gray-100 px-2 py-1 rounded'>비공개</span>
							)}
						</div>
					</div>
					{isAuthor && (
						<div className='flex space-x-2'>
							<button
								onClick={() => navigate(`/reports/${reportId}/edit`)}
								className='bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark'
							>
								수정
							</button>
							<button
								onClick={handleDelete}
								className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
							>
								삭제
							</button>
						</div>
					)}
				</div>

				{/* 평점 */}
				<div className='mb-6'>
					<div className='text-yellow-500 text-2xl'>
						{"★".repeat(report.rating)}
						{"☆".repeat(5 - report.rating)}
					</div>
					<span className='text-gray-600 ml-2'>{report.rating}점</span>
				</div>

				{/* 내용 */}
				<div className='prose max-w-none'>
					<p className='text-gray-700 whitespace-pre-wrap'>{report.content}</p>
				</div>

				{/* 하단 버튼 */}
				<div className='mt-8 flex justify-between'>
					<button
						onClick={() => navigate("/reports")}
						className='text-primary hover:text-primary-dark'
					>
						독후감 목록으로 돌아가기
					</button>
				</div>
			</div>
		</div>
	);
};

export default ReportDetailPage;
