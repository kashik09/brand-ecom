import type { NextRequest } from "next/server"
import { getOrderById } from "@/lib/store"
import { ZONES } from "@/lib/shipping"

// force node runtime
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  // 👇 import as CJS module
  const PDFKit = (await import("pdfkit")) as any
  const PDFDocument = PDFKit.default || PDFKit

  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  if (!orderId) return new Response("Missing orderId", { status: 400 })

  const order = getOrderById(orderId)
  if (!order) return new Response("Order not found", { status: 404 })

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Brand"
  const zone = ZONES[order.shippingZone as keyof typeof ZONES]

  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Uint8Array[] = []

  const done = new Promise<Uint8Array>((resolve) => {
    doc.on("data", (c: Uint8Array) => chunks.push(c))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
  })

  // --- build PDF ---
  doc.fontSize(18).text(`${brand} — Quote / Order ${orderId}`)
  doc.moveDown(0.5)
  doc.fontSize(10).fillColor("#555").text(new Date(order.createdAt).toLocaleString())
  doc.moveDown()

  doc.fillColor("#000").fontSize(12).text("Customer", { underline: true })
  doc.fontSize(11).text(`Name: ${order.customer?.name || "-"}`)
  doc.text(`Email: ${order.customer?.email || "-"}`)
  doc.text(`Phone: ${order.customer?.phone || "-"}`)
  doc.moveDown()

  doc.fontSize(12).text("Items", { underline: true })
  order.items.forEach((i: any) => {
    doc.fontSize(11).text(`${i.title} x${i.qty} — $${(i.price * i.qty).toFixed(2)}`)
  })
  doc.moveDown()

  doc.fontSize(12).text("Delivery", { underline: true })
  doc.fontSize(11).text(`Zone: ${order.shippingZone} (${zone.label})`)
  doc.text(`ETA: ${zone.eta}`)
  doc.text(`Shipping fee: $${order.shippingFee.toFixed(2)}`)
  doc.moveDown()

  doc.fontSize(12).text("Totals", { underline: true })
  doc.fontSize(11).text(`Subtotal: $${order.subtotal.toFixed(2)}`)
  doc.text(`Total: $${order.total.toFixed(2)}`)
  doc.moveDown()

  doc.fontSize(10).fillColor("#666").text("Refund Policy: All sales are final. We do not offer refunds or exchanges.")
  doc.end()
  // --- end build ---

  const buffer = (await done) as Buffer
  const body: ArrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${orderId}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
