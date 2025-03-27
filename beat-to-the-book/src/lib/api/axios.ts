import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from "axios";
import { useAuthStore } from "@/store/authStore";

const api: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
});

// 요청 인터셉터
api.interceptors.request.use(
	(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
		const token = useAuthStore.getState().token; // Zustand에서 토큰 가져오기
		if (token) {
			config.headers = config.headers || {};
			config.headers.Authorization = `Bearer ${token}`;
		}
		console.log("요청:", config.method, config.url);
		return config;
	},
	(error) => {
		console.error("요청 에러:", error);
		return Promise.reject(error);
	}
);

// 응답 인터셉터
api.interceptors.response.use(
	(response: AxiosResponse): AxiosResponse => {
		console.log("응답:", response.status, response.data);
		return response;
	},
	(error) => {
		if (error.response) {
			const { status } = error.response;
			if (status === 401) {
				console.error("인증 실패: 토큰이 유효하지 않습니다.");
				useAuthStore.getState().clearToken(); // 토큰 만료 시 제거
			}
			const message = error.response.data?.message || "서버 오류가 발생했습니다.";
			return Promise.reject(new Error(message));
		}
		console.error("네트워크 오류:", error.message);
		return Promise.reject(new Error("네트워크 연결을 확인해주세요."));
	}
);

export default api;
