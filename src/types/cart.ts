import type { Product } from "@/types/product"

export type CartItem = {
  id: string
  productId: string
  title: string
  price: number
  qty: number
  type: Product["type"]
}

export type Customer = {
  name: string
  email: string
  phone: string
}

export type ShippingZoneCode = "Z1" | "Z2" | "Z3" | "PICKUP"

export type OrderInput = {
  items: CartItem[]
  subtotal: number
  shippingZone: ShippingZoneCode
  shippingFee: number
  total: number
  customer: Customer
  notes?: string
}
