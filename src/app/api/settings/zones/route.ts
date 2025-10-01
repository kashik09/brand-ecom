import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET() {
  const rows = await sql/*sql*/`select code, label, fee, eta from settings_zones order by code asc`
  const zones: Record<string, { label: string; fee: number; eta: string }> = {}
  for (const r of rows) {
    zones[r.code] = { label: r.label, fee: Number(r.fee), eta: r.eta }
  }
  return NextResponse.json({ zones })
}

export async function PATCH(req: NextRequest) {
  const { code, data } = await req.json()
  if (!code || !data) return NextResponse.json({ error: "Missing code/data" }, { status: 400 })

  await sql/*sql*/`
    update settings_zones
    set label = coalesce(${data.label}::text, label),
        fee   = coalesce(${data.fee}::numeric, fee),
        eta   = coalesce(${data.eta}::text, eta),
        updated_at = now()
    where code = ${code}
  `
  return NextResponse.json({ ok: true })
}
