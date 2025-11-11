import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
	persist(
		(set) => ({
			token: null,
			isAuthenticated: false,
			userId: null,
			userInfo: null,

			setAuth: (token, userId = null) => {
				set({
					token,
					isAuthenticated: !!token,
					userId: userId ?? null,
				});
			},

			setUserInfo: (info) => {
				set({
					userInfo: info,
					userId: info?.userId ?? info?.id ?? null,
					isAuthenticated: true,
				});
			},

			clearAuth: () => {
				localStorage.removeItem("token");
				set({
					token: null,
					isAuthenticated: false,
					userId: null,
					userInfo: null,
				});
			},
		}),
		{
			name: "auth-storage", // 로컬스토리지에 저장될 키 이름
		}
	)
);

export default useAuthStore;
