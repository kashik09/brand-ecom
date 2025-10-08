"use client";

import { useEffect, useMemo, useState } from "react";

type Zone = { label: string; fee: number; eta: string; updatedAt?: string };
type ZonesMap = Record<string, Zone>;

async function safeJSON(res: Response) {
  const t = await res.text();
  if (!t) return {};
  try { return JSON.parse(t); } catch { return {}; }
}

export default function SettingsClient() {
  const [zones, setZones] = useState<ZonesMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [show, setShow] = useState(false);
  const [newArea, setNewArea] = useState({ area: "", fee: 0, eta: "" });

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/settings/zones", { cache: "no-store" });
      const json = await safeJSON(res);
      setZones((json as any).zones || {});
    } catch {
      setError("Could not load delivery areas.");
      setZones({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const entries = useMemo(() => Object.entries(zones), [zones]);

  const update = async (area: string, patch: Partial<Zone> & { newArea?: string }) => {
    await fetch("/api/settings/zones", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: area,
        newCode: patch.newArea ? String(patch.newArea).trim() : undefined,
        label: patch.newArea ? String(patch.newArea).trim() : undefined,
        fee: typeof patch.fee === "number" ? patch.fee : undefined,
        eta: typeof patch.eta === "string" ? patch.eta : undefined,
      }),
    });
    await refresh();
  };

  const add = async () => {
    const area = newArea.area.trim();
    if (!area) return;
    await fetch("/api/settings/zones", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code: area,
        label: area,
        fee: Number(newArea.fee || 0),
        eta: newArea.eta || "",
      }),
    });
    setShow(false);
    setNewArea({ area: "", fee: 0, eta: "" });
    await refresh();
  };

  const remove = async (area: string) => {
    await fetch(`/api/settings/zones?code=${encodeURIComponent(area)}`, { method: "DELETE" });
    await refresh();
  };

  if (loading) return <div className="p-4 animate-pulse text-sm opacity-70">Loading delivery settings…</div>;

  return (
    <div className="space-y-6">
      {error && <div className="rounded-lg border border-red-500/40 bg-red-500/10 text-red-600 px-3 py-2 text-sm">{error}</div>}

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Delivery Areas</h1>
        <button
          onClick={() => setShow(true)}
          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Add delivery area
        </button>
      </div>

      {/* cards (NO hooks here) */}
      <section className="grid sm:grid-cols-2 gap-4">
        {entries.map(([area, z]) => (
          <AreaCard
            key={area}
            area={area}
            zone={z}
            onSaveName={(newArea) => update(area, { newArea })}
            onSaveFee={(fee) => update(area, { fee })}
            onSaveEta={(eta) => update(area, { eta })}
            onRemove={() => remove(area)}
          />
        ))}
      </section>

      {/* modal for adding new area */}
      {show && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShow(false)} />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border bg-background shadow-xl">
              <div className="p-4 border-b">
                <h3 className="font-semibold">Add delivery area</h3>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="text-sm opacity-70 block">Area name</label>
                  <input
                    className="w-full rounded border px-2 py-1 bg-background"
                    placeholder="e.g., Kampala Central"
                    value={newArea.area}
                    onChange={(e) => setNewArea(a => ({ ...a, area: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm opacity-70 block">Delivery fee (UGX)</label>
                  <input
                    type="number"
                    className="w-full rounded border px-2 py-1 bg-background"
                    placeholder="0"
                    value={String(newArea.fee)}
                    onChange={(e) => setNewArea(a => ({ ...a, fee: Number(e.target.value || 0) }))}
                  />
                </div>
                <div>
                  <label className="text-sm opacity-70 block">Estimated time</label>
                  <input
                    className="w-full rounded border px-2 py-1 bg-background"
                    placeholder="e.g., same day"
                    value={newArea.eta}
                    onChange={(e) => setNewArea(a => ({ ...a, eta: e.target.value }))}
                  />
                </div>
              </div>
              <div className="p-4 border-t flex items-center justify-end gap-2">
                <button className="px-3 py-1.5 text-sm rounded-lg border" onClick={() => setShow(false)}>Cancel</button>
                <button className="px-3 py-1.5 text-sm rounded-lg border hover:bg-accent" onClick={add}>Add area</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Per-card component with its own hooks */
function AreaCard({
  area,
  zone,
  onSaveName,
  onSaveFee,
  onSaveEta,
  onRemove,
}: {
  area: string;
  zone: Zone;
  onSaveName: (name: string) => void;
  onSaveFee: (fee: number) => void;
  onSaveEta: (eta: string) => void;
  onRemove: () => void;
}) {
  const [name, setName] = useState(area);
  const [fee, setFee] = useState<number>(Number(zone.fee || 0));
  const [eta, setEta] = useState(zone.eta || "");

  const niceDate = zone.updatedAt ? new Date(zone.updatedAt).toLocaleString() : "-";

  return (
    <div className="rounded-2xl border p-4 space-y-2 relative">
      <div className="text-sm opacity-70">Area</div>
      <input
        className="w-full rounded border px-2 py-1 bg-background font-medium"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => name && name !== area && onSaveName(name)}
      />

      <label className="text-sm opacity-70 block mt-2">Delivery fee (UGX)</label>
      <input
        className="w-full rounded border px-2 py-1 bg-background"
        type="number"
        value={String(fee)}
        onChange={(e) => setFee(Number(e.target.value || 0))}
        onBlur={() => onSaveFee(fee)}
      />

      <label className="text-sm opacity-70 block mt-2">Estimated time</label>
      <input
        className="w-full rounded border px-2 py-1 bg-background"
        type="text"
        value={eta}
        onChange={(e) => setEta(e.target.value)}
        onBlur={() => onSaveEta(eta)}
      />

      <div className="flex items-center justify-between mt-2 text-xs opacity-70">
        <span>Updated: {niceDate}</span>
        <button className="underline" onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}
