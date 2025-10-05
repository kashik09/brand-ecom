"use client";

import { SettingsProvider } from "@/lib/settings";
import React from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}
