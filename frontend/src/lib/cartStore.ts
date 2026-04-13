// ============================================
// Krepšelio store — Zustand
// ============================================
// Saugo krepšelio prekes naršyklės atmintyje
// Naudojimas: const { items, addItem } = useCartStore()
// ============================================

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Krepšelio prekės tipas
export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  color: string;
  colorHex: string;
  size: string;
  quantity: number;
  maxStock: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, color: string, size: string) => void;
  updateQuantity: (productId: string, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  // persist — išsaugo krepšelį localStorage (neišnyksta perkrovus puslapį)
  persist(
    (set, get) => ({
      items: [],

      // Pridėti prekę į krepšelį
      addItem: (newItem) => {
        set((state) => {
          const existingIndex = state.items.findIndex(
            (item) =>
              item.productId === newItem.productId &&
              item.color === newItem.color &&
              item.size === newItem.size
          );

          if (existingIndex > -1) {
            // Jei tokia prekė jau yra — padidinti kiekį
            const updated = [...state.items];
            const existing = updated[existingIndex];
            updated[existingIndex] = {
              ...existing,
              quantity: Math.min(existing.quantity + newItem.quantity, existing.maxStock),
            };
            return { items: updated };
          }

          // Nauja prekė
          return { items: [...state.items, newItem] };
        });
      },

      // Pašalinti prekę
      removeItem: (productId, color, size) => {
        set((state) => ({
          items: state.items.filter(
            (item) =>
              !(item.productId === productId && item.color === color && item.size === size)
          ),
        }));
      },

      // Keisti kiekį
      updateQuantity: (productId, color, size, quantity) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId && item.color === color && item.size === size
              ? { ...item, quantity: Math.max(1, Math.min(quantity, item.maxStock)) }
              : item
          ),
        }));
      },

      // Išvalyti krepšelį
      clearCart: () => set({ items: [] }),

      // Bendras prekių skaičius
      totalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),

      // Bendra suma
      totalPrice: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    {
      name: "eprintukas-cart", // localStorage raktas
    }
  )
);
