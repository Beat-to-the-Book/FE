// src/app/layout.tsx
import { ReactNode } from "react";
import QueryProvider from "@/components/providers/QueryProvider";
import "@/app/globals.css"; // Tailwind CSS 임포트

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang='ko'>
			<body>
				<QueryProvider>{children}</QueryProvider>
			</body>
		</html>
	);
}
