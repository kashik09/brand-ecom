"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/types/cart";

type CartCtx = {
  items: CartItem[];
  add: (item: Omit<CartItem, "id">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
};
const Ctx = createContext<CartCtx | null>(null);

const KEY = "cart.v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add: CartCtx["add"] = (it) => {
    setItems((prev) => {
      const found = prev.find((p) => p.productId === it.productId);
      if (found)
        return prev.map((p) =>
          p.productId === it.productId ? { ...p, qty: p.qty + it.qty } : p,
        );
      return [...prev, { ...it, id: crypto.randomUUID() }];
    });
  };
  const remove = (id: string) =>
    setItems((prev) => prev.filter((p) => p.id !== id));
  const setQty = (id: string, qty: number) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty } : p)));
  const clear = () => setItems([]);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.price * i.qty, 0),
    [items],
  );
  const count = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  const value: CartCtx = { items, add, remove, setQty, clear, count, subtotal };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
