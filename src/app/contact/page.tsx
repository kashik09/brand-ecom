"use client";

import { useEffect } from "react";
import { siteUrl } from "@/lib/site";

export default function ContactPage() {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  useEffect(() => {
    if (num) {
      const msg = encodeURIComponent("Hello! I need help with my order.");
      const url = `https://wa.me/${num}?text=${msg}`;
      window.location.replace(url);
    }
  }, [num]);

  if (!num) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Contact</h1>
        <p className="text-sm opacity-80">
          WhatsApp number is not configured. Set{" "}
          <code className="px-1 py-0.5 rounded bg-muted">NEXT_PUBLIC_WHATSAPP_NUMBER</code> in your environment.
        </p>
        <p className="mt-4">Meanwhile, email: owner@example.com</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <p>Redirecting you to WhatsApp…</p>
      <p>
        If nothing happens,{" "}
        <a
          className="underline"
          href={siteUrl(`/contact`)}
          onClick={(e) => {
            e.preventDefault();
            const msg = encodeURIComponent("Hello! I need help with my order.");
            window.location.href = `https://wa.me/${num}?text=${msg}`;
          }}
        >
          tap here
        </a>.
      </p>
    </main>
  );
}