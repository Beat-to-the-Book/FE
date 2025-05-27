import { publicApi, privateApi } from "./axios";

export const authAPI = {
	register: (userData) => publicApi.post("/auth/register", userData),

	login: (credentials) => publicApi.post("/auth/login", credentials),

	getMe: () => privateApi.get("/auth/me"),
};
