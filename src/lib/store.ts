import type { OrderInput } from "@/types/cart"

export type StoredOrder = OrderInput & {
  id: string
  createdAt: string
}

const ORDERS: StoredOrder[] = []

export function saveOrder(o: StoredOrder) {
  ORDERS.push(o)
  return o.id
}

export function getOrderById(id: string): StoredOrder | null {
  return ORDERS.find(o => o.id === id) ?? null
}
