"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UGX } from "@/lib/currency";
import Image from "next/image";

type Product = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  image?: string;
  type: "digital" | "service" | "physical";
  file_path?: string;
  short_desc?: string;
  active: boolean;
};

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    price: 0,
    image: "",
    type: "digital" as "digital" | "service" | "physical",
    filePath: "",
    shortDesc: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const json = await res.json();
      setProducts(json.products || []);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingProduct) {
        await fetch("/api/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingProduct.id,
            ...formData,
          }),
        });
      } else {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      
      setShowModal(false);
      setEditingProduct(null);
      resetForm();
      fetchProducts();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      slug: product.slug,
      title: product.title,
      description: product.description || "",
      price: Number(product.price),
      image: product.image || "",
      type: product.type,
      filePath: product.file_path || "",
      shortDesc: product.short_desc || "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      fetchProducts();
    } catch (error) {
      console.error("Failed to delete product:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      slug: "",
      title: "",
      description: "",
      price: 0,
      image: "",
      type: "digital",
      filePath: "",
      shortDesc: "",
    });
  };

  const openNewProductModal = () => {
    setEditingProduct(null);
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return <div className="p-4 animate-pulse">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Products</h1>
        <Button onClick={openNewProductModal}>Add Product</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <div key={product.id} className="rounded-lg border p-4 space-y-3">
            {product.image && (
              <div className="relative w-full h-32">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
            <div>
              <h3 className="font-semibold">{product.title}</h3>
              <p className="text-sm opacity-70 line-clamp-2">
                {product.short_desc || product.description}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium">{UGX(product.price)}</span>
              <span className="px-2 py-0.5 rounded-full bg-accent text-xs">
                {product.type}
              </span>
              {!product.active && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs">
                  Inactive
                </span>
              )}
            </div>
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEdit(product)}
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDelete(product.id)}
                className="flex-1 text-red-600 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-zinc-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
            <h2 className="text-xl font-bold">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Slug (URL)</label>
                <input
                  type="text"
                  required
                  className="w-full rounded border px-3 py-2 bg-transparent"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="minimal-portfolio-template"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  required
                  className="w-full rounded border px-3 py-2 bg-transparent"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Short Description</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2 bg-transparent"
                  value={formData.shortDesc}
                  onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                  placeholder="Brief description for cards"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Full Description</label>
                <textarea
                  className="w-full rounded border px-3 py-2 bg-transparent"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Price (UGX)</label>
                  <input
                    type="number"
                    required
                    className="w-full rounded border px-3 py-2 bg-transparent"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Type</label>
                  <select
                    className="w-full rounded border px-3 py-2 bg-transparent"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "digital" | "service" | "physical" })}
                  >
                    <option value="digital">Digital</option>
                    <option value="service">Service</option>
                    <option value="physical">Physical</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Image URL</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2 bg-transparent"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="/window.svg or https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">File Path (for digital products)</label>
                <input
                  type="text"
                  className="w-full rounded border px-3 py-2 bg-transparent"
                  value={formData.filePath}
                  onChange={(e) => setFormData({ ...formData, filePath: e.target.value })}
                  placeholder="/assets/file.zip"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    setEditingProduct(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
