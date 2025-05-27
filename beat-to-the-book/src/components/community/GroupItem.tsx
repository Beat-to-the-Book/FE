// src/components/community/GroupItem.tsx
"use client";

import Link from "next/link";
import { Group } from "@/lib/types/group";

export default function GroupItem({ group }: { group: Group }) {
	return (
		<Link href={`/community/${group.id}`} className='block'>
			<div className='bg-white rounded-xl shadow-md hover:shadow-lg transition-transform transform hover:-translate-y-1 p-6 flex flex-col justify-center items-center w-52 h-52'>
				<h3 className='text-xl font-semibold text-stateBlue text-center truncate'>{group.name}</h3>
			</div>
		</Link>
	);
}
