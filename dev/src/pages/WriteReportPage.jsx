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
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<p className='text-lg text-gray-700 mb-4'>독후감을 작성하려면 로그인이 필요합니다.</p>
					<button
						onClick={() => navigate("/login")}
						className='bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors'
					>
						로그인하기
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className='max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
			<h1 className='text-3xl font-bold text-gray-900 mb-8'>독후감 작성</h1>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{!bookId && (
					<div>
						<label htmlFor='bookId' className='block text-sm font-medium text-gray-700 mb-1'>
							책 ID
						</label>
						<input
							type='number'
							id='bookId'
							name='bookId'
							value={formData.bookId}
							onChange={handleChange}
							required
							className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
						/>
					</div>
				)}

				<div>
					<label htmlFor='content' className='block text-sm font-medium text-gray-700 mb-1'>
						내용
					</label>
					<textarea
						id='content'
						name='content'
						value={formData.content}
						onChange={handleChange}
						required
						rows={10}
						className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
					/>
				</div>

				<div>
					<label htmlFor='rating' className='block text-sm font-medium text-gray-700 mb-1'>
						평점
					</label>
					<select
						id='rating'
						name='rating'
						value={formData.rating}
						onChange={handleChange}
						required
						className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary'
					>
						{[1, 2, 3, 4, 5].map((rating) => (
							<option key={rating} value={rating}>
								{rating}점
							</option>
						))}
					</select>
				</div>

				<div className='flex items-center'>
					<input
						type='checkbox'
						id='publicVisible'
						name='publicVisible'
						checked={formData.publicVisible}
						onChange={handleChange}
						className='h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded'
					/>
					<label htmlFor='publicVisible' className='ml-2 block text-sm text-gray-700'>
						공개하기
					</label>
				</div>

				{error && <p className='text-red-500 text-sm'>{error}</p>}

				<div className='flex justify-end space-x-4'>
					<button
						type='button'
						onClick={() => navigate(-1)}
						className='px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50'
					>
						취소
					</button>
					<button
						type='submit'
						disabled={loading}
						className='px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50'
					>
						{loading ? "작성 중..." : "작성하기"}
					</button>
				</div>
			</form>
		</div>
	);
};

export default WriteReportPage;
