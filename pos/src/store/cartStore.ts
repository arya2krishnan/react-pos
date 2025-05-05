import { create } from 'zustand';
import { ItemData } from '../services/api';

export interface CartItem {
  id: string;
  item: ItemData;
  selectedOptions: Record<string, string[]>;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: ItemData, selectedOptions: Record<string, string[]>, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  updateQuantity: (index: number, quantity: number) => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  
  addItem: (item: ItemData, selectedOptions: Record<string, string[]>, quantity: number) => {
    set((state: CartStore) => ({
      items: [
        ...state.items,
        {
          id: `${item.id}-${Date.now()}`,
          item,
          selectedOptions,
          quantity,
        },
      ],
    }));
  },
  
  removeItem: (index: number) => {
    set((state: CartStore) => ({
      items: state.items.filter((_, i: number) => i !== index),
    }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  updateQuantity: (index: number, quantity: number) => {
    set((state: CartStore) => ({
      items: state.items.map((item, i) => 
        i === index ? { ...item, quantity } : item
      ),
    }));
  },
  
  getTotalPrice: () => {
    const { items } = get();
    return items.reduce((total: number, item: CartItem) => {
      return total + (item.item.price * item.quantity);
    }, 0);
  },
})); 