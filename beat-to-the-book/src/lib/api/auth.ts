// src/lib/api/auth.ts
import api from "./axios";
import { useAuthStore } from "@/store/authStore";
import { SigninFormData } from "@/lib/validation/authSchema";
import { SignupFormData } from "@/lib/validation/authSchema";

export const signin = async (data: SigninFormData) => {
	try {
		const response = await api.post("/auth/signin", data);
		const { token } = response.data;
		useAuthStore.getState().setToken(token); // Zustand에 토큰 저장
		return token;
	} catch (error) {
		console.error("로그인 실패:", error);
		throw error; // 상위에서 에러 처리 가능
	}
};

export const signup = async (data: SignupFormData) => {
	try {
		const response = await api.post("/auth/signup", data);
		return response.data;
	} catch (error) {
		console.error("회원가입 실패:", error);
		throw error;
	}
};

export const logout = async () => {
	try {
		const response = await api.post("/auth/logout");
		useAuthStore.getState().clearToken(); // Zustand에서 토큰 제거
		return response.data;
	} catch (error) {
		console.error("로그아웃 실패:", error);
		throw error;
	}
};
