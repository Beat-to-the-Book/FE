"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api/axios";
import { signinSchema, SigninFormData } from "@/lib/validation/authSchema";
import { ZodError } from "zod";
import { useAuthStore } from "@/store/authStore";
import Link from "next/link";

export default function SignIn() {
	const router = useRouter();
	const setToken = useAuthStore((state) => state.setToken);
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

			const response = await api.post("/auth/signin", formData);
			const { token } = response.data;
			setToken(token); // Zustand에 토큰 저장
			router.push("/");
		} catch (error) {
			if (error instanceof ZodError) {
				const fieldErrors = error.flatten().fieldErrors;
				setErrors({
					userId: fieldErrors.userId?.[0],
					password: fieldErrors.password?.[0],
				});
			} else {
				console.error("로그인 실패:", error);
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
