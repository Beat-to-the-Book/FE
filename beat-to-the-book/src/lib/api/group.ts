// src/lib/api/group.ts
import axios from "./axios";
import { Group } from "@/lib/types/group";
import { createAuthHeaders, handleApiError } from "./utils";

export const fetchGroups = async (): Promise<Group[]> => {
	try {
		const response = await axios.get("/groups");
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const fetchMyGroups = async (token: string): Promise<Group[]> => {
	try {
		const response = await axios.get("/groups/my", { headers: createAuthHeaders(token) });
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const createGroup = async (bookName: string, token: string): Promise<Group> => {
	try {
		const response = await axios.post(
			"/groups",
			{ bookName },
			{ headers: createAuthHeaders(token) }
		);
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const joinGroup = async (groupId: number, token: string): Promise<void> => {
	try {
		await axios.post(`/groups/${groupId}/members/join`, {}, { headers: createAuthHeaders(token) });
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const leaveGroup = async (groupId: number, token: string): Promise<void> => {
	try {
		await axios.delete(`/groups/${groupId}/members/leave`, { headers: createAuthHeaders(token) });
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const fetchGroupMembers = async (groupId: number, token?: string): Promise<string[]> => {
	try {
		const response = await axios.get(`/groups/${groupId}/members`, {
			headers: createAuthHeaders(token),
		});
		return response.data;
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const kickUserFromGroup = async (
	groupId: number,
	targetUserId: string,
	token: string
): Promise<void> => {
	try {
		await axios.delete(`/groups/${groupId}/members/kick/${targetUserId}`, {
			headers: createAuthHeaders(token),
		});
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};

export const transferGroupOwnership = async (
	groupId: number,
	newOwnerId: string,
	token: string
): Promise<void> => {
	try {
		await axios.post(
			`/groups/${groupId}/members/transfer/${newOwnerId}`,
			{},
			{ headers: createAuthHeaders(token) }
		);
	} catch (error) {
		handleApiError(error);
		throw error;
	}
};
