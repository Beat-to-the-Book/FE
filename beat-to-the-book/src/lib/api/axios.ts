// src/lib/api/axios.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

const api: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true,
});

// 요청 인터셉터: 특정 엔드포인트에서는 쿠키 전송 비활성화
api.interceptors.request.use((config: AxiosRequestConfig) => {
	const url = config.url || "";
	const method = (config.method || "").toLowerCase();

	// /search, /books, GET /groups 에 대해서는 withCredentials=false
	if (
		url.includes("/auth/login") ||
		url.includes("/auth/register") ||
		url.includes("/search") ||
		url.includes("/books") ||
		(url.includes("/groups") && method === "get")
	) {
		config.withCredentials = false;
	} else {
		config.withCredentials = true;
	}

	return config;
});

// 응답 인터셉터: 401/403 시 클라이언트 상태 초기화
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
				// import("@/store/authStore").then(({ useAuthStore }) => useAuthStore.getState().clearUser());
			}
			const message = error.response.data?.message || "서버 오류가 발생했습니다.";
			return Promise.reject(new Error(message));
		}
		console.error("네트워크 오류:", error.message);
		return Promise.reject(new Error("네트워크 연결을 확인해주세요."));
	}
);

export default api;
