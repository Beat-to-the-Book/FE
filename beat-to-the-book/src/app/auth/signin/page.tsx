// src/app/auth/signin/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signin } from "@/lib/api/auth";
import { signinSchema, SigninFormData } from "@/lib/validation/authSchema";
import { ZodError } from "zod";
import Link from "next/link";

export default function SignIn() {
	const router = useRouter();
	const [formData, setFormData] = useState<SigninFormData>({
		userId: "",
		password: "",
	});
	const [errors, setErrors] = useState<Partial<Record<keyof SigninFormData, string>>>({});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			signinSchema.parse(formData);
			setErrors({});
			await signin(formData);
			router.push("/");
		} catch (error) {
			if (error instanceof ZodError) {
				const fieldErrors = error.flatten().fieldErrors;
				setErrors({
					userId: fieldErrors.userId?.[0],
					password: fieldErrors.password?.[0],
				});
			} else {
				setErrors({ userId: "로그인에 실패했습니다. 다시 시도해주세요." });
			}
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center p-6'>
			<div className='bg-white shadow-md rounded-lg p-8 max-w-md w-full'>
				<h2 className='text-2xl font-bold text-stateBlue mb-6 text-center'>로그인</h2>
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
						로그인
					</button>
				</form>
				<Link
					href='/auth/signup'
					className='text-forestGreen hover:underline block text-center mt-4'
				>
					아직 계정이 없으신가요?
				</Link>
			</div>
		</div>
	);
}
