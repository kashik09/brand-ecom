import Link from "next/link"
import Image from "next/image"
import { getProductBySlug } from "@/lib/products"
import { Button } from "@/components/ui/button"
import AddToCart from "./AddToCart"

function waLinkForService(title: string) {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  const msg = encodeURIComponent(`Hello! I'm interested in: ${title}`)
  if (!num) return null
  return `https://wa.me/${num}?text=${msg}`
}

// ✅ Next 15: params is a Promise in RSC
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = getProductBySlug(slug)
  return { title: p ? p.title : "Product" }
}

// ✅ Next 15: make component async and await params
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = getProductBySlug(slug)
  if (!p) return <div className="py-20">Not found.</div>

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Brand"
  const wa = p.type === "service" ? waLinkForService(p.title) : null

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div className="rounded-2xl border p-6">
        <Image
          src={p.image}
          alt={p.title}
          width={800}
          height={600}
          className="w-full h-auto object-contain"
          priority
        />
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
          <AddToCart p={p} />
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
