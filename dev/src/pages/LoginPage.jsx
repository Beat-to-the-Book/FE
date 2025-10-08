import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../lib/api/auth";
import useAuthStore from "../lib/store/authStore";

const LoginPage = () => {
	const navigate = useNavigate();
	const setAuth = useAuthStore((state) => state.setAuth);
	const [formData, setFormData] = useState({
		userId: "",
		password: "",
	});
	const [error, setError] = useState("");

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const response = await authAPI.login(formData);
			const { token } = response.data.data;
			setAuth(token, formData.userId);
			navigate("/");
		} catch (error) {
			setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center p-4 bg-gray-50'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6'>
					<div className='text-center space-y-2'>
						<div className='w-16 h-16 bg-primary rounded-2xl mx-auto flex items-center justify-center mb-4'>
							<svg
								className='w-8 h-8 text-primary-light'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth={2}
									d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
								/>
							</svg>
						</div>
						<h2 className='text-3xl font-bold text-primary'>로그인</h2>
						<p className='text-gray-600'>도서관리 시스템에 오신 것을 환영합니다</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-5'>
						<div>
							<label htmlFor='userId' className='block text-sm font-semibold text-gray-700 mb-2'>
								아이디
							</label>
							<input
								id='userId'
								name='userId'
								type='text'
								required
								className='block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all bg-gray-50 focus:bg-white'
								placeholder='아이디를 입력하세요'
								value={formData.userId}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-semibold text-gray-700 mb-2'>
								비밀번호
							</label>
							<input
								id='password'
								name='password'
								type='password'
								required
								className='block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all bg-gray-50 focus:bg-white'
								placeholder='비밀번호를 입력하세요'
								value={formData.password}
								onChange={handleChange}
							/>
						</div>

						{error && (
							<div className='bg-red-50 border border-red-200 text-red-600 text-sm text-center py-2 px-4 rounded-lg'>
								{error}
							</div>
						)}

						<button
							type='submit'
							className='w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
						>
							로그인
						</button>
					</form>

					<div className='relative'>
						<div className='absolute inset-0 flex items-center'>
							<div className='w-full border-t border-gray-200'></div>
						</div>
						<div className='relative flex justify-center text-sm'>
							<span className='px-4 bg-white text-gray-500'>또는</span>
						</div>
					</div>

					<div className='text-center'>
						<p className='text-sm text-gray-600'>
							계정이 없으신가요?{" "}
							<Link
								to='/signup'
								className='font-semibold text-primary hover:text-primary-light transition-colors'
							>
								회원가입
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
