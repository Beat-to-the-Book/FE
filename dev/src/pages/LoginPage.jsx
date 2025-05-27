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
			const { token, userId } = response.data;
			setAuth(token, userId);
			navigate("/");
		} catch (_) {
			setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-2xl shadow-xl p-8 space-y-6'>
					<div className='text-center'>
						<h2 className='text-3xl font-bold text-primary'>로그인</h2>
						<p className='mt-2 text-gray-600'>도서관리 시스템에 오신 것을 환영합니다</p>
					</div>

					<form onSubmit={handleSubmit} className='space-y-4'>
						<div>
							<label htmlFor='userId' className='block text-sm font-medium text-gray-700'>
								아이디
							</label>
							<input
								id='userId'
								name='userId'
								type='text'
								required
								className='mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-colors'
								placeholder='아이디를 입력하세요'
								value={formData.userId}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor='password' className='block text-sm font-medium text-gray-700'>
								비밀번호
							</label>
							<input
								id='password'
								name='password'
								type='password'
								required
								className='mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-colors'
								placeholder='비밀번호를 입력하세요'
								value={formData.password}
								onChange={handleChange}
							/>
						</div>

						{error && <div className='text-red-500 text-sm text-center'>{error}</div>}

						<button
							type='submit'
							className='w-full py-3 px-4 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors duration-200'
						>
							로그인
						</button>
					</form>

					<div className='text-center'>
						<p className='text-sm text-gray-600'>
							계정이 없으신가요?{" "}
							<Link
								to='/signup'
								className='font-medium text-primary hover:text-primary-dark transition-colors'
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
