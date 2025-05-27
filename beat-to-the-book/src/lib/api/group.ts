// src/lib/api/group.ts
import axios from "./axios";
import { Group } from "@/lib/types/group";

export const fetchGroups = async (): Promise<Group[]> => {
	const response = await axios.get("/groups");
	return response.data;
};

export const fetchMyGroups = async (): Promise<Group[]> => {
	const response = await axios.get("/groups/my");
	return response.data;
};

export const createGroup = async (groupName: string): Promise<Group> => {
	const response = await axios.post("/groups", { name: groupName });
	return response.data;
};

export const joinGroup = async (groupId: number): Promise<void> => {
	await axios.post(`/groups/${groupId}/members/join`);
};

export const leaveGroup = async (groupId: number): Promise<void> => {
	await axios.delete(`/groups/${groupId}/members/leave`);
};

export const fetchGroupMembers = async (groupId: number): Promise<string[]> => {
	const response = await axios.get(`/groups/${groupId}/members`);
	return response.data;
};

export const kickUserFromGroup = async (groupId: number, targetUserId: string): Promise<void> => {
	await axios.delete(`/groups/${groupId}/members/kick/${targetUserId}`);
};

export const transferGroupOwnership = async (
	groupId: number,
	newOwnerId: string
): Promise<void> => {
	await axios.post(`/groups/${groupId}/members/transfer/${newOwnerId}`);
};
