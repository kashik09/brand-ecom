"use client";

import { useEffect, useState } from "react";
import { ugx } from "@/lib/currency";

type Zone = { label: string; fee: number; eta: string; updatedAt: string };
type ZonesMap = Record<string, Zone>;

async function safeJSON(res: Response) {
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!text) return {};
  try { return JSON.parse(text); } catch { return {}; }
}

export default function SettingsClient() {
  const [zones, setZones] = useState<ZonesMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ area: "", fee: 0, eta: "" });

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/zones", { cache: "no-store" });
      const json = await safeJSON(res);
      setZones((json as any).zones || {});
    } catch (e: any) {
      console.error("Zones load error:", e);
      setError("Could not load locations. Try again.");
      setZones({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const save = async (area: string, patch: Partial<Zone>) => {
    await fetch("/api/settings/zones", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: area, ...patch }),
    });
    refresh();
  };

  const add = async () => {
    if (!form.area.trim()) return;
    await fetch("/api/settings/zones", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code: form.area.trim(), label: form.area.trim(), fee: Number(form.fee||0), eta: form.eta }),
    });
    setForm({ area: "", fee: 0, eta: "" });
    refresh();
  };

  const remove = async (area: string) => {
    await fetch(`/api/settings/zones?code=${encodeURIComponent(area)}`, { method: "DELETE" });
    refresh();
  };

  if (loading) return <div className="p-4 animate-pulse text-sm opacity-70">Loading settings…</div>;

  const entries = Object.entries(zones);

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-600 px-3 py-2 text-sm">{error}</div>}

      <section className="rounded-2xl border p-4">
        <h2 className="font-semibold mb-3">Locations (Shipping Areas)</h2>
        {entries.length === 0 ? (
          <div className="text-sm opacity-70">No areas yet. Add one below.</div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {entries.map(([area, z]) => (
              <div key={area} className="rounded-xl border p-3 space-y-2">
                <div className="text-sm opacity-70">Area</div>
                <div className="font-medium">{area}</div>

                <label className="text-sm opacity-70 block mt-2">Fee (UGX)</label>
                <input
                  className="w-full rounded border px-2 py-1 bg-background"
                  type="number"
                  defaultValue={Number(z.fee)}
                  onBlur={e => save(area, { fee: Number(e.currentTarget.value || 0) })}
                />

                <label className="text-sm opacity-70 block mt-2">Estimated Time</label>
                <input
                  className="w-full rounded border px-2 py-1 bg-background"
                  type="text"
                  defaultValue={z.eta}
                  onBlur={e => save(area, { eta: e.currentTarget.value })}
                />

                <div className="flex justify-between items-center mt-2 text-xs opacity-70">
                  <span>Updated: {new Date(z.updatedAt).toLocaleString()}</span>
                  <button className="underline" onClick={() => remove(area)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border p-4">
        <h3 className="font-semibold mb-3">Add new area</h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <input
            className="rounded border px-2 py-1 bg-background"
            placeholder="Area (e.g., Kampala Central)"
            value={form.area}
            onChange={e => setForm(f => ({ ...f, area: e.target.value }))}
          />
          <input
            className="rounded border px-2 py-1 bg-background"
            type="number"
            placeholder="Fee (UGX)"
            value={String(form.fee)}
            onChange={e => setForm(f => ({ ...f, fee: Number(e.target.value || 0) }))}
          />
          <input
            className="rounded border px-2 py-1 bg-background"
            placeholder="ETA (e.g., same day)"
            value={form.eta}
            onChange={e => setForm(f => ({ ...f, eta: e.target.value }))}
          />
        </div>
        <button className="mt-3 rounded-lg border px-3 py-1 text-sm hover:bg-accent" onClick={add}>Add area</button>
      </section>
    </div>
  );
}
