// src/app/(main)/community/page.tsx
import Link from "next/link";
import { fetchGroups } from "@/lib/api/group";
import GroupList from "@/components/community/GroupList";
import { cookies } from "next/headers";

export default async function CommunityPage() {
	const cookieStore = await cookies();
	const authData = cookieStore.get("auth-storage")?.value;
	let userId: string | undefined;

	if (authData) {
		const parsed = JSON.parse(authData);
		userId = parsed.state?.userId;
	}

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
				{userId && (
					<Link href='/community/create'>
						<button className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'>
							그룹 만들기
						</button>
					</Link>
				)}
			</section>
			<section className='mt-6'>
				<GroupList groups={groups} />
			</section>
		</div>
	);
}
