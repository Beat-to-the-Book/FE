import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type User = {
	userId: string;
	username: string;
	email: string;
	role: "ROLE_USER" | "ROLE_ADMIN";
	profileImageUrl?: string;
};

type AuthState = {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	setUser: (user: User) => void;
	setToken: (token: string) => void;
	clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			setUser: (user) => set({ user, isAuthenticated: true }),
			setToken: (token) => set({ token }),
			clearAuth: () => set({ user: null, token: null, isAuthenticated: false }),
		}),
		{
			name: "auth-storage", // localStorage key
			storage: createJSONStorage(() => localStorage), // 올바른 PersistStorage 타입 사용
			// partialize: state => ({ user: state.user }),
			// → 저장할 상태를 일부로 제한하고 싶다면 사용
		}
	)
);
