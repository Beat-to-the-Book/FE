import { privateApi } from "./axios";

export const groupAPI = {
	create: (data) => privateApi.post("/groups", data),

	join: (groupId) => privateApi.post(`/groups/${groupId}/members/join`),

	leave: (groupId) => privateApi.delete(`/groups/${groupId}/members/leave`),

	getMembers: (groupId) => privateApi.get(`/groups/${groupId}/members`),

	delegateLeader: (groupId, targetUserId) =>
		privateApi.post(`/groups/${groupId}/members/transfer/${targetUserId}`),

	kickMember: (groupId, targetUserId) =>
		privateApi.delete(`/groups/${groupId}/members/kick/${targetUserId}`),

	getMyGroups: () => privateApi.get("/groups/my"),

	getAllGroups: () => privateApi.get("/groups"),
};
