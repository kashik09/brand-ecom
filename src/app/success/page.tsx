"use client"
import { useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function SuccessPage() {
  const sp = useSearchParams()
  const wa = sp.get("wa")
  const orderId = sp.get("orderId")

  useEffect(() => {
    if (wa) window.location.href = wa
  }, [wa])

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Order Saved</h1>
      <p>Your order <code>{orderId}</code> was saved. We’re opening WhatsApp…</p>
      {wa ? (
        <p>If nothing happens, <a className="underline" href={wa}>tap here</a>.</p>
      ) : (
        <p className="text-amber-600">WhatsApp number not set.</p>
      )}
      <Link href="/shop" className="underline">Back to shop</Link>
    </section>
  )
}
