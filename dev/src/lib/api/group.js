import api from "./axios";

export const groupAPI = {
	create: (name) => api.post("/groups", { name }),

	join: (groupId) => api.post(`/groups/${groupId}/members/join`),

	leave: (groupId) => api.delete(`/groups/${groupId}/members/leave`),

	getMembers: (groupId) => api.get(`/groups/${groupId}/members`),

	kickMember: (groupId, targetUserId) =>
		api.delete(`/groups/${groupId}/members/kick/${targetUserId}`),

	getMyGroups: () => api.get("/groups/my"),
};
