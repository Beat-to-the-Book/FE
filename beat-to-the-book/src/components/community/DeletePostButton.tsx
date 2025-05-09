// src/components/community/DeletePostButton.tsx
"use client";
import { useRouter } from "next/navigation";
import { deletePost } from "@/lib/api/post";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/lib/api/utils";

interface DeletePostButtonProps {
	postId: number;
}

export default function DeletePostButton({ postId }: DeletePostButtonProps) {
	const router = useRouter();
	const user = useAuthStore((s) => s.user);

	const handleDelete = async () => {
		if (!user) {
			alert("로그인이 필요합니다.");
			router.push("/auth/signin");
			return;
		}
		if (!confirm("게시글을 삭제하시겠습니까?")) return;

		try {
			await deletePost(postId);
			router.refresh();
		} catch (e: any) {
			alert("게시글 삭제 실패");
			handleApiError(e, router);
		}
	};

	return (
		<button onClick={handleDelete} className='mt-2 text-red-500 hover:underline'>
			삭제
		</button>
	);
}
