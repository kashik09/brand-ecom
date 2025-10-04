"use client"

  title: "Contact",
  alternates: { canonical: "/contact" },
}


import { useEffect } from "react"

export default function ContactPage() {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  const link = num ? `https://wa.me/${num}` : null

  useEffect(() => {
    if (link) {
      // go straight to WhatsApp; fallback link stays on page if popups are blocked
      window.location.replace(link)
    }
  }, [link])

  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold">Contact</h1>
      {link ? (
        <p className="text-sm">
          Redirecting to WhatsApp…{" "}
          <a className="underline" href={link} target="_blank" rel="noreferrer">
            tap here if it doesn’t open
          </a>
        </p>
      ) : (
        <p className="text-amber-600 text-sm">
          Set <code>NEXT_PUBLIC_WHATSAPP_NUMBER</code> in <code>.env.local</code> to enable WhatsApp redirect.
        </p>
      )}
    </section>
  )
}
