import { NextRequest } from "next/server"
import PDFDocument from "pdfkit"
import { getOrderById } from "@/lib/store"
import { ZONES } from "@/lib/shipping"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get("orderId")
  if (!orderId) {
    return new Response("Missing orderId", { status: 400 })
  }

  const order = getOrderById(orderId)
  if (!order) {
    return new Response("Order not found", { status: 404 })
  }

  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Brand"
  const zone = ZONES[order.shippingZone as keyof typeof ZONES]

  // build PDF in memory
  const doc = new PDFDocument({ size: "A4", margin: 50 })
  const chunks: Uint8Array[] = []
  let resolveCb: (v: ArrayBuffer) => void
  const done = new Promise<ArrayBuffer>((resolve) => (resolveCb = resolve))

  doc.on("data", (c) => chunks.push(c))
  doc.on("end", () => {
    const blob = Buffer.concat(chunks)
    resolveCb!(blob)
  })

  // Header
  doc.fontSize(18).text(`${brand} — Quote / Order ${orderId}`, { continued: false })
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
  doc.moveDown(0.25)
  order.items.forEach((i: any) => {
    doc.fontSize(11).text(`${i.title}  x${i.qty}  —  $${(i.price * i.qty).toFixed(2)}`)
  })
  doc.moveDown()

  // Shipping
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

  // Footer / Refunds
  doc.fontSize(10).fillColor("#666")
  doc.text("Refund Policy: All sales are final. We do not offer refunds or exchanges.")
  doc.end()

  const bytes = await done
  return new Response(bytes, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="quote-${orderId}.pdf"`,
      "Cache-Control": "no-store",
    },
  })
}
