// src/app/(main)/community/[groupId]/page.tsx
"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchPosts } from "@/lib/api/post";
import { fetchGroupMembers } from "@/lib/api/group";
import PostList from "@/components/community/PostList";
import CreatePostForm from "@/components/community/CreatePostForm";
import JoinLeaveButton from "@/components/community/JoinLeaveButton";
import { useAuthStore } from "@/store/authStore";
import { Post } from "@/lib/types/post";

export default function GroupDetailPage({ params }: { params: { groupId: string } }) {
	const groupId = parseInt(params.groupId, 10);
	const { isAuthenticated } = useAuthStore();
	const router = useRouter();
	const [posts, setPosts] = useState<Post[]>([]);
	const [isMember, setIsMember] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/auth/signin");
			return;
		}

		const fetchData = async () => {
			try {
				const [fetchedPosts, membership] = await Promise.all([
					fetchPosts(groupId),
					fetchGroupMembers(groupId),
				]);
				setPosts(fetchedPosts);
				setIsMember(membership);
			} catch (error) {
				setPosts([]);
				setIsMember(false);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [groupId, isAuthenticated, router]);

	if (loading) {
		return <div className='min-h-screen p-6'>로딩 중...</div>;
	}

	return (
		<div className='min-h-screen p-6'>
			<section className='text-center'>
				<h1 className='text-3xl font-bold text-stateBlue mb-4'>그룹 상세</h1>
				{<JoinLeaveButton groupId={groupId} isMember={isMember} />}
			</section>

			{isMember && (
				<section className='mt-6'>
					<CreatePostForm groupId={groupId} onPostCreated={(post) => setPosts([post, ...posts])} />
					<PostList initialPosts={posts} />
				</section>
			)}
		</div>
	);
}
