"use client"
import { useCart } from "@/state/cart";
import Link from "next/link";
import { UGX } from "@/lib/currency";

export default function CartPage() {
  const { items, remove, update } = useCart();

  // Calculate subtotal
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (items.length === 0) {
    return (
      <section className="space-y-4">
        <h1 className="text-3xl font-bold">Cart</h1>
        <p>Your cart is empty.</p>
        <Link className="underline" href="/shop">
          Go to shop
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Cart</h1>
      <div className="space-y-3">
        {items.map((i) => (
          <div
            key={i.id}
            className="flex items-center justify-between border rounded-xl p-3"
          >
            <div>
              <div className="font-medium">{i.title}</div>
              <div className="text-sm opacity-70">
                {UGX(i.price)} • {i.type}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={i.qty}
                onChange={(e) =>
                  update(i.id, Math.max(1, Number(e.target.value)))
                }
                className="w-16 rounded border bg-transparent px-2 py-1"
              />
              <button
                onClick={() => remove(i.id)}
                className="text-sm underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold">Subtotal</span>
        <span className="text-lg font-semibold">{UGX(subtotal)}</span>
      </div>

      <Link href="/checkout" className="inline-block underline">
        Proceed to checkout
      </Link>
    </section>
  );
}
