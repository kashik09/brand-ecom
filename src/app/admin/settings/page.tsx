"use client"
import { useSettings } from "@/lib/settings"
import type { ShippingZoneCode } from "@/types/cart"

const ORDER: ShippingZoneCode[] = ["Z1", "Z2", "Z3", "PICKUP"]
const NAMES: Record<ShippingZoneCode, string> = {
  Z1: "City center",
  Z2: "Inner suburbs",
  Z3: "Outer suburbs",
  PICKUP: "Pickup at store"
}

export default function SettingsPage() {
  const { zones, setZone, resetZones } = useSettings()

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <h2 className="font-semibold">Shipping Zones</h2>

      <div className="space-y-4">
        {ORDER.map(code => {
          const z = zones[code]
          return (
            <div key={code} className="rounded-xl border p-4 grid md:grid-cols-4 gap-3">
              <div>
                <div className="text-xs text-gray-500">Code</div>
                <div className="font-mono font-semibold">{code}</div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Label</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={z.label}
                  onChange={e => setZone(code, { label: e.target.value })}
                  placeholder={NAMES[code]}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Fee (USD)</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  type="number" min={0} step={1}
                  value={z.fee}
                  onChange={e => setZone(code, { fee: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">ETA</label>
                <input
                  className="w-full rounded border px-3 py-2"
                  value={z.eta}
                  onChange={e => setZone(code, { eta: e.target.value })}
                />
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex gap-3">
        <button
          className="rounded-lg border px-4 py-2"
          onClick={resetZones}
        >
          Reset to defaults
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Changes are saved automatically in your browser. Checkout uses these values live.
      </p>
    </section>
  )
}
