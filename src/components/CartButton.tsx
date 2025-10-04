"use client";
import Link from "next/link";
import { useCart } from "@/state/cart";
import { ShoppingCart } from "lucide-react";

export default function CartButton() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      className="relative inline-flex items-center gap-2 text-sm hover:underline"
    >
      <ShoppingCart size={18} />
      <span>Cart</span>
      {count > 0 && (
        <span className="ml-1 rounded-full text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-800">
          {count}
        </span>
      )}
    </Link>
  );
}
