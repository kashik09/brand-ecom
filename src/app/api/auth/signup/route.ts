import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { email, password, fullName, phone } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 409 })

  const hashed = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: { email, hashedPassword: hashed, fullName: fullName || null, phone: phone || null },
  })
  await prisma.profile.create({ data: { userId: user.id } })

  return NextResponse.json({ ok: true })
}
