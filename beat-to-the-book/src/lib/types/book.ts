// src/lib/types/book.ts

export type Book = {
	id: number;
	title: string;
	author: string;
	genre: string;
	intro: string;
	price: number;
	publisher: string;
	publishDate: string;
	leftCoverImageUrl?: string | null;
	frontCoverImageUrl?: string | null;
	backCoverImageUrl?: string | null;
};

export type RecommendedBook = {
	bookId: number;
	title: string;
	author: string;
	coverImageUrl?: string | null;
};
