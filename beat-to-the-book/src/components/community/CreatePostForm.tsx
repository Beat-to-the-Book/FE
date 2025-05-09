// src/components/community/CreatePostForm.tsx
"use client";
import { useState } from "react";
import { createPost } from "@/lib/api/post";
import { Post } from "@/lib/types/post";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/lib/api/utils";

interface CreatePostFormProps {
	groupId: number;
	onPostCreated: (post: Post) => void;
}

export default function CreatePostForm({ groupId, onPostCreated }: CreatePostFormProps) {
	const user = useAuthStore((s) => s.user);
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!content.trim()) {
			setError("내용을 입력해주세요.");
			return;
		}
		if (!user) {
			setError("로그인이 필요합니다.");
			return;
		}

		setIsSubmitting(true);
		try {
			setError(null);
			const post = await createPost({ groupId, content });
			onPostCreated(post);
			setContent("");
		} catch (e: any) {
			setError("게시글 작성 실패");
			handleApiError(e);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='mb-6'>
			<textarea
				value={content}
				onChange={(e) => setContent(e.target.value)}
				placeholder='게시글 내용을 입력하세요...'
				className='w-full p-2 border border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-forestGreen'
				rows={4}
			/>
			{error && <p className='text-red-500 text-sm mb-2'>{error}</p>}
			<button
				type='submit'
				disabled={isSubmitting}
				className='mt-2 bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen disabled:opacity-50'
			>
				게시글 작성
			</button>
		</form>
	);
}
