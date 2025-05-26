// src/app/layout.tsx
"use client";

import React, { useEffect } from "react";
import QueryProvider from "@/components/providers/QueryProvider";
import BehaviorBatchSender from "@/components/books/BehaviorBatchSender";
import "@/app/globals.css"; // Tailwind CSS
import axios from "@/lib/api/axios";
import { useAuthStore } from "@/store/authStore";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	const setUser = useAuthStore((state) => state.setUser);
	const clearUser = useAuthStore((state) => state.clearUser);

	useEffect(() => {
		// 클라이언트에서만 /auth/me 호출하여 인증 상태 복원
		axios
			.get("/auth/me")
			.then((res) => setUser(res.data))
			.catch(() => clearUser());
	}, [setUser, clearUser]);

	return (
		<html lang='ko'>
			<body>
				<QueryProvider>{children}</QueryProvider>
				<BehaviorBatchSender />
			</body>
		</html>
	);
}
