// src/lib/types/post.ts
export type Post = {
	id: number;
	groupId: number;
	content: string;
	userId: string;
	createdAt: string;
	canDelete: boolean;
};
