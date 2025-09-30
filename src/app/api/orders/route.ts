import { NextRequest, NextResponse } from "next/server"

let MEMORY_ORDERS: any[] = [] // temp in-memory store (wire Supabase later)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const orderId = crypto.randomUUID()
  MEMORY_ORDERS.push({ id: orderId, ...body, createdAt: new Date().toISOString() })
  return NextResponse.json({ orderId })
}
