import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { products } from "@/lib/products"

function findProductById(id: string) {
  return products.find(p => p.id === id) || null
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 })

  // Prisma model is Order, not orders
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true }, // OrderItem[]
  })
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 })

  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const remaining = 3
  const origin = new URL(req.url).origin

  const links: string[] = []
  for (const item of order.items) {
    if (item.type !== "digital") continue
    // Prisma field is productId (camel), mapped to product_id in DB
    const prod = findProductById(item.productId)
    if (!prod?.filePath) continue

    const token = crypto.randomUUID().replace(/-/g, "")

    // Prisma model is DownloadToken, fields are camelCase
    await prisma.downloadToken.create({
      data: {
        token,
        orderId: order.id,
        productId: item.productId,
        filePath: prod.filePath,
        expiresAt,
        remaining,
      },
    })

    links.push(`${origin}/api/download?token=${token}`)
  }

  return NextResponse.json({ links })
}
