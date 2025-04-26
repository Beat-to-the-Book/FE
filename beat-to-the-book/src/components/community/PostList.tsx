// src/components/community/PostList.tsx
"use client";
import { useState } from "react";
import { Post } from "@/lib/types/post";
import PostItem from "./PostItem";

interface PostListProps {
	initialPosts: Post[];
	userId: string;
}

export default function PostList({ initialPosts, userId }: PostListProps) {
	const [posts, setPosts] = useState<Post[]>(initialPosts);

	const handleDelete = (postId: number) => {
		setPosts(posts.filter((post) => post.id !== postId));
	};

	return (
		<div className='space-y-4'>
			{posts.length > 0 ? (
				posts.map((post) => (
					<PostItem key={post.id} post={post} userId={userId} onDelete={handleDelete} />
				))
			) : (
				<p className='text-gray'>게시글이 없습니다.</p>
			)}
		</div>
	);
}
