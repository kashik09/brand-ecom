"use client"

import { useEffect, useState } from "react"

type Order = {
  id: string
  items: { productId: string; title: string; price: number; qty: number; type: "digital" | "service" }[]
  customer: { name: string; email: string; phone: string }
  subtotal: number
  shippingZone: string
  shippingFee: number
  total: number
  createdAt: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [links, setLinks] = useState<Record<string, string[]>>({}) // orderId -> links

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/orders", { method: "GET" })
      if (res.ok) setOrders(await res.json())
    })()
  }, [])

  async function fulfill(orderId: string) {
    const res = await fetch(`/api/fulfill?orderId=${orderId}`, { method: "POST" })
    if (!res.ok) { alert("Fulfill failed"); return }
    const data = await res.json()
    // data.links = array of secure links
    setLinks(prev => ({ ...prev, [orderId]: data.links }))
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      {orders.length === 0 ? <p>No orders yet.</p> : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Order {o.id}</div>
                <button className="rounded-lg border px-3 py-1 text-sm"
                  onClick={() => fulfill(o.id)}>Fulfill digital</button>
              </div>
              <div className="text-sm text-gray-500">Created: {new Date(o.createdAt).toLocaleString()}</div>
              <div className="mt-2 space-y-1 text-sm">
                {o.items.map((i, idx) => (
                  <div key={idx}>
                    {i.title} x{i.qty} — ${ (i.price * i.qty).toFixed(2) } [{i.type}]
                  </div>
                ))}
              </div>

              {links[o.id]?.length ? (
                <div className="mt-3">
                  <div className="text-sm font-semibold">Download links:</div>
                  <ul className="list-disc pl-5">
                    {links[o.id].map((l, ix) => (
                      <li key={ix}><a className="underline" href={l} target="_blank" rel="noreferrer">{l}</a></li>
                    ))}
                  </ul>
                  <p className="text-xs text-gray-500 mt-2">Share with the customer. Each link expires and has limited downloads.</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
