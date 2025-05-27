import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";

const api: AxiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8082/api",
	timeout: 10000,
	headers: {
		"Content-Type": "application/json",
	},
	withCredentials: true, // 기본값: 인증 API용, 쿠키 전송
});

// 요청 인터셉터: 디버깅용 로깅 및 경로별 credentials 설정
api.interceptors.request.use(
	(config) => {
		const method = config.method?.toUpperCase() || "UNKNOWN";
		const url = `${config.baseURL}${config.url}`;
		console.debug(`[API REQUEST] ${method} ${url}`, config);

		// withCredentials 설정
		if (
			config.url?.includes("/search") ||
			config.url?.includes("/books") ||
			(config.url?.includes("/groups") && method === "get")
		) {
			config.withCredentials = false;
		}

		return config;
	},
	(error) => {
		// 요청 설정 중 에러
		console.error("[API REQUEST ERROR]", error);
		return Promise.reject(error);
	}
);

// 응답 인터셉터: 상태 및 데이터 로깅, 에러 시 상세 정보
api.interceptors.response.use(
	(response: AxiosResponse) => {
		const method = response.config.method?.toUpperCase() || "UNKNOWN";
		const url = `${response.config.baseURL}${response.config.url}`;
		console.debug(`[API RESPONSE] ${response.status} ${method} ${url}`, response.data);
		return response;
	},
	(error: AxiosError) => {
		if (error.config) {
			const method = error.config.method?.toUpperCase() || "UNKNOWN";
			const url = `${error.config.baseURL}${error.config.url}`;
			console.error(`[API ERROR] ${method} ${url}`, {
				status: error.response?.status,
				headers: error.response?.headers,
				data: error.response?.data,
				message: error.message,
			});
		} else {
			console.error("[API UNKNOWN ERROR]", error);
		}

		// 기존 에러 처리 로직
		if (error.response) {
			const { status } = error.response;
			if (status === 401 || status === 403) {
				console.error("인증 오류 발생");
				// TODO: 인증 처리 임시 주석 처리
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
