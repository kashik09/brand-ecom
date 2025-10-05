"use client";

import React from "react";
import { ThemeProvider } from "@/lib/theme-provider";
import { SettingsProvider } from "@/lib/settings";
import { CartProvider } from "@/state/cart";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <SettingsProvider>
        <CartProvider>{children}</CartProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
