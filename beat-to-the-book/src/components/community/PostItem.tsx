// src/components/community/PostItem.tsx
"use client";
import { Post } from "@/lib/types/post";
import { deletePost } from "@/lib/api/post";
import { useAuthStore } from "@/store/authStore";
import { handleApiError } from "@/lib/api/utils";

interface PostItemProps {
	post: Post;
	onDelete: (postId: number) => void;
}

export default function PostItem({ post, onDelete }: PostItemProps) {
	const user = useAuthStore((s) => s.user);

	const handleDelete = async () => {
		if (!user) {
			alert("로그인이 필요합니다.");
			return;
		}
		try {
			await deletePost(post.id);
			onDelete(post.id);
		} catch (e: any) {
			alert("게시글 삭제 실패");
			handleApiError(e);
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
