"use client"

import Link from "next/link"
import { Product } from "@/types/product"
import { Button } from "@/components/ui/button"

function formatCurrency(n: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(n)
}

export default function ProductCard({ p }: { p: Product }) {
  return (
    <div className="rounded-2xl border p-4 flex flex-col gap-3 hover:bg-gray-50 dark:hover:bg-gray-900">
      <img src={p.image} alt={p.title} className="w-full h-36 object-contain" />
      <div className="flex-1">
        <Link href={`/product/${p.slug}`} className="font-semibold hover:underline">
          {p.title}
        </Link>
        <p className="text-sm text-gray-500 mt-1">{p.shortDesc}</p>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold">{formatCurrency(p.price)}</span>
        <Link href={`/product/${p.slug}`}>
          <Button>View</Button>
        </Link>
      </div>
    </div>
  )
}
