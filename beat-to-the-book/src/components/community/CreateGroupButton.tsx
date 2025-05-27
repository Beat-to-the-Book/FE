// src/components/community/CreateGroupButton.tsx
"use client";

import Link from "next/link";

export default function CreateGroupButton() {
	return (
		<Link href='/community/create'>
			<button className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'>
				그룹 만들기
			</button>
		</Link>
	);
}
