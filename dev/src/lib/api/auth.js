import { publicApi, privateApi } from "./axios";
import useAuthStore from "../store/authStore";

export const authAPI = {
	register: (userData) => publicApi.post("/auth/register", userData),

	login: async (credentials) => {
		const response = await publicApi.post("/auth/login", credentials);
		const { token, userId } = response.data;

		// 로그인 성공 시 토큰 저장
		useAuthStore.getState().setAuth(token, userId);

		return response;
	},

	getMe: () => privateApi.get("/auth/me"),

	// 앱 초기화 시 호출할 함수
	initializeAuth: () => {
		useAuthStore.getState().initializeAuth();
	},
};
