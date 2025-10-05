import "./globals.css";
import { ThemeProvider } from "@/lib/theme-provider";
import Link from "next/link";

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
          <header className="border-b">
            <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
              <Link href="/" className="text-lg font-semibold">{brand}</Link>
              <nav className="flex items-center gap-4 text-sm">
                <Link href="/shop">Shop</Link>
                <Link href="/cart">Cart</Link>
                {wa ? (
                  <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">
                    WhatsApp
                  </a>
                ) : (
                  <Link href="/contact">Contact</Link>
                )}
                <Link href="/admin">Admin</Link>
              </nav>
            </div>
          </header>

          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-6">{children}</div>
          </main>

          <footer className="border-t">
            <div className="mx-auto w-full max-w-6xl px-6 py-8 text-sm opacity-80">
              © {new Date().getFullYear()} {brand}. All rights reserved.
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}