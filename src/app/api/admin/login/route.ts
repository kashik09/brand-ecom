import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { password } = await req.json();
  if (!password) return NextResponse.json({ error: "Password required" }, { status: 400 });

  const ok = password === process.env.ADMIN_PASSWORD;
  if (!ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/admin",
    maxAge: 60 * 60 * 8, // 8h
  });
  return res;
}