import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const { password } = await req.json()
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "nope" }, { status: 401 })
  }
  const res = NextResponse.json({ ok: true })
  res.cookies.set("admin", "1", { httpOnly: true, sameSite: "lax", path: "/admin", maxAge: 60*60*8 })
  return res
}
