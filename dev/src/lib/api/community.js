import { privateApi } from "./axios";

export const communityAPI = {
	createPost: (groupId, data) => privateApi.post(`/community/${groupId}/posts`, data),
	updatePost: (groupId, postId, data) =>
		privateApi.put(`/community/${groupId}/posts/${postId}`, data),
	deletePost: (groupId, postId) => privateApi.delete(`/community/${groupId}/posts/${postId}`),
	getPosts: (groupId) => privateApi.get(`/community/${groupId}/posts`),
	getPost: (groupId, postId) => privateApi.get(`/community/${groupId}/posts/${postId}`),
};
