"use client";

import type { ReactNode } from "react";
import { SettingsProvider } from "@/state/settings";
import { CartProvider } from "@/state/cart";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SettingsProvider>
      <CartProvider>{children}</CartProvider>
    </SettingsProvider>
  );
}
