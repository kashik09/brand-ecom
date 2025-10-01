import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/lib/theme-provider"
import ThemeToggle from "@/components/theme-toggle"
import { CartProvider } from "@/state/cart"
import CartButton from "@/components/CartButton"
import { SettingsProvider } from "@/lib/settings"
import Link from "next/link"

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_BRAND_NAME || "Brand",
  description: "Custom e-commerce MVP",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "BrandName"
  const primary = process.env.NEXT_PUBLIC_PRIMARY_COLOR || "#0EA5E9"

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <style>{`:root{--color-primary:${primary}}`}</style>

        <ThemeProvider>
          <SettingsProvider>
            <CartProvider>
              <header className="border-b sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur">
                <div className="container py-3 flex items-center justify-between">
                  <Link href="/" className="font-semibold text-lg" style={{ color: "var(--color-primary)" }}>
                    {brand}
                  </Link>
                  <nav className="flex items-center gap-3">
                    <Link href="/shop" className="text-sm hover:underline">Shop</Link>
                    <Link href="/contact" className="text-sm hover:underline">Contact</Link>
                    <Link href="/admin" className="text-sm hover:underline">Admin</Link>
                    <CartButton />
                    <ThemeToggle />
                  </nav>
                </div>
              </header>

              <main className="container-narrow py-10">{children}</main>

              <footer className="mt-16 border-t">
                <div className="container py-8 text-sm text-gray-500 flex items-center justify-between">
                  <span>© {new Date().getFullYear()} {brand}</span>
                  <div className="flex gap-4">
                    <Link href="/legal/privacy" className="hover:underline">Privacy</Link>
                    <Link href="/legal/terms" className="hover:underline">Terms</Link>
                    <Link href="/legal/refunds" className="hover:underline">Refunds</Link>
                  </div>
                </div>
              </footer>
            </CartProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
