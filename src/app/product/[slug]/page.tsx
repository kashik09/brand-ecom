import { getProductBySlug } from "@/lib/products";

import Link from "next/link";
import AddToCart from "./AddToCart";
import type { Metadata } from "next";
import { siteUrl } from "@/lib/site";
import { UGX } from "@/lib/currency";


export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const p = getProductBySlug(slug);
  if (!p) {
    return { title: "Product", alternates: { canonical: "/shop" } };
  }
  return {
    title: p.title,
    description: p.shortDesc,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      // ✅ Next's Metadata typing allows "website" here (not "product")
      type: "website",
      url: siteUrl(`/product/${p.slug}`),
      title: p.title,
      description: p.shortDesc,
      images: [{ url: siteUrl(p.image), alt: p.title }], // optional but nice
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.shortDesc,
      images: [siteUrl(p.image)],
    },
  };
}

function ProductJsonLD({ slug }: { slug: string }) {
  const p = getProductBySlug(slug);
  if (!p) return null;
  const data = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: p.title,
    description: p.shortDesc,
    sku: p.id,
    url: siteUrl(`/product/${p.slug}`),
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: p.price.toFixed(2),
      availability: "https://schema.org/InStock",
      url: siteUrl(`/product/${p.slug}`),
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function waLinkForService(title: string) {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  const msg = encodeURIComponent(`Hello! I'm interested in: ${title}`);
  if (!num) return null;
  return `https://wa.me/${num}?text=${msg}`;
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = getProductBySlug(slug);
  if (!p) return <div className="py-20">Not found.</div>;

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Brand";
  

  return (
    <>
      <ProductJsonLD slug={slug} />
      <article className="grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border p-6">
          <img
            src={p.image}
            alt={p.title}
            className="w-full h-64 object-contain"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{p.title}</h1>
          <p className="text-gray-600 dark:text-gray-300">{p.shortDesc}</p>
          <div className="text-xl font-semibold">{UGX(p.price)}</div>

          <AddToCart p={p} />

          <div className="pt-6 border-t">
            <p className="text-sm text-gray-500">
              Sold by {brand}. Need help?{" "}
              <Link className="underline" href="/contact">
                Contact us
              </Link>
              .
            </p>
          </div>
        </div>
      </article>
    </>
  );
}
