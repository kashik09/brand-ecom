import { MetadataRoute } from "next"
import { siteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl("/")
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: [
        "/admin",
        "/api/",
        "/success",
        "/cart",
        "/checkout",
      ],
    },
    sitemap: `${base}sitemap.xml`,
    host: base,
  }
}
