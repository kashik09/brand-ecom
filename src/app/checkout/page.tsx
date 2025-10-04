"use client"


import { useState } from "react"
import { useCart } from "@/state/cart"
import type { ShippingZoneCode, OrderInput, Customer } from "@/types/cart"
import { buildWhatsAppLink } from "@/lib/wa"
import { useRouter } from "next/navigation"
import { useSettings } from "@/lib/settings"
import { UGX } from "@/lib/currency"

export default function CheckoutPage() {
  const { items, subtotal, clear } = useCart()
  const { zones } = useSettings()
  const router = useRouter()
  const [customer, setCustomer] = useState<Customer>({ name: "", email: "", phone: "" })
  const [zone, setZone] = useState<ShippingZoneCode>("PICKUP")
  const [notes, setNotes] = useState("")

  if (items.length === 0) return <div>Cart is empty.</div>

  const shippingFee = zones[zone].fee
  const total = subtotal + shippingFee

  async function placeOrder() {
    const order: OrderInput = {
      items, subtotal, shippingZone: zone, shippingFee, total, customer, notes
    }
    const res = await fetch("/api/orders", { method: "POST", body: JSON.stringify(order) })
    if (!res.ok) { alert("Failed to save order."); return }
    const { orderId } = await res.json()

    const link = buildWhatsAppLink(order)
    if (!link) { alert("Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local"); return }

    clear()
    router.push(`/success?orderId=${orderId}&wa=${encodeURIComponent(link)}`)
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Checkout</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <h2 className="font-semibold">Customer</h2>
          <input className="w-full rounded border px-3 py-2" placeholder="Full name"
                 value={customer.name} onChange={e=>setCustomer({...customer, name:e.target.value})}/>
          <input className="w-full rounded border px-3 py-2" placeholder="Email"
                 value={customer.email} onChange={e=>setCustomer({...customer, email:e.target.value})}/>
          <input className="w-full rounded border px-3 py-2" placeholder="Phone"
                 value={customer.phone} onChange={e=>setCustomer({...customer, phone:e.target.value})}/>
          <textarea className="w-full rounded border px-3 py-2" placeholder="Notes (optional)"
                 value={notes} onChange={e=>setNotes(e.target.value)}/>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold">Delivery</h2>
          <div className="grid gap-2">
            {(Object.keys(zones) as ShippingZoneCode[]).map((code) => {
              const z = zones[code]
              return (
                <label key={code} className="flex items-center gap-3 border rounded-xl p-3">
                  <input type="radio" name="zone" checked={zone===code}
                    onChange={()=>setZone(code)} />
                  <div className="flex-1">
                    <div className="font-medium">{z.label}</div>
                    <div className="text-sm text-gray-500">ETA: {z.eta}</div>
                  </div>
                  <div className="font-semibold">${z.fee.toFixed(2)}</div>
                </label>
              )
            })}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span>Subtotal</span><span>{UGX(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Shipping</span><span>{UGX(shippingFee)} ({zone})</span>
          </div>
          <div className="flex items-center justify-between text-lg font-semibold">
            <span>Total</span><span>{UGX(total)}</span>
          </div>

          <button onClick={placeOrder} className="w-full rounded-lg bg-primary text-white py-2">
            Send Order on WhatsApp
          </button>
        </div>
      </div>
    </section>
  )
}
