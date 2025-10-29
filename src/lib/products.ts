import { Product } from "@/types/product";
import { sql } from "@/lib/db";

// Fallback products (used if database is empty or unavailable)
export const fallbackProducts: Product[] = [
  {
    id: "p1",
    slug: "minimal-portfolio-template",
    title: "Minimal Portfolio Template",
    type: "digital",
    price: 19,
    shortDesc: "Clean HTML/CSS portfolio starter.",
    image: "/window.svg",
    filePath: "/assets/min-portfolio.zip"
  },
  {
    id: "p2",
    slug: "social-media-starter-pack",
    title: "Social Media Starter Pack",
    type: "digital",
    price: 9,
    shortDesc: "Caption cheatsheets + post ideas.",
    image: "/file.svg",
    filePath: "/assets/smpack.pdf"
  },
  {
    id: "p3",
    slug: "invoice-quote-kit",
    title: "Invoice & Quote Kit",
    type: "digital",
    price: 7,
    shortDesc: "Excel templates that just work.",
    image: "/file.svg",
    filePath: "/assets/invoice-kit.xlsx"
  },
  {
    id: "s1",
    slug: "website-setup-help-1h",
    title: "Website Setup Help (1h)",
    type: "service",
    price: 25,
    shortDesc: "One hour of setup + guidance.",
    image: "/globe.svg"
  },
  {
    id: "s2",
    slug: "brand-quick-audit-30m",
    title: "Brand Quick Audit (30m)",
    type: "service",
    price: 15,
    shortDesc: "Fast audit, crystal-clear next steps.",
    image: "/globe.svg"
  },
  {
    id: "p4",
    slug: "icons-mini-pack",
    title: "Icons Mini Pack (PNG)",
    type: "digital",
    price: 5,
    shortDesc: "Tiny crisp icons for UI and slides.",
    image: "/next.svg",
    filePath: "/assets/icons-pack.zip"
  }
];

// Fetch products from database
export async function getProducts(): Promise<Product[]> {
  try {
    const rows = await sql/*sql*/`
      SELECT id, slug, title, description, price, image, type, file_path, short_desc, active
      FROM products
      WHERE active = true
      ORDER BY created_at DESC
    `;
    
    return rows.map((r: any) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      type: r.type as "digital" | "service" | "physical",
      price: Number(r.price),
      shortDesc: r.short_desc || r.description?.substring(0, 100),
      image: r.image,
      filePath: r.file_path,
      description: r.description,
    }));
  } catch (error) {
    console.warn("Failed to fetch products from database, using fallback:", error);
    return fallbackProducts;
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rows = await sql/*sql*/`
      SELECT id, slug, title, description, price, image, type, file_path, short_desc
      FROM products
      WHERE slug = ${slug} AND active = true
      LIMIT 1
    `;
    
    if (rows.length === 0) {
      // Fallback to hardcoded products
      return fallbackProducts.find(p => p.slug === slug) || null;
    }
    
    const r = rows[0];
    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      type: r.type as "digital" | "service" | "physical",
      price: Number(r.price),
      shortDesc: r.short_desc || r.description?.substring(0, 100),
      image: r.image,
      filePath: r.file_path,
      description: r.description,
    };
  } catch (error) {
    console.warn("Failed to fetch product, using fallback:", error);
    return fallbackProducts.find(p => p.slug === slug) || null;
  }
}

// For backward compatibility (sync version using fallback)
export const products = fallbackProducts;
