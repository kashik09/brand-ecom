import ProductCard from "@/components/ProductCard"
import { products } from "@/lib/products"

export const metadata = { title: "Shop" }

export default function ShopPage() {
  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-sm text-gray-500">Digital products & services.</p>
        </div>
      </header>

      {/* simple filters coming later; MVP shows all */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  )
}
