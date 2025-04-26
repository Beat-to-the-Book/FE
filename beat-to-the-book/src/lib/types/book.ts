// src/lib/types/book.ts
export type Book = {
	id: number;
	title: string;
	author: string;
	genre: string;
	intro: string;
	price: number;
	publisher: string;
	publishYear: string;
	coverImage?: string;
};

export type RecommendedBook = {
	bookId: number;
	title: string;
	coverImage: string;
};
