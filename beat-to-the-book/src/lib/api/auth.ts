// src/lib/api/auth.ts
import axios from "./axios";
import { useAuthStore } from "@/store/authStore";
import { SigninFormData, SignupFormData } from "@/lib/validation/authSchema";

export const signin = async (data: SigninFormData) => {
	try {
		const response = await axios.post("/auth/login", data);
		const { token } = response.data.data;
		useAuthStore.getState().setToken(token);
		return { token };
	} catch (error) {
		console.error("로그인 실패:", error);
		throw error;
	}
};

export const signup = async (data: SignupFormData) => {
	try {
		const response = await axios.post("/auth/register", data);
		return response.data;
	} catch (error) {
		console.error("회원가입 실패:", error);
		throw error;
	}
};

export const logout = async () => {
	try {
		const response = await axios.post("/auth/logout");
		useAuthStore.getState().clearToken();
		return response.data;
	} catch (error) {
		console.error("로그아웃 실패:", error);
		throw error;
	}
};
