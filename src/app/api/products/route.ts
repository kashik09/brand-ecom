import { NextRequest, NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const rows = await sql/*sql*/`
      SELECT id, slug, title, description, price, image, type, file_path, short_desc, active, created_at, updated_at
      FROM products
      ORDER BY created_at DESC
    `;
    return NextResponse.json({ products: rows });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { slug, title, description, price, image, type, filePath, shortDesc } = await req.json();
    
    if (!slug || !title || !price || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await sql/*sql*/`
      INSERT INTO products (slug, title, description, price, image, type, file_path, short_desc)
      VALUES (${slug}, ${title}, ${description || null}, ${price}, ${image || null}, ${type}, ${filePath || null}, ${shortDesc || null})
    `;
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, slug, title, description, price, image, type, filePath, shortDesc, active } = await req.json();
    
    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    await sql/*sql*/`
      UPDATE products
      SET slug = COALESCE(${slug}::text, slug),
          title = COALESCE(${title}::text, title),
          description = COALESCE(${description}::text, description),
          price = COALESCE(${price}::numeric, price),
          image = COALESCE(${image}::text, image),
          type = COALESCE(${type}::text, type),
          file_path = COALESCE(${filePath}::text, file_path),
          short_desc = COALESCE(${shortDesc}::text, short_desc),
          active = COALESCE(${active}::boolean, active),
          updated_at = NOW()
      WHERE id = ${id}
    `;
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get("id");
    
    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    await sql/*sql*/`DELETE FROM products WHERE id = ${id}`;
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
