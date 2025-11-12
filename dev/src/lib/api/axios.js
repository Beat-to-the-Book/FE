import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8082/api";

// 기본 인스턴스 (토큰 불필요)
const publicApi = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// 인증이 필요한 인스턴스
const privateApi = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

// 요청 인터셉터를 사용하여 동적으로 토큰 설정
privateApi.interceptors.request.use((config) => {
	const authStorage = localStorage.getItem("auth-storage");
	if (authStorage) {
		const { state } = JSON.parse(authStorage);
		if (state?.token) {
			config.headers.Authorization = `Bearer ${state.token}`;
		}
	}
	return config;
});
export { publicApi, privateApi };
