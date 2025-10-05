import { products } from "@/lib/products";

export const metadata = {
  title: "Shop",
  alternates: { canonical: "/shop" },
};

export default function ShopPage() {
  return (
    <section className="space-y-6">
      <header className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold">Shop</h1>
          <p className="text-sm text-gray-500">Digital products & services.</p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <a href={`/product/`} className="block border rounded p-4 hover:shadow transition">
  <div className="font-medium">{p.title}</div>
</a>
        ))}
      </div>
    </section>
  );
}
