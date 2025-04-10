// src/lib/types/book.ts
export interface Book {
	id: number;
	title: string;
	author: string;
	genre: string;
	intro: string;
	price: number;
	publisher: string;
	publishYear: string;
	coverImage?: string;
}
