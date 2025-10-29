"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CartItem } from "@/types/cart";

const CartContext = createContext<{
  items: CartItem[];
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  update: (id: string, qty: number) => void;
  clear: () => void;
} | null>(null);

// Simple UUID generator that works everywhere
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = (it: Omit<CartItem, "id">) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.productId === it.productId);
      if (existing) {
        return prev.map((p) =>
          p.productId === it.productId ? { ...p, qty: p.qty + it.qty } : p,
        );
      }
      return [...prev, { ...it, id: generateId() }];
    });
  };

  const remove = (id: string) =>
    setItems((prev) => prev.filter((it) => it.id !== id));

  const update = (id: string, qty: number) =>
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, qty } : it)),
    );

  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
