// super simple in-memory store for dev (resets on server restart)
type AnyOrder = Record<string, any>

const ORDERS: AnyOrder[] = []

export function saveOrder(o: AnyOrder) {
  ORDERS.push(o)
  return o.id as string
}

export function getOrderById(id: string) {
  return ORDERS.find(o => o.id === id) || null
}
