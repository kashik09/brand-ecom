/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { items, subtotal, shippingZone, shippingFee, total, customer, notes } = body

  // Insert order and return row
  const [order] = await sql/*sql*/`
    insert into orders (subtotal, shipping_zone, shipping_fee, total,
      customer_name, customer_email, customer_phone, notes)
    values (${subtotal}, ${shippingZone}, ${shippingFee}, ${total},
      ${customer?.name || null}, ${customer?.email || null}, ${customer?.phone || null}, ${notes || null})
    returning *
  `

  // Insert items
  if (Array.isArray(items) && items.length) {
    const rows = items.map((i: any) => [order.id, i.productId, i.title, i.price, i.qty, i.type])
    await sql/*sql*/`
      insert into order_items (order_id, product_id, title, price, qty, type)
      select * from unnest(
        ${sql(rows.map(r => r[0]))}::uuid[],
        ${sql(rows.map(r => r[1]))}::text[],
        ${sql(rows.map(r => r[2]))}::text[],
        ${sql(rows.map(r => r[3]))}::numeric[],
        ${sql(rows.map(r => r[4]))}::int[],
        ${sql(rows.map(r => r[5]))}::text[]
      )
    `
  }

  return NextResponse.json({ orderId: order.id })
}

export async function GET() {
  const orders = await sql/*sql*/`select * from orders order by created_at desc`
  if (!orders.length) return NextResponse.json([])

  const ids = orders.map((o: any) => o.id)
  const items = await sql/*sql*/`
    select * from order_items where order_id in ${sql(ids)}
  `

  const itemsByOrder: Record<string, any[]> = {}
  for (const it of items) {
    (itemsByOrder[it.order_id] ??= []).push({
      productId: it.product_id,
      title: it.title,
      price: Number(it.price),
      qty: it.qty,
      type: it.type,
    })
  }

  const payload = orders.map((o: any) => ({
    id: o.id,
    createdAt: o.created_at,
    subtotal: Number(o.subtotal),
    shippingZone: o.shipping_zone,
    shippingFee: Number(o.shipping_fee),
    total: Number(o.total),
    customer: {
      name: o.customer_name,
      email: o.customer_email,
      phone: o.customer_phone,
    },
    notes: o.notes,
    items: itemsByOrder[o.id] || [],
  }))

  return NextResponse.json(payload)
}
