"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { UGX } from "@/lib/currency";

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n);
}

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      href={`/product/${p.slug}`}
      className="rounded-2xl border p-4 flex flex-col gap-3 hover:bg-gray-50 dark:hover:bg-gray-900"
    >
      <img src={p.image} alt={p.title} className="w-full h-36 object-contain" />
      <div className="flex-1">
        <div className="font-semibold">{p.title}</div>
        <p className="text-sm text-gray-500 mt-1">{p.shortDesc}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{UGX(p.price)}</span>
        <span className="text-xs underline">View</span>
      </div>
    </Link>
  );
}
