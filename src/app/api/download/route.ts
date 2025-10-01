import { NextRequest, NextResponse } from "next/server"
import { consumeToken, getToken, cleanupExpired } from "@/lib/downloads"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 })

  cleanupExpired()

  const t = getToken(token)
  if (!t) return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 })

  // Expiry check
  if (new Date(t.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 })
  }

  if (t.remaining <= 0) {
    return NextResponse.json({ error: "Download limit reached" }, { status: 410 })
  }

  // decrement remaining and redirect to the asset
  consumeToken(token)

  // For MVP: assets live in /public; use a 302 redirect to that path.
  // e.g. /assets/min-portfolio.zip
  return NextResponse.redirect(new URL(t.filePath, req.url))
}
