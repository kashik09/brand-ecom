import "./globals.css";
import Link from "next/link";
import { ThemeProvider } from "@/lib/theme-provider";
import { SettingsProvider } from "@/lib/settings";
import { CartProvider } from "@/state/cart";
import CartButton from "@/components/CartButton";
import ThemeToggle from "@/components/theme-toggle";

export const metadata = {
  title: { default: "Shop", template: "%s | Shop" },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const brand = process.env.NEXT_PUBLIC_BRAND_NAME || "BrandName";
  const wa = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem={true}>
          <SettingsProvider>
            <CartProvider>
              <header className="border-b">
                <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
                  <Link href="/" className="text-lg font-semibold tracking-tight">{brand}</Link>
                  <nav className="flex items-center gap-4 text-sm">
                    <Link href="/shop" className="hover:underline">Shop</Link>
                    {wa ? (
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:underline">Contact</a>
                    ) : (
                      <Link href="/contact" className="hover:underline">Contact</Link>
                    )}
                    <CartButton />
                    <ThemeToggle />
                  </nav>
                </div>
              </header>

              <main className="flex-1">
                <div className="mx-auto w-full max-w-6xl px-6 py-6">{children}</div>
              </main>

              <footer className="border-t">
                <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm opacity-80 flex flex-wrap items-center justify-between gap-4">
                  <div>© {new Date().getFullYear()} {brand}.</div>
                  <div className="flex items-center gap-4">
                    <Link href="/legal/privacy" className="hover:underline">Privacy</Link>
                    <Link href="/legal/terms" className="hover:underline">Terms</Link>
                    {wa ? (
                      <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp</a>
                    ) : (
                      <Link href="/contact" className="hover:underline">Contact</Link>
                    )}
                  </div>
                </div>
              </footer>
            </CartProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
