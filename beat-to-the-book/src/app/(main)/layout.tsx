// src/app/(main)/layout.tsx

import { ReactNode } from "react";
import Header from "@/components/layout/Header";

export default function MainLayout({ children }: { children: ReactNode }) {
	return (
		<div>
			<Header />
			<main>{children}</main>
		</div>
	);
}
