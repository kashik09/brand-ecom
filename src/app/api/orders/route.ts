/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { OrderPostInput } from "@/lib/validators";
import { dec, toUnnestArrays } from "@/lib/sql-helpers";

// POST /api/orders
// Create order + items using parameterized UNNEST bulk insert
export async function POST(req: Request) {
  try {
    const body = OrderPostInput.parse(await req.json());

    // 1) create order, return row
    const orderRes = await sql/*sql*/`
      INSERT INTO orders
        (subtotal, shipping_zone, shipping_fee, total, customer_name, customer_email, customer_phone, notes)
      VALUES
        (${dec(body.subtotal)}, ${body.shippingZone}, ${dec(body.shippingFee)}, ${dec(body.total)},
         ${body.customerName ?? null}, ${body.customerEmail ?? null}, ${body.customerPhone ?? null}, ${body.notes ?? null})
      RETURNING id, created_at, subtotal, shipping_zone, shipping_fee, total,
                customer_name, customer_email, customer_phone, notes
    `;
    const o = orderRes[0];

    // 2) bulk insert items via UNNEST (fully parameterized)
    const rows = body.items.map((it) => ({
      orderId: o.id as string,
      productId: it.productId,
      title: it.title,
      price: dec(it.price),
      qty: it.qty,
      type: it.type,
    }));
    const arrays = toUnnestArrays(rows);

    if (rows.length > 0) {
      await sql/*sql*/`
        INSERT INTO order_items (order_id, product_id, title, price, qty, type)
        SELECT * FROM UNNEST(
          ${arrays.orderIds}::uuid[],
          ${arrays.productIds}::text[],
          ${arrays.titles}::text[],
          ${arrays.prices}::numeric[],
          ${arrays.qtys}::int[],
          ${arrays.types}::text[]
        )
      `;
    }

    // 3) fetch items (ordered) to build response
    const itemsRes = await sql/*sql*/`
      SELECT id, product_id AS "productId", title, price, qty, type
      FROM order_items
      WHERE order_id = ${o.id}::uuid
      ORDER BY id ASC
    `;

    return NextResponse.json(
      {
        id: o.id,
        createdAt: o.created_at,
        customer: {
          name: o.customer_name,
          email: o.customer_email,
          phone: o.customer_phone,
        },
        subtotal: o.subtotal,
        shippingZone: o.shipping_zone,
        shippingFee: o.shipping_fee,
        total: o.total,
        notes: o.notes,
        items: itemsRes,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error("[POST /api/orders]", e);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

// GET /api/orders
// Single-query read with JSON_AGG for items
export async function GET() {
  try {
    const res = await sql/*sql*/`
      SELECT
        o.id,
        o.created_at,
        o.subtotal,
        o.shipping_zone,
        o.shipping_fee,
        o.total,
        o.customer_name,
        o.customer_email,
        o.customer_phone,
        o.notes,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'title', oi.title,
              'price', oi.price,
              'qty', oi.qty,
              'type', oi.type
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const data = res.map((o: any) => ({
      id: o.id,
      createdAt: o.created_at,
      customer: {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
      },
      subtotal: o.subtotal,
      shippingZone: o.shipping_zone,
      shippingFee: o.shipping_fee,
      total: o.total,
      notes: o.notes,
      items: o.items,
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error("[GET /api/orders]", e);
    return NextResponse.json({ error: "Failed to list orders" }, { status: 500 });
  }
}
