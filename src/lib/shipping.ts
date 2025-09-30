import type { ShippingZoneCode } from "@/types/cart"

export const ZONES: Record<ShippingZoneCode, { label: string; fee: number; eta: string }> = {
  Z1: { label: "City center",     fee: 5,  eta: "Same day"  },
  Z2: { label: "Inner suburbs",   fee: 7,  eta: "1 day"     },
  Z3: { label: "Outer suburbs",   fee: 10, eta: "1–2 days"  },
  PICKUP: { label: "Pickup at store", fee: 0, eta: "By schedule" },
}
