// src/lib/api/auth.ts
import axios from "./axios";
import { useAuthStore } from "@/store/authStore";
import { SigninFormData, SignupFormData } from "@/lib/validation/authSchema";

export const signin = async (data: SigninFormData) => {
	await axios.post("/auth/login", data);
	// 로그인 직후 사용자 정보 조회
	const userRes = await axios.get("/auth/me");
	useAuthStore.getState().setUser(userRes.data);
};

export const signup = async (data: SignupFormData) => {
	const response = await axios.post("/auth/register", data);
	return response.data;
};

export const logout = async () => {
	await axios.post("/auth/logout");
	useAuthStore.getState().clearUser();
};
