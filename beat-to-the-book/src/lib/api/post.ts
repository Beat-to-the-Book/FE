// src/lib/api/post.ts
import axios from "./axios";
import { Post } from "@/lib/types/post";

export const fetchPosts = async (groupId: number): Promise<Post[]> => {
	const response = await axios.get("/posts", { params: { groupId } });
	return response.data;
};

export const fetchPostById = async (postId: number): Promise<Post> => {
	const response = await axios.get(`/posts/${postId}`);
	return response.data;
};

export const createPost = async (data: { groupId: number; content: string }): Promise<Post> => {
	const response = await axios.post("/posts", data);
	return response.data;
};

// TODO: groupId를 넣어야 하는지 확인, 백엔드 API 문서에 없음

export const deletePost = async (postId: number): Promise<void> => {
	await axios.delete(`/posts/${postId}`);
};

export const updatePost = async (
	postId: number,
	data: { title: string; content: string }
): Promise<Post> => {
	const response = await axios.put(`/posts/${postId}`, data);
	return response.data;
};
