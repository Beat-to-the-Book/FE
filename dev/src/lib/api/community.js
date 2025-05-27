import api from "./axios";

export const communityAPI = {
	createPost: (groupId, postData) => api.post(`/community/${groupId}/posts`, postData),

	updatePost: (groupId, postId, postData) =>
		api.put(`/community/${groupId}/posts/${postId}`, postData),

	deletePost: (groupId, postId) => api.delete(`/community/${groupId}/posts/${postId}`),

	getPosts: (groupId) => api.get(`/community/${groupId}/posts`),

	getPost: (groupId, postId) => api.get(`/community/${groupId}/posts/${postId}`),
};
