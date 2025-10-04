
import { Button } from "@/components/ui/button"
import { useCart } from "@/state/cart"
import type { Product } from "@/types/product"

export default function AddToCart({ p }: { p: Product }) {
  const { add } = useCart()
  return (
    <div className="space-y-2">
      <Button onClick={() => add({ productId: p.id, title: p.title, price: p.price, qty: 1, type: p.type })}>
        Add to cart
      </Button>
      <p className="text-xs text-gray-500">Secure digital delivery after checkout.</p>
    </div>
  )
}
