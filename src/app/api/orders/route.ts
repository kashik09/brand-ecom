import { NextRequest, NextResponse } from "next/server"
import { saveOrder, type StoredOrder } from "@/lib/store"

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Omit<StoredOrder, "id" | "createdAt">
  const orderId = crypto.randomUUID()
  const saved: StoredOrder = {
    id: orderId,
    createdAt: new Date().toISOString(),
    ...body,
  }
  saveOrder(saved)
  return NextResponse.json({ orderId })
}
