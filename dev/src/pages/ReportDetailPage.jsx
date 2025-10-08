import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reportAPI } from "../lib/api/report";
import useAuthStore from "../lib/store/authStore";
import EditReportModal from "../components/EditReportModal";

const ReportDetailPage = () => {
	const { reportId } = useParams();
	const navigate = useNavigate();
	const { isAuthenticated, userId } = useAuthStore();
	const [report, setReport] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isAuthor, setIsAuthor] = useState(false);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);

	useEffect(() => {
		const fetchReport = async () => {
			try {
				setLoading(true);
				// 로그인한 사용자의 경우 본인 독후감 목록 조회
				if (isAuthenticated) {
					try {
						const myReportsResponse = await reportAPI.getMyReports();
						const myReports = myReportsResponse.data;
						// 본인 독후감 중 현재 보고 있는 독후감이 있는지 확인
						const myReport = myReports.find((report) => report.id === parseInt(reportId));
						if (myReport) {
							setReport(myReport);
							setIsAuthor(true);
							setError("");
							return;
						}
					} catch (error) {
						console.error("본인 독후감 조회 에러:", error);
					}
				}

				// 본인 독후감이 아닌 경우 공개 독후감 조회
				try {
					const publicResponse = await reportAPI.getPublicReport(reportId);
					setReport(publicResponse.data);
					setError("");
				} catch (error) {
					if (error.response?.status === 404) {
						setError("존재하지 않는 독후감입니다.");
					} else {
						setError("독후감을 불러오는데 실패했습니다.");
					}
				}
			} catch (error) {
				console.error("독후감 조회 에러:", error);
				setError("독후감을 불러오는데 실패했습니다.");
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

	const handleEditSuccess = async () => {
		try {
			// 독후감 정보 새로고침
			if (isAuthor) {
				const myReportsResponse = await reportAPI.getMyReports();
				const myReports = myReportsResponse.data;
				const updatedReport = myReports.find((report) => report.id === parseInt(reportId));
				if (updatedReport) {
					setReport(updatedReport);
					return;
				}
			}
			const response = await reportAPI.getPublicReport(reportId);
			setReport(response.data);
		} catch (error) {
			console.error("독후감 새로고침 에러:", error);
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
			<div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100'>
				{/* 헤더 */}
				<div className='flex justify-between items-start mb-6'>
					<div className='flex-1'>
						<div className='flex items-center gap-3 mb-4'>
							<h1 className='text-3xl font-bold text-gray-900'>{report.bookTitle}</h1>
							{!report.publicVisible && (
								<span className='inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-600'>
									비공개
								</span>
							)}
						</div>
						<div className='flex items-center space-x-3 text-sm text-gray-500'>
							<div className='flex items-center'>
								<div className='w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mr-2'>
									<span className='text-primary font-semibold text-xs'>{report.authorName[0]}</span>
								</div>
								<span className='font-medium'>{report.authorName}</span>
							</div>
							<span>•</span>
							<span>{new Date(report.createdAt).toLocaleDateString()}</span>
						</div>
					</div>
					{isAuthor && (
						<div className='flex space-x-2'>
							<button
								onClick={() => setIsEditModalOpen(true)}
								className='px-4 py-2 text-primary hover:bg-primary/10 rounded-lg font-medium transition-all'
							>
								수정
							</button>
							<button
								onClick={handleDelete}
								className='px-4 py-2 text-red-500 hover:bg-red-50 rounded-lg font-medium transition-all'
							>
								삭제
							</button>
						</div>
					)}
				</div>

				{/* 평점 */}
				<div className='mb-6 pb-6 border-b border-gray-100'>
					<div className='inline-flex items-center gap-3 bg-yellow-50 px-4 py-2 rounded-lg'>
						<div className='text-yellow-500 text-2xl'>
							{"★".repeat(report.rating)}
							{"☆".repeat(5 - report.rating)}
						</div>
						<span className='text-gray-700 font-semibold'>{report.rating}.0</span>
					</div>
				</div>

				{/* 내용 */}
				<div className='prose max-w-none mb-8'>
					<p className='text-gray-700 whitespace-pre-wrap leading-relaxed text-lg'>
						{report.content}
					</p>
				</div>

				{/* 하단 버튼 */}
				<div className='pt-6 border-t border-gray-100'>
					<button
						onClick={() => navigate("/reports")}
						className='inline-flex items-center text-primary hover:text-primary-light font-medium transition-all'
					>
						<svg className='w-5 h-5 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M10 19l-7-7m0 0l7-7m-7 7h18'
							/>
						</svg>
						독후감 목록으로 돌아가기
					</button>
				</div>
			</div>

			{/* 수정 모달 */}
			<EditReportModal
				isOpen={isEditModalOpen}
				onClose={() => setIsEditModalOpen(false)}
				report={report}
				onSuccess={handleEditSuccess}
			/>
		</div>
	);
};

export default ReportDetailPage;
