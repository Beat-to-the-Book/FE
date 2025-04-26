// src/components/community/JoinLeaveButton.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { joinGroup, leaveGroup } from "@/lib/api/group";
import { handleApiError } from "@/lib/api/utils";

type JoinLeaveButtonProps = {
	groupId: number;
	token: string;
	isMember: boolean;
};

export default function JoinLeaveButton({
	groupId,
	token,
	isMember: initialIsMember,
}: JoinLeaveButtonProps) {
	const router = useRouter();
	const [isMember, setIsMember] = useState(initialIsMember);
	const [error, setError] = useState<string | null>(null);

	const handleJoin = async () => {
		try {
			setError(null);
			await joinGroup(groupId, token);
			setIsMember(true);
		} catch (error) {
			setError(error.message || "그룹 참여 실패");
			handleApiError(error);
		}
	};

	const handleLeave = async () => {
		try {
			setError(null);
			await leaveGroup(groupId, token);
			setIsMember(false);
		} catch (error) {
			setError(error.message || "그룹 나가기 실패");
			handleApiError(error);
		}
	};

	return (
		<div>
			{error && <p className='text-red-500 text-sm mb-2'>{error}</p>}
			{isMember ? (
				<button
					onClick={handleLeave}
					className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600'
				>
					나가기
				</button>
			) : (
				<button
					onClick={handleJoin}
					className='bg-forestGreen text-white px-4 py-2 rounded-md hover:bg-everGreen'
				>
					참여하기
				</button>
			)}
		</div>
	);
}
