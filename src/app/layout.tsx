import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/lib/theme-provider";
import CartButton from "@/components/CartButton";
import ThemeToggle from "@/components/theme-toggle";

export const metadata = {
  title: {
    default: "Shop",
    template: "%s | Shop",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "Brand";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          {/* Header / Nav */}
          <header className="border-b">
            <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
              {/* Brand with breathing room */}
              <Link href="/" className="text-lg font-semibold tracking-tight">
                {brand}
              </Link>

              {/* Primary nav */}
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/shop" className="hover:underline">Shop</Link>

                {/* Cart with count */}
                <Link href="/cart" className="relative hover:underline">
                  <span className="sr-only">Cart</span>
                  <CartButton />
                </Link>

                {/* WhatsApp or Contact */}
                {wa ? (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    WhatsApp
                  </a>
                ) : (
                  <Link href="/contact" className="hover:underline">Contact</Link>
                )}

                {/* Hidden admin entry (guarded by middleware) */}
                <Link href="/admin" className="hover:underline">Admin</Link>

                {/* Theme toggle */}
                <ThemeToggle />
              </nav>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-6">{children}</div>
          </main>

          {/* Sticky footer */}
          <footer className="border-t">
            <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm opacity-80 flex flex-wrap items-center justify-between gap-4">
              <div>© {new Date().getFullYear()} {brand}. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <Link href="/legal/privacy" className="hover:underline">Privacy</Link>
                <Link href="/legal/terms" className="hover:underline">Terms</Link>
                {wa ? (
                  <a
                    href={`https://wa.me/${wa}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                  >
                    WhatsApp
                  </a>
                ) : (
                  <Link href="/contact" className="hover:underline">Contact</Link>
                )}
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
