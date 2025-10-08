import { useState, useEffect } from "react";
import { reportAPI } from "../lib/api/report";

const EditReportModal = ({ isOpen, onClose, report, onSuccess }) => {
	const [formData, setFormData] = useState({
		content: "",
		rating: 5,
		publicVisible: true,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (report) {
			setFormData({
				content: report.content,
				rating: report.rating,
				publicVisible: report.publicVisible,
			});
		}
	}, [report]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await reportAPI.updateMyReport(report.id, formData);
			onSuccess();
			onClose();
		} catch (error) {
			console.error("독후감 수정 에러:", error);
			if (error.response?.status === 401) {
				setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
			} else {
				setError("독후감 수정에 실패했습니다.");
			}
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-bold text-primary'>독후감 수정</h2>
					<button
						onClick={onClose}
						className='text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-2 transition-all'
					>
						<svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M6 18L18 6M6 6l12 12'
							/>
						</svg>
					</button>
				</div>

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>평점</label>
						<select
							value={formData.rating}
							onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
							className='w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all'
						>
							{[5, 4, 3, 2, 1].map((rating) => (
								<option key={rating} value={rating}>
									{"★".repeat(rating)} {rating}점
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm font-semibold text-gray-700 mb-2'>내용</label>
						<textarea
							value={formData.content}
							onChange={(e) => setFormData({ ...formData, content: e.target.value })}
							className='w-full h-48 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all resize-none'
							placeholder='독후감 내용을 입력하세요'
							required
						/>
					</div>

					<div className='flex items-center bg-gray-50 p-4 rounded-xl'>
						<input
							type='checkbox'
							id='publicVisible'
							checked={formData.publicVisible}
							onChange={(e) => setFormData({ ...formData, publicVisible: e.target.checked })}
							className='w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary-light'
						/>
						<label htmlFor='publicVisible' className='ml-3 text-sm font-medium text-gray-700'>
							이 독후감을 공개합니다
						</label>
					</div>

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm'>
							{error}
						</div>
					)}

					<div className='flex justify-end space-x-3 pt-4 border-t border-gray-100'>
						<button
							type='button'
							onClick={onClose}
							className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
						>
							취소
						</button>
						<button
							type='submit'
							disabled={loading}
							className='bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all'
						>
							{loading ? "수정 중..." : "수정하기"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default EditReportModal;
