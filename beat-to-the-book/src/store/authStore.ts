// src/store/authStore.ts
import { create } from "zustand";

type User = {
	id: string;
	nickname: string;
	email: string;
	role: "USER" | "ADMIN";
	profileImage: string;
};

type AuthState = {
	user: User | null;
	isAuthenticated: boolean;
	setUser: (user: User) => void;
	clearUser: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
	user: null,
	isAuthenticated: false,
	setUser: (user) => set({ user, isAuthenticated: true }),
	clearUser: () => set({ user: null, isAuthenticated: false }),
}));
