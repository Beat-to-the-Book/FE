// src/components/community/GroupItem.tsx
import Link from "next/link";
import { Group } from "@/lib/types/group";

export default function GroupItem({ group }: { group: Group }) {
	return (
		<Link href={`/community/${group.id}`}>
			<div className='bg-white shadow-md rounded-lg p-4 hover:shadow-lg transition-shadow'>
				<h3 className='text-lg font-semibold text-stateBlue'>{group.name}</h3>
				<p className='text-gray'>책: {group.bookName}</p>
				<p className='text-gray'>멤버: {group.memberCount}</p>
			</div>
		</Link>
	);
}
