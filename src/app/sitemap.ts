import { MetadataRoute } from "next"
import { products } from "@/lib/products"
import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteUrl("/"),             lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: siteUrl("/shop"),         lastModified: now, changeFrequency: "daily",   priority: 0.9 },
    { url: siteUrl("/contact"),      lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: siteUrl("/legal/privacy"),lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: siteUrl("/legal/terms"),  lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
    { url: siteUrl("/legal/refunds"),lastModified: now, changeFrequency: "yearly",  priority: 0.3 },
  ]

  const productRoutes: MetadataRoute.Sitemap = products.map(p => ({
    url: siteUrl(`/product/${p.slug}`),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  return [...staticRoutes, ...productRoutes]
}
