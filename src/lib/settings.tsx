"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ZONES as DEFAULT_ZONES } from "@/lib/shipping";
import type { ShippingZoneCode } from "@/types/cart";

type Zone = { label: string; fee: number; eta: string };
type Zones = Record<ShippingZoneCode, Zone>;

type SettingsCtx = {
  zones: Zones;
  setZone: (code: ShippingZoneCode, data: Partial<Zone>) => void;
  resetZones: () => void;
};

const KEY = "settings.v1.zones";
const Ctx = createContext<SettingsCtx | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [zones, setZones] = useState<Zones>(DEFAULT_ZONES);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setZones(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(zones));
  }, [zones]);

  function setZone(code: ShippingZoneCode, data: Partial<Zone>) {
    setZones((prev) => ({ ...prev, [code]: { ...prev[code], ...data } }));
  }
  function resetZones() {
    setZones(DEFAULT_ZONES);
  }

  const value = useMemo(() => ({ zones, setZone, resetZones }), [zones]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSettings() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
