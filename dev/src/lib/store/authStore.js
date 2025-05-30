import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
	persist(
		(set) => ({
			token: null,
			isAuthenticated: false,
			userId: null,

			setAuth: (token, userId) => {
				set({
					token,
					isAuthenticated: true,
					userId,
				});
			},

			clearAuth: () => {
				// 로컬스토리지에서 토큰 제거
				localStorage.removeItem("token");
				set({
					token: null,
					isAuthenticated: false,
					userId: null,
				});
			},
		}),
		{
			name: "auth-storage", // 로컬스토리지에 저장될 키 이름
		}
	)
);

export default useAuthStore;
