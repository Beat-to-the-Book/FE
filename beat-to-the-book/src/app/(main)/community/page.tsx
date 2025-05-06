// src/app/(main)/community/page.tsx
import { fetchGroups } from "@/lib/api/group";
import GroupList from "@/components/community/GroupList";
import CreateGroupButton from "@/components/community/CreateGroupButton";

export default async function CommunityPage() {
	let groups = [];
	try {
		groups = await fetchGroups();
	} catch (error) {
		groups = [];
	}

	return (
		<div className='min-h-screen p-6'>
			<section className='text-center'>
				<h1 className='text-3xl font-bold text-stateBlue mb-4'>커뮤니티</h1>
				<CreateGroupButton />
			</section>
			<section className='mt-6'>
				<GroupList groups={groups} />
			</section>
		</div>
	);
}
