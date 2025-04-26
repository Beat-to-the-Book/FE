// src/app/(main)/community/create/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/lib/api/group";
import { ZodError } from "zod";
import { useAuthStore } from "@/store/authStore";

export default function CreateGroupPage() {
	const router = useRouter();
	const { token } = useAuthStore();
	const [formData, setFormData] = useState({ bookName: "" });
	const [error, setError] = useState<string | null>(null);

	if (!token) {
		router.push("/auth/signin");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			setError(null);
			await createGroup(formData.bookName, token);
			router.push("/community");
		} catch (error) {
			if (error instanceof ZodError) {
				setError(error.errors[0].message);
			} else {
				setError(error.message || "그룹 생성 실패");
			}
		}
	};

	return (
		<div className='min-h-screen flex items-center justify-center p-6'>
			<div className='bg-white shadow-md rounded-lg p-8 max-w-md w-full'>
				<h2 className='text-2xl font-bold text-stateBlue mb-6 text-center'>그룹 만들기</h2>
				<form onSubmit={handleSubmit} className='space-y-4'>
					<div>
						<input
							type='text'
							placeholder='책 이름'
							value={formData.bookName}
							onChange={(e) => setFormData({ ...formData, bookName: e.target.value })}
							className='w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-forestGreen'
						/>
						{error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
					</div>
					<button
						type='submit'
						className='w-full bg-forestGreen text-white p-2 rounded-md hover:bg-everGreen'
					>
						그룹 생성
					</button>
				</form>
			</div>
		</div>
	);
}
