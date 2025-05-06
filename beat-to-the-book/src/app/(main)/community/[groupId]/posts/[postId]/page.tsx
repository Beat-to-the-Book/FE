// src/app/(main)/community/[groupId]/posts/[postId]/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchPostById } from "@/lib/api/post";
import { Post } from "@/lib/types/post";
import DeletePostButton from "@/components/community/DeletePostButton";

export default async function PostDetailPage({
	params,
}: {
	params: { groupId: string; postId: string };
}) {
	const groupId = parseInt(params.groupId, 10);
	const postId = parseInt(params.postId, 10);

	const authCookie = (await cookies()).get("auth-storage")?.value;
	if (!authCookie) {
		redirect("/auth/signin");
	}

	const { state } = JSON.parse(authCookie);
	const token = state.token as string | null;
	const isAuthenticated = state.isAuthenticated as boolean | null;

	if (!token || !isAuthenticated) {
		redirect("/auth/signin");
	}

	let post: Post;
	try {
		post = await fetchPostById(postId);
	} catch {
		return (
			<div className='min-h-screen flex items-center justify-center'>
				<p className='text-lg font-semibold'>게시글을 찾을 수 없습니다.</p>
				<Link href={`/community/${groupId}`} className='ml-4 text-forestGreen hover:underline'>
					그룹으로 돌아가기
				</Link>
			</div>
		);
	}

	return (
		<div className='min-h-screen p-6'>
			<section className='max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6'>
				<h1 className='text-2xl font-bold text-stateBlue mb-4'>게시글</h1>
				<p className='text-gray-700 mb-4'>{post.content}</p>
				<p className='text-sm text-gray'>작성자: {post.userId}</p>
				<p className='text-sm text-gray'>작성일: {new Date(post.createdAt).toLocaleDateString()}</p>

				{isAuthenticated && <DeletePostButton postId={post.id} groupId={groupId} />}
				<Link
					href={`/community/${groupId}`}
					className='mt-4 inline-block text-forestGreen hover:underline'
				>
					그룹으로 돌아가기
				</Link>
			</section>
		</div>
	);
}
