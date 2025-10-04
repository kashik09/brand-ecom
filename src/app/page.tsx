export const metadata = {
  title: "Home",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Build your store fast — full custom.
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Catalog, WhatsApp checkout, digital delivery with gated links,
        zones-based shipping. Let’s ship MVP.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <a
          href="/shop"
          className="block rounded-2xl border p-6 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <h3 className="font-semibold mb-1">Shop</h3>
          <p className="text-sm text-gray-500">See products</p>
        </a>
        <a
          href="/contact"
          className="block rounded-2xl border p-6 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          <h3 className="font-semibold mb-1">Contact</h3>
          <p className="text-sm text-gray-500">WhatsApp inquiries</p>
        </a>
      </div>
    </section>
  );
}
