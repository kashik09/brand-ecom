import type { NextRequest } from "next/server"
import { getOrderById } from "@/lib/store"
import { ZONES } from "@/lib/shipping"

// Force Node runtime (pdfkit needs Node streams)
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // dynamic import with default — works with our shim
  const { default: PDFDocument }: { default: any } = await import("pdfkit")

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  if (!orderId) return new Response("Missing orderId", { status: 400 })

  const order = getOrderById(orderId)
  if (!order) return new Response("Order not found", { status: 404 })

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Brand"
  const zone = ZONES[order.shippingZone as keyof typeof ZONES]

  // Build PDF in memory
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Buffer[] = []

  const done = new Promise<Buffer>((resolve) => {
    doc.on("data", (c: Buffer) => chunks.push(c))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  })

  // Header
  doc.fontSize(18).text(`${brand} — Quote / Order ${orderId}`)
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor("#555").text(new Date(order.createdAt).toLocaleString())
  doc.moveDown()

  // Customer
  doc.fillColor("#000").fontSize(12).text("Customer", { underline: true })
  doc.fontSize(11).text(`Name: ${order.customer?.name || "-"}`)
  doc.text(`Email: ${order.customer?.email || "-"}`)
  doc.text(`Phone: ${order.customer?.phone || "-"}`)
  doc.moveDown()

  // Items
  doc.fontSize(12).text("Items", { underline: true })
  for (const i of order.items as any[]) {
    doc.fontSize(11).text(`${i.title} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`)
  }
  doc.moveDown()

  // Delivery
  doc.fontSize(12).text("Delivery", { underline: true })
  doc.fontSize(11).text(`Zone: ${order.shippingZone} (${zone.label})`)
  doc.text(`ETA: ${zone.eta}`)
  doc.text(`Shipping fee: $${order.shippingFee.toFixed(2)}`)
  doc.moveDown()

  // Totals
  doc.fontSize(12).text("Totals", { underline: true })
  doc.fontSize(11).text(`Subtotal: $${order.subtotal.toFixed(2)}`)
  doc.text(`Total: $${order.total.toFixed(2)}`)
  doc.moveDown()

  // Footer
  doc.fontSize(10).fillColor("#666")
  doc.text("Refund Policy: All sales are final. We do not offer refunds or exchanges.")
  doc.end()

  // Convert Buffer -> Uint8Array for Response body (TS-friendly)
  const buf = await done
  const body = new Uint8Array(buf)

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${orderId}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
