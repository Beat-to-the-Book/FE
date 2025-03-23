import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
	token: string | null;
	isAuthenticated: boolean;
	setToken: (token: string) => void;
	clearToken: () => void;
}

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
			partialize: (state) => ({ token: state.token, isAuthenticated: state.isAuthenticated }),
			storage: {
				getItem: (name) => {
					if (typeof window === "undefined") return null;
					const value = localStorage.getItem(name);
					return value ? JSON.parse(value) : null;
				},
				setItem: (name, value) => {
					if (typeof window !== "undefined") {
						localStorage.setItem(name, JSON.stringify(value));
					}
				},
				removeItem: (name) => {
					if (typeof window !== "undefined") {
						localStorage.removeItem(name);
					}
				},
			},
		}
	)
);
