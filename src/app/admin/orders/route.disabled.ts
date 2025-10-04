import { NextRequest, NextResponse } from "next/server"
import { saveOrder } from "@/lib/store"

let MEMORY_ORDERS: any[] = [] // keep for GET

export async function POST(req: NextRequest) {
  const body = await req.json()
  const orderId = crypto.randomUUID()
  const record = { id: orderId, ...body, createdAt: new Date().toISOString() }
  MEMORY_ORDERS.push(record)
  saveOrder(record)
  return NextResponse.json({ orderId })
}

export async function GET() {
  // return a shallow copy to avoid accidental mutation
  return NextResponse.json([...MEMORY_ORDERS])
}
