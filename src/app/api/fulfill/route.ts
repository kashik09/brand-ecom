/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { orderId, ttlMinutes = 60 * 24, maxUses = 3 } = await req.json();
    if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

    // Ensure order exists
    const ord = await sql/*sql*/`SELECT id FROM orders WHERE id = ${orderId}::uuid`;
    if (!ord.length) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Fetch only digital items
    const items = await sql/*sql*/`
      SELECT product_id, title
      FROM order_items
      WHERE order_id = ${orderId}::uuid AND type = 'digital'
      ORDER BY id ASC
    `;

    // Map productId -> filePath from seed
    const { products } = await import("@/lib/products");
    const ALLOW_PREFIX = "/assets/";
    const fileById = new Map(products.map((p: any) => [p.id ?? p.slug ?? p.productId, p.filePath]));

    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
    const links: Array<{ productId: string; title: string; token: string; url: string; expiresAt: Date; remaining: number }> = [];

    for (const it of items) {
      const filePath = fileById.get(it.product_id);
      if (!filePath || !filePath.startsWith(ALLOW_PREFIX)) continue;

      const token = crypto.randomBytes(24).toString("hex");
      await sql/*sql*/`
        INSERT INTO download_tokens (token, order_id, product_id, file_path, expires_at, remaining)
        VALUES (${token}, ${orderId}::uuid, ${it.product_id}, ${filePath}, ${expiresAt.toISOString()}, ${maxUses})
      `;
      links.push({
        productId: it.product_id,
        title: it.title,
        token,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/download?token=${token}`,
        expiresAt,
        remaining: maxUses,
      });
    }

    return NextResponse.json({ links });
  } catch (e) {
    console.error("[POST /api/fulfill]", e);
    return NextResponse.json({ error: "Failed to fulfill" }, { status: 500 });
  }
}
