import { getProductBySlug } from "@/lib/products"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = getProductBySlug(params.slug)
  return { title: p ? p.title : "Product" }
}

function waLinkForService(title: string) {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  const msg = encodeURIComponent(`Hello! I'm interested in: ${title}`)
  if (!num) return null
  return `https://wa.me/${num}?text=${msg}`
}

export default function ProductPage({ params }: { params: { slug: string } }) {
  const p = getProductBySlug(params.slug)
  if (!p) return <div className="py-20">Not found.</div>

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Brand"
  const wa = p.type === "service" ? waLinkForService(p.title) : null

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div className="rounded-2xl border p-6">
        <img src={p.image} alt={p.title} className="w-full h-64 object-contain" />
      </div>

      <div className="space-y-4">
        <h1 className="text-2xl font-bold">{p.title}</h1>
        <p className="text-gray-600 dark:text-gray-300">{p.shortDesc}</p>
        <div className="text-xl font-semibold">${p.price}</div>

        {p.type === "service" ? (
          wa ? (
            <a href={wa} target="_blank" rel="noreferrer">
              <Button>Enquire on WhatsApp</Button>
            </a>
          ) : (
            <div className="text-sm text-amber-600">
              Set NEXT_PUBLIC_WHATSAPP_NUMBER in .env.local to enable WhatsApp.
            </div>
          )
        ) : (
          <div className="space-y-2">
            <Button disabled title="Cart comes in Sprint 2">Add to cart (coming in Sprint 2)</Button>
            <p className="text-xs text-gray-500">
              Digital delivery uses secure, time-limited links after purchase.
            </p>
          </div>
        )}

        <div className="pt-6 border-t">
          <p className="text-sm text-gray-500">
            Sold by {brand}. Need help? <Link className="underline" href="/contact">Contact us</Link>.
          </p>
        </div>
      </div>
    </article>
  )
}
