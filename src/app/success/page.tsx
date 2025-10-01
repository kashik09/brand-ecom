export const metadata = { title: "Order Saved", alternates: { canonical: "/success" } }

import { Suspense } from "react"
import SuccessClient from "./success-client"

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <section className="space-y-4">
          <h1 className="text-3xl font-bold">Order Saved</h1>
          <p>Loading…</p>
        </section>
      }
    >
      <SuccessClient />
    </Suspense>
  )
}
