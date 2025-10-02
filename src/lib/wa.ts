import type { OrderInput } from "@/types/cart"
import { UGX } from "@/lib/currency"

export function buildWhatsAppLink(order: OrderInput) {
  const num = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""
  if (!num) return null

  const items = order.items
    .map(i => `- ${i.title} x${i.qty} = ${UGX(i.price*i.qty)}`)
    .join("\n")

  const text = `Order Request
Name: ${order.customer.name}
Email: ${order.customer.email}
Phone: ${order.customer.phone}

Items:
${items}

Subtotal: ${UGX(order.subtotal)}
Shipping: ${UGX(order.shippingFee)} (${order.shippingZone})
Total: ${UGX(order.total)}
Delivery: ${order.shippingZone === "PICKUP" ? "Pickup" : "Local delivery"}
Notes: ${order.notes ?? "-"}`

  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`
}
