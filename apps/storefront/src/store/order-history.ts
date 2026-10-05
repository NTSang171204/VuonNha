import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const MAX_ORDERS = 20;

export interface SavedOrder {
  orderCode: string;
  phone: string;
  createdAt: string;
}

interface OrderHistoryState {
  orders: SavedOrder[];
  addOrder: (order: { orderCode: string; phone: string }) => void;
}

export const useOrderHistoryStore = create<OrderHistoryState>()(
  persist(
    (set, get) => ({
      orders: [],
      addOrder: ({ orderCode, phone }) => {
        const code = orderCode.trim();
        const phoneNorm = phone.trim();
        if (!code || !phoneNorm) return;

        const next: SavedOrder = {
          orderCode: code,
          phone: phoneNorm,
          createdAt: new Date().toISOString(),
        };

        const filtered = get().orders.filter(
          (o) => !(o.orderCode === code && o.phone === phoneNorm),
        );

        set({ orders: [next, ...filtered].slice(0, MAX_ORDERS) });
      },
    }),
    { name: 'order-history-storage' },
  ),
);
