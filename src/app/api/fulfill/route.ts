import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { products } from "@/lib/products"

// helper: find seeded product by id
function findProductById(id: string) {
  return products.find(p => p.id === id) || null
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

  // pull order + items from Neon via Prisma
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: { items: true },
  })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  // token defaults
  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
  const remaining = 3

  const origin = new URL(req.url).origin // works in dev/prod without env
  const links: string[] = []

  for (const item of order.items) {
    if (item.type !== "digital") continue
    const prod = findProductById(item.product_id)
    if (!prod?.filePath) continue

    const token = crypto.randomUUID().replace(/-/g, "")
    await prisma.download_tokens.create({
      data: {
        token,
        order_id: order.id,
        product_id: item.product_id,
        file_path: prod.filePath,
        expires_at: expiresAt,
        remaining,
      },
    })

    links.push(`${origin}/api/download?token=${token}`)
  }

  return NextResponse.json({ links })
}
