// src/app/layout.tsx
"use client";

import React, { useEffect } from "react";
import QueryProvider from "@/components/providers/QueryProvider";
import "@/app/globals.css";
import { checkAuth } from "@/lib/api/auth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
	// TODO: 다른 API가 쿠키로 변환되지 않았기 때문에 임시 주석처리
	// useEffect(() => {
	// 	checkAuth();
	// }, []);

	return (
		<html lang='ko'>
			<body>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
