// src/components/community/PostItem.tsx
"use client";
import { Post } from "@/lib/types/post";
import { deletePost } from "@/lib/api/post";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/lib/api/utils";

interface PostItemProps {
	post: Post;
	userId: string; // 클라이언트 UI용, 삭제 권한은 canDelete로 확인
	onDelete: (postId: number) => void;
}

export default function PostItem({ post, onDelete }: PostItemProps) {
	const { token } = useAuthStore();

	const handleDelete = async () => {
		if (!token) {
			alert("로그인이 필요합니다.");
			return;
		}

		try {
			await deletePost(post.id, token);
			onDelete(post.id);
		} catch (error) {
			alert("게시글 삭제 실패");
			handleApiError(error);
		}
	};

	return (
		<div className='bg-white shadow-md rounded-lg p-4 mb-4'>
			<p className='text-gray-700'>{post.content}</p>
			<p className='text-sm text-gray'>작성자: {post.userId}</p>
			<p className='text-sm text-gray'>작성일: {new Date(post.createdAt).toLocaleDateString()}</p>
			{post.canDelete && (
				<button onClick={handleDelete} className='text-red-500 hover:underline mt-2'>
					삭제
				</button>
			)}
		</div>
	);
}
