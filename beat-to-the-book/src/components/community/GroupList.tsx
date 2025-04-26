// src/components/community/GroupList.tsx
import { Group } from "@/lib/types/group";
import GroupItem from "./GroupItem";

interface GroupListProps {
	groups: Group[];
}

export default function GroupList({ groups }: GroupListProps) {
	return (
		<div className='flex flex-wrap gap-6'>
			{groups.length > 0 ? (
				groups.map((group) => <GroupItem key={group.id} group={group} />)
			) : (
				<p className='text-gray'>그룹이 없습니다.</p>
			)}
		</div>
	);
}
