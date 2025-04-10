// src/lib/api/auth.ts
import axios from "./axios";
import { useAuthStore } from "@/store/authStore";
import { SigninFormData } from "@/lib/validation/authSchema";
import { SignupFormData } from "@/lib/validation/authSchema";

export const signin = async (data: SigninFormData) => {
	try {
		const response = await axios.post("/auth/signin", data);
		const { token } = response.data; // 응답에 token만 있다고 가정
		useAuthStore.getState().setToken(token, data.userId); // 입력한 userId 사용
		return { token, userId: data.userId };
	} catch (error) {
		console.error("로그인 실패:", error);
		throw error;
	}
};
export const signup = async (data: SignupFormData) => {
	try {
		const response = await axios.post("/auth/signup", data);
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

export const extractUserIdFromCookie = (cookieValue?: string): string | undefined => {
	if (!cookieValue) return undefined;
	try {
		const parsed = JSON.parse(cookieValue);
		return parsed.state?.userId;
	} catch (e) {
		console.error("유저 정보 파싱 실패:", e);
		return undefined;
	}
};

// 현재 미사용
export const checkToken = async (token: string) => {
	try {
		const response = await axios.get("/auth/check-token", {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});
		return response.data;
	} catch (error) {
		console.error("토큰 확인 실패:", error);
		throw error;
	}
};
