"use client";

import { Group } from "@/lib/types/group";
import GroupItem from "./GroupItem";

interface GroupListProps {
	groups: Group[];
}

export default function GroupList({ groups }: GroupListProps) {
	return (
		<div className='flex flex-wrap justify-center gap-6 flex-col items-center w-full'>
			{groups.length > 0 ? (
				groups.map((group) => <GroupItem key={group.id} group={group} />)
			) : (
				<p className='text-gray'>그룹이 없습니다.</p>
			)}
		</div>
	);
}
