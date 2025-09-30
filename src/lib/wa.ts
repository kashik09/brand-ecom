import type { OrderInput } from "@/types/cart"

export function buildWhatsAppLink(order: OrderInput) {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  if (!num) return null

  const items = order.items.map(i => `- ${i.title} x${i.qty} = $${(i.price*i.qty).toFixed(2)}`).join("%0A")
  const text =
`Order Request
Name: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}

Items:
${items}

Subtotal: $${order.subtotal.toFixed(2)}
Shipping: $${order.shippingFee.toFixed(2)} (${order.shippingZone})
Total: $${order.total.toFixed(2)}
Delivery: ${order.shippingZone === "PICKUP" ? "Pickup" : "Local delivery"}
Notes: ${order.notes ?? "-"}`

  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
}
