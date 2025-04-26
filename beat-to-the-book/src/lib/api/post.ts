// src/lib/api/post.ts
import axios from "./axios";
import { Post } from "@/lib/types/post";
import { createAuthHeaders, handleApiError } from "./utils";

export const fetchPosts = async (groupId: number, token?: string): Promise<Post[]> => {
	try {
		const response = await axios.get(`/posts`, {
			params: { groupId },
			headers: createAuthHeaders(token),
		});
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const fetchPostById = async (postId: number, token?: string): Promise<Post> => {
	try {
		const response = await axios.get(`/posts/${postId}`, { headers: createAuthHeaders(token) });
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const createPost = async (
	data: { groupId: number; content: string },
	token: string
): Promise<Post> => {
	try {
		const response = await axios.post(`/posts`, data, { headers: createAuthHeaders(token) });
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const deletePost = async (postId: number, token: string): Promise<void> => {
	try {
		await axios.delete(`/posts/${postId}`, { headers: createAuthHeaders(token) });
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const updatePost = async (
	postId: number,
	data: { title: string; content: string },
	token: string
): Promise<Post> => {
	try {
		const response = await axios.put(`/posts/${postId}`, data, {
			headers: createAuthHeaders(token),
		});
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};
