import { publicApi, privateApi } from "./axios";
import useAuthStore from "../store/authStore";

const safeExtractUserData = (payload) => {
	if (!payload) return null;
	if (payload.data) return payload.data;
	return payload;
};

export const authAPI = {
	register: (userData) => publicApi.post("/auth/register", userData),

	login: async (credentials) => {
		const response = await publicApi.post("/auth/login", credentials);
		const { token, userId } = response.data;

		// 로그인 성공 시 토큰 저장
		useAuthStore.getState().setAuth(token, userId ?? null);

		try {
			const meResponse = await privateApi.get("/auth/me");
			const userData = safeExtractUserData(meResponse.data);
			if (userData) {
				useAuthStore.getState().setUserInfo(userData);
			}
		} catch (error) {
			console.error("사용자 정보 조회 실패:", error);
		}

		return response;
	},

	getMe: () => privateApi.get("/auth/me"),

	// 앱 초기화 시 호출할 함수
	initializeAuth: async () => {
		const { token, userInfo, setUserInfo } = useAuthStore.getState();
		if (!token || userInfo) {
			return;
		}
		try {
			const meResponse = await privateApi.get("/auth/me");
			const userData = safeExtractUserData(meResponse.data);
			if (userData) {
				setUserInfo(userData);
			}
		} catch (error) {
			console.error("초기 사용자 정보 조회 실패:", error);
		}
	},
};
