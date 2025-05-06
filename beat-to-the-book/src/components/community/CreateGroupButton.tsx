// src/components/community/CreateGroupButton.tsx
"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/authStore";

export default function CreateGroupButton() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	if (!isAuthenticated) return null;

	return (
		<Link href='/community/create'>
			<button className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'>
				그룹 만들기
			</button>
		</Link>
	);
}
