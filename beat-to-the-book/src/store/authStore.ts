// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthState = {
	token: string | null;
	isAuthenticated: boolean;
	setToken: (token: string) => void;
	clearToken: () => void;
};

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			token: null,
			isAuthenticated: false,
			setToken: (token: string) => set({ token, isAuthenticated: true }),
			clearToken: () => set({ token: null, isAuthenticated: false }),
		}),
		{
			name: "auth-storage",
			partialize: (state) => ({
				token: state.token,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);
