// src/app/auth/signup/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signup } from "@/lib/api/auth";
import { signupSchema, SignupFormData } from "@/lib/validation/authSchema";
import { ZodError } from "zod";
import Link from "next/link";

export default function SignUp() {
	const router = useRouter();
	const [formData, setFormData] = useState<SignupFormData>({
		userId: "",
		email: "",
		password: "",
		username: "",
		role: "user",
	});
	const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			signupSchema.parse(formData);
			setErrors({});
			await signup(formData);
			router.push("/auth/signin");
		} catch (error) {
			if (error instanceof ZodError) {
				const fieldErrors = error.flatten().fieldErrors;
				setErrors({
					userId: fieldErrors.userId?.[0],
					username: fieldErrors.username?.[0],
					email: fieldErrors.email?.[0],
					password: fieldErrors.password?.[0],
				});
			} else {
				setErrors({ userId: "회원가입에 실패했습니다. 다시 시도해주세요." });
			}
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center p-6'>
			<div className='bg-white shadow-md rounded-lg p-8 max-w-md w-full'>
				<h2 className='text-2xl font-bold text-stateBlue mb-6 text-center'>회원가입</h2>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<input
							type='text'
							placeholder='아이디'
							value={formData.userId}
							onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
							className='w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-forestGreen'
						/>
						{errors.userId && <p className='text-red-500 text-sm mt-1'>{errors.userId}</p>}
					</div>
					<div>
						<input
							type='text'
							placeholder='이름'
							value={formData.username}
							onChange={(e) => setFormData({ ...formData, username: e.target.value })}
							className='w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-forestGreen'
						/>
						{errors.username && <p className='text-red-500 text-sm mt-1'>{errors.username}</p>}
					</div>
					<div>
						<input
							type='email'
							placeholder='이메일'
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
							className='w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-forestGreen'
						/>
						{errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
					</div>
					<div>
						<input
							type='password'
							placeholder='비밀번호'
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
							className='w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-forestGreen'
						/>
						{errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
					</div>
					<button
						type='submit'
						className='w-full bg-forestGreen text-white p-2 rounded-md hover:bg-everGreen'
					>
						회원가입
					</button>
				</form>
				<Link
					href='/auth/signin'
					className='text-forestGreen hover:underline block text-center mt-4'
				>
					이미 계정이 있으신가요?
				</Link>
			</div>
		</div>
	);
}
