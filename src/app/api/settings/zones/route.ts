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

export async function POST(req: NextRequest) {
  const { code, label, fee, eta } = await req.json()
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })
  await sql/*sql*/`
    insert into settings_zones (code, label, fee, eta)
    values (${code}, ${label || code}, ${fee || 0}, ${eta || ''})
    on conflict (code) do update
    set label = excluded.label, fee = excluded.fee, eta = excluded.eta, updated_at = now()
  `
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code")
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 })
  await sql/*sql*/`delete from settings_zones where code = ${code}`
  return NextResponse.json({ ok: true })
}
