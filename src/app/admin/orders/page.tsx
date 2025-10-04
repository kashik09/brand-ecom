"use client";

import React, { useEffect, useState, useRef } from "react";

type OrderItem = {
  id: number | string;
  productId: string;
  title: string;
  price: string | number;
  qty: number;
  type: string;
};

type Order = {
  id: string;
  createdAt: string;
  customer?: { name?: string | null; email?: string | null; phone?: string | null };
  subtotal: string | number;
  shippingZone: string;
  shippingFee: string | number;
  total: string | number;
  notes?: string | null;
  items: OrderItem[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [links, setLinks] = useState<any[] | null>(null);
  const fetching = useRef(false);

  async function load() {
    if (fetching.current) return;
    fetching.current = true;
    try {
      setLoading(true);
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load orders");
      const data = (await res.json()) as Order[];
      setOrders(data);
    } catch (e: any) {
      setError(e?.message ?? "Failed");
    } finally {
      setLoading(false);
      fetching.current = false;
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function fulfill(orderId: string) {
    const res = await fetch("/api/fulfill", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    if (!res.ok) {
      alert("Fulfill failed");
      return;
    }
    const json = await res.json();
    setLinks(json.links || []);
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Orders</h1>
      <div className="grid gap-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-xl border p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="font-medium">#{o.id.slice(0, 8)}</div>
              <div className="text-sm opacity-70">
                {new Date(o.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="text-sm">
              {o.customer?.name || "—"} · {o.customer?.phone || "—"}
            </div>

            <div className="text-sm">
              Zone {o.shippingZone} · Shipping {o.shippingFee} · Total{" "}
              <strong>{o.total}</strong>
            </div>

            <ul className="text-sm list-disc pl-5">
              {o.items.map((it) => (
                <li key={String(it.id)}>
                  {it.title} ×{it.qty} — {it.price}
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <button
                onClick={() => fulfill(o.id)}
                className="px-3 py-2 rounded-lg border hover:bg-muted"
              >
                Fulfill digital
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Inline dialog (no extra file) */}
      {links !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Download Links</h2>
              <button
                onClick={() => setLinks(null)}
                className="px-2 py-1 rounded-md border"
              >
                Close
              </button>
            </div>
            <div className="space-y-3">
              {links.length === 0 ? (
                <div className="text-sm opacity-70">
                  No digital items for this order.
                </div>
              ) : (
                links.map((l, idx) => (
                  <div key={idx} className="rounded-lg border p-3">
                    <div className="font-medium">{l.title}</div>
                    <div className="text-sm break-all">
                      <a className="underline" href={l.url} target="_blank" rel="noreferrer">
                        {l.url}
                      </a>
                    </div>
                    <div className="text-xs opacity-70">
                      Remaining: {l.remaining} · Expires:{" "}
                      {new Date(l.expiresAt).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
