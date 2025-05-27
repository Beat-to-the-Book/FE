// src/lib/api/axios.ts
import axios, {
	AxiosInstance,
	AxiosRequestConfig,
	AxiosResponse,
	InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/authStore";

const api: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// 요청 인터셉터: JWT 토큰 추가
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
	const token = useAuthStore.getState().token;
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// 응답 인터셉터: 401/403 시 토큰 제거
api.interceptors.response.use(
	(response: AxiosResponse) => {
		console.log("응답:", response.status, response.data);
		return response;
	},
	(error) => {
		if (error.response) {
			const { status } = error.response;
			if (status === 401 || status === 403) {
				console.error("인증 오류 발생");
				useAuthStore.getState().clearAuth();
			}
			const message = error.response.data?.message || "서버 오류가 발생했습니다.";
			return Promise.reject(new Error(message));
		}
		console.error("네트워크 오류:", error.message);
		return Promise.reject(new Error("네트워크 연결을 확인해주세요."));
	}
);

export default api;
