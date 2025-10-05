"use client";

import { ThemeProvider } from "@/lib/theme-provider";
import { SettingsProvider } from "@/lib/settings";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </ThemeProvider>
    </SettingsProvider>
  );
}
