"use client";

import * as React from "react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from "next-themes";

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  // Forwards all next-themes props, including `attribute`, `defaultTheme`, `enableSystem`, etc.
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
