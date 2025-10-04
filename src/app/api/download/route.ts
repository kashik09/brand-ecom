import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

const ALLOW_PREFIX = "/assets/";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  // Atomic decrement if valid & not expired
  const upd = await sql/*sql*/`
    UPDATE download_tokens
    SET remaining = remaining - 1
    WHERE token = ${token}
      AND remaining > 0
      AND expires_at > now()
    RETURNING file_path, remaining
  `;

  if (!upd.rowCount) {
    const check = await sql/*sql*/`SELECT remaining, expires_at FROM download_tokens WHERE token = ${token}`;
    if (!check.rowCount) return NextResponse.json({ error: "Invalid token" }, { status: 404 });
    if (check.rows[0].expires_at < new Date()) return NextResponse.json({ error: "Link expired" }, { status: 410 });
    if (check.rows[0].remaining <= 0) return NextResponse.json({ error: "Download limit reached" }, { status: 429 });
    return NextResponse.json({ error: "Blocked" }, { status: 403 });
  }

  const { file_path, remaining } = upd.rows[0] as { file_path: string; remaining: number };

  if (!file_path || !file_path.startsWith(ALLOW_PREFIX)) {
    // rollback if path invalid
    await sql/*sql*/`UPDATE download_tokens SET remaining = remaining + 1 WHERE token = ${token}`;
    return NextResponse.json({ error: "Blocked path" }, { status: 403 });
  }

  const target = new URL(file_path, process.env.NEXT_PUBLIC_SITE_URL!);
  const res = NextResponse.redirect(target, 302);
  res.headers.set("X-Download-Remaining", String(remaining));
  return res;
}
