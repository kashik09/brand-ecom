import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("admin")?.value
  if (cookie !== "1") return NextResponse.json({ error: "unauthorized" }, { status: 401 })

  const users = await prisma.user.findMany({
    select: { id: true, email: true, phone: true, fullName: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({
    users: users.map(u => ({
      id: u.id,
      email: u.email,
      phone: u.phone,
      fullName: u.fullName,
      createdAt: u.createdAt,
    }))
  })
}
