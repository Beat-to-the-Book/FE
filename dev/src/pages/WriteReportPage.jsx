import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { reportAPI } from "../lib/api/report";
import useAuthStore from "../lib/store/authStore";

const WriteReportPage = () => {
	const navigate = useNavigate();
	const { bookId } = useParams();
	const { isAuthenticated } = useAuthStore();
	const [formData, setFormData] = useState({
		bookId: bookId || "",
		content: "",
		rating: 5,
		publicVisible: true,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!isAuthenticated) {
			navigate("/login");
			return;
		}

		try {
			setLoading(true);
			await reportAPI.create(formData);
			navigate("/reports");
		} catch (error) {
			setError("독후감 작성에 실패했습니다.");
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: type === "checkbox" ? checked : value,
		}));
	};

	if (!isAuthenticated) {
		return (
			<div className='flex items-center justify-center min-h-screen p-4'>
				<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center max-w-md'>
					<div className='w-20 h-20 bg-primary/10 rounded-full mx-auto flex items-center justify-center mb-6'>
						<svg
							className='w-10 h-10 text-primary'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth={2}
								d='M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z'
							/>
						</svg>
					</div>
					<h2 className='text-2xl font-bold text-gray-900 mb-2'>로그인이 필요합니다</h2>
					<p className='text-gray-600 mb-6'>독후감을 작성하려면 로그인이 필요합니다</p>
					<button
						onClick={() => navigate("/login")}
						className='w-full bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition-all font-semibold shadow-md hover:shadow-lg'
					>
						로그인하기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<div className='mb-8'>
				<h1 className='text-3xl font-bold text-primary mb-2'>독후감 작성</h1>
				<p className='text-gray-600'>책을 읽고 느낀 점을 자유롭게 작성해보세요</p>
			</div>

			<div className='bg-white rounded-2xl shadow-lg p-8 border border-gray-100'>
				<form onSubmit={handleSubmit} className='space-y-6'>
					{!bookId && (
						<div>
							<label htmlFor='bookId' className='block text-sm font-semibold text-gray-700 mb-2'>
								책 ID
							</label>
							<input
								type='number'
								id='bookId'
								name='bookId'
								value={formData.bookId}
								onChange={handleChange}
								required
								className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
								placeholder='책 ID를 입력하세요'
							/>
						</div>
					)}

					<div>
						<label htmlFor='content' className='block text-sm font-semibold text-gray-700 mb-2'>
							독후감 내용
						</label>
						<textarea
							id='content'
							name='content'
							value={formData.content}
							onChange={handleChange}
							required
							rows={12}
							className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all resize-none'
							placeholder='책을 읽고 느낀 점을 작성해주세요'
						/>
					</div>

					<div>
						<label htmlFor='rating' className='block text-sm font-semibold text-gray-700 mb-2'>
							평점
						</label>
						<select
							id='rating'
							name='rating'
							value={formData.rating}
							onChange={handleChange}
							required
							className='w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-light focus:ring-2 focus:ring-primary-light/20 transition-all'
						>
							{[5, 4, 3, 2, 1].map((rating) => (
								<option key={rating} value={rating}>
									{"★".repeat(rating)} {rating}점
								</option>
							))}
						</select>
					</div>

					<div className='flex items-center bg-gray-50 p-4 rounded-xl'>
						<input
							type='checkbox'
							id='publicVisible'
							name='publicVisible'
							checked={formData.publicVisible}
							onChange={handleChange}
							className='w-4 h-4 text-primary focus:ring-primary-light border-gray-300 rounded'
						/>
						<label htmlFor='publicVisible' className='ml-3 text-sm font-medium text-gray-700'>
							이 독후감을 공개합니다
						</label>
					</div>

					{error && (
						<div className='bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl'>
							{error}
						</div>
					)}

					<div className='flex justify-end space-x-3 pt-4 border-t border-gray-100'>
						<button
							type='button'
							onClick={() => navigate(-1)}
							className='px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-semibold transition-all'
						>
							취소
						</button>
						<button
							type='submit'
							disabled={loading}
							className='px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg transition-all'
						>
							{loading ? "작성 중..." : "작성하기"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default WriteReportPage;
