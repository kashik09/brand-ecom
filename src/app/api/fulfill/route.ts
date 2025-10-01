import { NextRequest, NextResponse } from "next/server"
import { getOrderById } from "@/lib/store"
import { createToken } from "@/lib/downloads"
import { getProductBySlug, products } from "@/lib/products"

// map productId (from cart items) -> actual product
function findProductById(id: string) {
  return products.find(p => p.id === id) || null
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

  const order = getOrderById(orderId)
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
  const remaining = 3 // 3 downloads per item by default

  const links: string[] = []
  for (const item of order.items as any[]) {
    if (item.type !== "digital") continue
    const prod = findProductById(item.productId)
    if (!prod || !prod.filePath) continue

    const token = createToken({
      orderId,
      productId: item.productId,
      filePath: prod.filePath,
      expiresAt,
      remaining,
    })
    links.push(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/download?token=${token.token}`)
  }

  return NextResponse.json({ links })
}
