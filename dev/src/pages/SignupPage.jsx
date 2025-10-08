import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authAPI } from "../lib/api/auth";

const SignupPage = () => {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		userId: "",
		username: "",
		email: "",
		password: "",
		role: "user", // 기본값
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
			await authAPI.register(formData);
			navigate("/login");
		} catch (_) {
			setError("회원가입에 실패했습니다. 다시 시도해주세요.");
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
									d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
								/>
							</svg>
						</div>
						<h2 className='text-3xl font-bold text-primary'>회원가입</h2>
						<p className='text-gray-600'>새로운 계정을 만들어보세요</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
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
							<label htmlFor='username' className='block text-sm font-semibold text-gray-700 mb-2'>
								이름
							</label>
							<input
								id='username'
								name='username'
								type='text'
								required
								className='block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all bg-gray-50 focus:bg-white'
								placeholder='이름을 입력하세요'
								value={formData.username}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-2'>
								이메일
							</label>
							<input
								id='email'
								name='email'
								type='email'
								required
								className='block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-light/50 focus:border-primary-light transition-all bg-gray-50 focus:bg-white'
								placeholder='이메일을 입력하세요'
								value={formData.email}
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
							회원가입
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
							이미 계정이 있으신가요?{" "}
							<Link
								to='/login'
								className='font-semibold text-primary hover:text-primary-light transition-colors'
							>
								로그인
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default SignupPage;
