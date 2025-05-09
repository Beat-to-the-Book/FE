// src/lib/api/utils.ts
"use client";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export const handleApiError = (error: any, router?: ReturnType<typeof useRouter>): void => {
	if (error.response?.status === 401 || error.response?.status === 403) {
		if (typeof window !== "undefined") {
			useAuthStore.getState().clearUser();
			if (router) router.push("/auth/signin");
			else window.location.href = "/auth/signin";
		}
		throw new Error("인증 오류: 다시 로그인해주세요.");
	}
	console.error("API 호출 실패:", error);
	throw error;
};
