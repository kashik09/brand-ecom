export type ProductType = "digital" | "service"

export type Product = {
  id: string
  slug: string
  title: string
  type: ProductType
  price: number
  shortDesc: string
  image: string
  // digital-only (used later for gated downloads)
  filePath?: string
}
