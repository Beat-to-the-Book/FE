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
		<div className='min-h-screen flex items-center justify-center p-4'>
			<div className='w-full max-w-md'>
				<div className='bg-white rounded-2xl shadow-xl p-8 space-y-6'>
					<div className='text-center'>
						<h2 className='text-3xl font-bold text-primary'>회원가입</h2>
						<p className='mt-2 text-gray-600'>새로운 계정을 만들어보세요</p>
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
							<label htmlFor='username' className='block text-sm font-medium text-gray-700'>
								이름
							</label>
							<input
								id='username'
								name='username'
								type='text'
								required
								className='mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-colors'
								placeholder='이름을 입력하세요'
								value={formData.username}
								onChange={handleChange}
							/>
						</div>

						<div>
							<label htmlFor='email' className='block text-sm font-medium text-gray-700'>
								이메일
							</label>
							<input
								id='email'
								name='email'
								type='email'
								required
								className='mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-light focus:border-primary-light transition-colors'
								placeholder='이메일을 입력하세요'
								value={formData.email}
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
							회원가입
						</button>
					</form>

					<div className='text-center'>
						<p className='text-sm text-gray-600'>
							이미 계정이 있으신가요?{" "}
							<Link
								to='/login'
								className='font-medium text-primary hover:text-primary-dark transition-colors'
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
