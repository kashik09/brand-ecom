"use client";

type Props = {
  links: Array<{ title: string; url: string; remaining: number; expiresAt: string | Date }> | null;
  onClose: () => void;
};

export default function LinksDialog({ links, onClose }: Props) {
  if (!links) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Download Links</h2>
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            Close
          </button>
        </div>

        <div className="space-y-3">
          {links.length === 0 ? (
            <div className="text-sm opacity-70">No digital items for this order.</div>
          ) : (
            links.map((l, idx) => (
              <div key={idx} className="rounded-lg border p-3">
                <div className="font-medium">{l.title}</div>
                <div className="text-sm break-all">
                  <a
                    className="underline"
                    href={l.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {l.url}
                  </a>
                </div>
                <div className="text-xs opacity-70">
                  Remaining: {l.remaining} · Expires:{" "}
                  {new Date(l.expiresAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
