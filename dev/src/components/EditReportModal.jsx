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
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
			<div className='bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'>
				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-bold text-gray-900'>독후감 수정</h2>
					<button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
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
						<label className='block text-sm font-medium text-gray-700 mb-2'>평점</label>
						<select
							value={formData.rating}
							onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
							className='w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
						>
							{[5, 4, 3, 2, 1].map((rating) => (
								<option key={rating} value={rating}>
									{rating}점
								</option>
							))}
						</select>
					</div>

					<div>
						<label className='block text-sm font-medium text-gray-700 mb-2'>내용</label>
						<textarea
							value={formData.content}
							onChange={(e) => setFormData({ ...formData, content: e.target.value })}
							className='w-full h-48 border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary'
							required
						/>
					</div>

					<div className='flex items-center'>
						<input
							type='checkbox'
							id='publicVisible'
							checked={formData.publicVisible}
							onChange={(e) => setFormData({ ...formData, publicVisible: e.target.checked })}
							className='rounded border-gray-300 text-primary focus:ring-primary'
						/>
						<label htmlFor='publicVisible' className='ml-2 text-sm text-gray-600'>
							공개로 설정
						</label>
					</div>

					{error && <div className='text-red-500 text-sm'>{error}</div>}

					<div className='flex justify-end space-x-4'>
						<button
							type='button'
							onClick={onClose}
							className='px-4 py-2 text-gray-700 hover:text-gray-900'
						>
							취소
						</button>
						<button
							type='submit'
							disabled={loading}
							className='bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark disabled:opacity-50'
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
