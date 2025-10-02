import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get("token")
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 })

  const t = await prisma.downloadToken.findUnique({ where: { token } })
  if (!t) return NextResponse.json({ error: "Invalid or expired token" }, { status: 404 })

  if (t.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Token expired" }, { status: 410 })
  }
  if (t.remaining <= 0) {
    return NextResponse.json({ error: "Download limit reached" }, { status: 410 })
  }

  await prisma.downloadToken.update({
    where: { token },
    data: { remaining: t.remaining - 1 },
  })

  return NextResponse.redirect(new URL(t.filePath, req.url))
}
