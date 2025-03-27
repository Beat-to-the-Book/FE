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
			signinSchema.parse(formData); // 유효성 검사
			setErrors({});
			await signin(formData); // API 호출 및 Zustand 상태 설정
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
		<div>
			<div>
				<h2>로그인</h2>
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
							type='password'
							placeholder='비밀번호'
							value={formData.password}
							onChange={(e) => setFormData({ ...formData, password: e.target.value })}
						/>
						{errors.password && <p>{errors.password}</p>}
					</div>
					<button type='submit'>로그인</button>
				</form>
				<Link href='/auth/signup'>아직 계정이 없으신가요?</Link>
			</div>
		</div>
	);
}
