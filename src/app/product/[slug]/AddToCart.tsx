"use client";

import { Button } from "@/components/ui/button";
import { useCart } from "@/state/cart";
import type { Product } from "@/types/product";

export default function AddToCart({ p }: { p: Product }) {
  const { add } = useCart();
  return (
    <div className="space-y-2">
      <Button
        onClick={() => add({ slug: p.slug, title: p.title, price: p.price, type: p.type, qty: 1 })}
      >
        Add to cart
      </Button>
    </div>
  );
}
