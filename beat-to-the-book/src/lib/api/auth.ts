// src/lib/api/auth.ts
import axios from "./axios";
import { useAuthStore } from "@/store/authStore";
import { SigninFormData, SignupFormData } from "@/lib/validation/authSchema";

export const signin = async (data: SigninFormData) => {
	const response = await axios.post("/auth/login", data);
	// JWT 토큰 저장
	useAuthStore.getState().setToken(response.data.token);
	// 로그인 직후 사용자 정보 조회
	await checkAuth();
};

export const signup = async (data: SignupFormData) => {
	const response = await axios.post("/auth/register", data);
	return response.data;
};

export const logout = async () => {
	await axios.post("/auth/logout");
	useAuthStore.getState().clearAuth();
};

export const checkAuth = async () => {
	try {
		const response = await axios.get("/auth/me");
		useAuthStore.getState().setUser(response.data.data);
	} catch (error) {
		console.error("인증 상태 조회 실패:", error);
		useAuthStore.getState().clearUser();
	}
};
