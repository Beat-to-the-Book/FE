// src/app/(main)/community/ClientCommunity.tsx
"use client";

import { useState, useEffect } from "react";
import { fetchGroups } from "@/lib/api/group";
import GroupList from "@/components/community/GroupList";
import CreateGroupButton from "@/components/community/CreateGroupButton";
import { Group } from "@/lib/types/group";

export default function ClientCommunity() {
	const [groups, setGroups] = useState<Group[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		fetchGroups()
			.then((data) => setGroups(data))
			.catch((err) => {
				console.error("fetchGroups 실패:", err);
				setError(err.message);
			})
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <p>로딩 중…</p>;
	if (error) return <p className='text-red-500'>에러: {error}</p>;

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
