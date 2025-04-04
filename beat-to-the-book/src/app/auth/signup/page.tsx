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
			signupSchema.parse(formData); // 유효성 검사
			setErrors({});
			await signup(formData); // API 호출
			router.push("/auth/signin");
		} catch (error) {
			if (error instanceof ZodError) {
				const fieldErrors = error.flatten().fieldErrors;
				setErrors({
					userId: fieldErrors.userId?.[0],
					username: fieldErrors.username?.[0],
					email: fieldErrors.email?.[0],
					password: fieldErrors.password?.[0],
					role: fieldErrors.role?.[0],
				});
			} else {
				setErrors({ userId: "회원가입에 실패했습니다. 다시 시도해주세요." });
			}
		}
	};

	return (
		<div>
			<div>
				<h2>회원가입</h2>
				<form onSubmit={handleSubmit}>
					<div>
						<input
							type='text'
							placeholder='아이디'
							value={formData.userId}
							onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
						/>
						{errors.userId && <p>{errors.userId}</p>}
						<input
							type='text'
							placeholder='이름'
							value={formData.username}
							onChange={(e) => setFormData({ ...formData, username: e.target.value })}
						/>
						{errors.username && <p>{errors.username}</p>}
						<input
							type='email'
							placeholder='이메일'
							value={formData.email}
							onChange={(e) => setFormData({ ...formData, email: e.target.value })}
						/>
						{errors.email && <p>{errors.email}</p>}
						<input
							type='password'
							placeholder='비밀번호'
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
						/>
						{errors.password && <p>{errors.password}</p>}
					</div>
					<button type='submit'>회원가입</button>
				</form>
				<Link href='/auth/signin'>이미 계정이 있으신가요?</Link>
			</div>
		</div>
	);
}
