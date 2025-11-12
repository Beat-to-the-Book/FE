import { privateApi } from "./axios";

export const communityAPI = {
	createPost: (groupId, data) => privateApi.post(`/community/${groupId}/posts`, data),
	updatePost: (groupId, postId, data) =>
		privateApi.put(`/community/${groupId}/posts/${postId}`, data),
	deletePost: (groupId, postId) => privateApi.delete(`/community/${groupId}/posts/${postId}`),
	getPosts: (groupId) => privateApi.get(`/community/${groupId}/posts`),
	getPost: (groupId, postId) => privateApi.get(`/community/${groupId}/posts/${postId}`),
	getCommentsTree: (groupId, postId) =>
		privateApi.get(`/groups/${groupId}/posts/${postId}/comments/tree`),
	getCommentsFlat: (groupId, postId) =>
		privateApi.get(`/groups/${groupId}/posts/${postId}/comments/flat`),
	createComment: (groupId, postId, data) =>
		privateApi.post(`/groups/${groupId}/posts/${postId}/comments`, data),
	createReply: (groupId, postId, data) =>
		privateApi.post(`/groups/${groupId}/posts/${postId}/comments/reply`, data),
	updateComment: (groupId, postId, commentId, data) =>
		privateApi.put(`/groups/${groupId}/posts/${postId}/comments/${commentId}`, data),
	deleteComment: (groupId, postId, commentId) =>
		privateApi.delete(`/groups/${groupId}/posts/${postId}/comments/${commentId}`),
};
