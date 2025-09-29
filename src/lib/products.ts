import { Product } from "@/types/product"

export const products: Product[] = [
  {
    id: "p1",
    slug: "minimal-portfolio-template",
    title: "Minimal Portfolio Template",
    type: "digital",
    price: 19,
    shortDesc: "Clean HTML/CSS portfolio starter.",
    image: "/window.svg",
    filePath: "/assets/min-portfolio.zip"
  },
  {
    id: "p2",
    slug: "social-media-starter-pack",
    title: "Social Media Starter Pack",
    type: "digital",
    price: 9,
    shortDesc: "Caption cheatsheets + post ideas.",
    image: "/file.svg",
    filePath: "/assets/smpack.pdf"
  },
  {
    id: "p3",
    slug: "invoice-quote-kit",
    title: "Invoice & Quote Kit",
    type: "digital",
    price: 7,
    shortDesc: "Excel templates that just work.",
    image: "/file.svg",
    filePath: "/assets/invoice-kit.xlsx"
  },
  {
    id: "s1",
    slug: "website-setup-help-1h",
    title: "Website Setup Help (1h)",
    type: "service",
    price: 25,
    shortDesc: "One hour of setup + guidance.",
    image: "/globe.svg"
  },
  {
    id: "s2",
    slug: "brand-quick-audit-30m",
    title: "Brand Quick Audit (30m)",
    type: "service",
    price: 15,
    shortDesc: "Fast audit, crystal-clear next steps.",
    image: "/globe.svg"
  },
  {
    id: "p4",
    slug: "icons-mini-pack",
    title: "Icons Mini Pack (PNG)",
    type: "digital",
    price: 5,
    shortDesc: "Tiny crisp icons for UI and slides.",
    image: "/next.svg",
    filePath: "/assets/icons-pack.zip"
  }
]

export function getProductBySlug(slug: string) {
  return products.find(p => p.slug === slug) || null
}
