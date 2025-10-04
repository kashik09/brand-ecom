"use client"

import { useEffect } from "react"

export default function ContactClient() {
  useEffect(() => {}, [])
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  return (
    <main className="p-6">
      <h1 className="text-2xl font-semibold">Contact</h1>
      <p className="mt-2">
        WhatsApp: {num ? `+${num}` : "not configured"}
      </p>
    </main>
  )
}
