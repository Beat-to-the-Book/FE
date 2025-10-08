import { useState, useEffect } from "react";
import { reviewAPI } from "../lib/api/review";
import { useParams } from "react-router-dom";

const EditReviewModal = ({ isOpen, onClose, review, onSuccess }) => {
	const { bookId } = useParams();
	const [formData, setFormData] = useState({
		bookId: null,
		rating: 5,
		comment: "",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (review) {
			setFormData({
				bookId: parseInt(bookId),
				rating: review.rating,
				comment: review.comment,
			});
		}
	}, [review, bookId]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			await reviewAPI.update(review.reviewId, {
				bookId: parseInt(bookId),
				rating: formData.rating,
				comment: formData.comment,
			});
			onSuccess();
			onClose();
		} catch (error) {
			console.error("리뷰 수정 에러:", error);
			if (error.response?.status === 401) {
				setError("로그인이 만료되었습니다. 다시 로그인해주세요.");
			} else {
				setError("리뷰 수정에 실패했습니다.");
			}
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen || !review) return null;

	return (
		<div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
			<div className='bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl'>
				<div className='flex justify-between items-center mb-6'>
					<h2 className='text-2xl font-bold text-primary'>리뷰 수정</h2>
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
						<label className='block text-sm font-semibold text-gray-700 mb-2'>리뷰 내용</label>
						<textarea
							value={formData.comment}
							onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
							className='w-full h-48 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all resize-none'
							placeholder='리뷰 내용을 입력하세요'
							required
						/>
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

export default EditReviewModal;

// TODO: 리뷰 수정 적용 안 됨
