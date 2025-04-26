// src/store/cartStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Book } from "@/lib/types/book";

interface CartItem {
	book: Book;
	quantity: number;
}

interface CartState {
	items: CartItem[];
	addItem: (book: Book) => void;
	removeItem: (bookId: number) => void;
	updateQuantity: (bookId: number, quantity: number) => void;
	clearCart: () => void;
}

export const useCartStore = create<CartState>()(
	persist(
		(set) => ({
			items: [],
			addItem: (book) =>
				set((state) => {
					const existingItem = state.items.find((item) => item.book.id === book.id);
					if (existingItem) {
						return {
							items: state.items.map((item) =>
								item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
							),
						};
					}
					return { items: [...state.items, { book, quantity: 1 }] };
				}),
			removeItem: (bookId) =>
				set((state) => ({
					items: state.items.filter((item) => item.book.id !== bookId),
				})),
			updateQuantity: (bookId, quantity) =>
				set((state) => ({
					items: state.items.map((item) =>
						item.book.id === bookId ? { ...item, quantity: Math.max(1, quantity) } : item
					),
				})),
			clearCart: () => set({ items: [] }),
		}),
		{
			name: "cart-storage",
			storage: {
				getItem: (name) => {
					if (typeof window === "undefined") return null;
					const value = localStorage.getItem(name);
					return value ? JSON.parse(value) : null;
				},
				setItem: (name, value) => {
					if (typeof window !== "undefined") {
						localStorage.setItem(name, JSON.stringify(value));
					}
				},
				removeItem: (name) => {
					if (typeof window !== "undefined") {
						localStorage.removeItem(name);
					}
				},
			},
		}
	)
);
