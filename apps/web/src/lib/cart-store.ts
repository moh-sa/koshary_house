"use client";

import type { Product } from "@food/contract";
import { useEffect, useState } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartLine {
  product: Product;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (product, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.product.id === product.id);
          if (existing) {
            return {
              lines: s.lines.map((l) =>
                l.product.id === product.id
                  ? { ...l, quantity: l.quantity + qty }
                  : l,
              ),
            };
          }
          return { lines: [...s.lines, { product, quantity: qty }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.product.id !== productId)
              : s.lines.map((l) =>
                  l.product.id === productId ? { ...l, quantity: qty } : l,
                ),
        })),
      remove: (productId) =>
        set((s) => ({ lines: s.lines.filter((l) => l.product.id !== productId) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "koshary-cart" },
  ),
);

export const cartCount = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (s: CartState) =>
  s.lines.reduce((n, l) => n + l.product.priceCents * l.quantity, 0);

/** Avoids hydration mismatches for persisted store reads. */
export function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
