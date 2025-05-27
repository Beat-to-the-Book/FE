import { create } from "zustand";
import { persist } from "zustand/middleware";

const useCartStore = create(
	persist(
		(set, get) => ({
			items: [],

			addItem: (book) => {
				const currentItems = get().items;
				const existingItem = currentItems.find((item) => item.id === book.id);

				if (existingItem) {
					set({
						items: currentItems.map((item) =>
							item.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
						),
					});
				} else {
					set({
						items: [...currentItems, { ...book, quantity: 1 }],
					});
				}
			},

			removeItem: (bookId) => {
				set({
					items: get().items.filter((item) => item.id !== bookId),
				});
			},

			updateQuantity: (bookId, quantity) => {
				if (quantity < 1) return;

				set({
					items: get().items.map((item) => (item.id === bookId ? { ...item, quantity } : item)),
				});
			},

			clearCart: () => {
				set({ items: [] });
			},

			getTotalPrice: () => {
				return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
			},

			getTotalItems: () => {
				return get().items.reduce((total, item) => total + item.quantity, 0);
			},
		}),
		{
			name: "cart-storage",
		}
	)
);

export default useCartStore;
