import type { Asset, CaptureSession } from "@/lib/types";

const checklist = [
  {
    kind: "founder_clip",
    title: "Founder clip",
    target: 1,
    detail: "Target: 1 clip, 2-3 min",
  },
  {
    kind: "product_clip",
    title: "Product sequence",
    target: 5,
    detail: "Target: fruit, cup in, blending, finished smoothie, branding",
  },
  {
    kind: "lifestyle_clip",
    title: "Lifestyle sequence",
    target: 5,
    detail: "Target: gym, cycling, morning, laptop, nature, smoothie",
  },
  {
    kind: "proof_clip",
    title: "Proof / problem clip",
    target: 1,
    detail: "Target: testing, cleaning, supplier, machine issue",
  },
  {
    kind: "photo",
    title: "Photos",
    target: 5,
    detail: "Target: you, ingredients, cup, machine, lifestyle",
  },
] as const;

export function CaptureChecklist({
  session,
  assets,
  addAssetAction,
  completeAction,
}: {
  session: CaptureSession;
  assets: Asset[];
  addAssetAction: (formData: FormData) => Promise<void>;
  completeAction: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="space-y-5">
      {checklist.map((item) => {
        const grouped = assets.filter((asset) => asset.kind === item.kind);

        return (
          <section key={item.kind} className="app-card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="sub-title">{item.title}</h3>
                <p className="muted mt-2 text-sm">{item.detail}</p>
              </div>
              <span className="chip">
                {grouped.length}/{item.target}
              </span>
            </div>
            <div className="mb-4 grid gap-3">
              {grouped.length ? (
                grouped.map((asset) => (
                  <div key={asset.id} className="soft-card flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <p className="font-semibold">{asset.title}</p>
                      <p className="text-sm text-stone-500">{asset.url || "No URL yet"}</p>
                    </div>
                    <span className="chip">{asset.kind.replaceAll("_", " ")}</span>
                  </div>
                ))
              ) : (
                <p className="muted text-sm">Nothing logged in this section yet.</p>
              )}
            </div>
            <form action={addAssetAction} className="grid gap-3 md:grid-cols-4">
              <input type="hidden" name="capture_session_id" value={session.id} />
              <input type="hidden" name="kind" value={item.kind} />
              <div>
                <label>Title</label>
                <input name="title" placeholder={`${item.title} asset`} required />
              </div>
              <div>
                <label>URL</label>
                <input name="url" placeholder="Drive / iCloud / CDN link" />
              </div>
              <div>
                <label>Captured on</label>
                <input name="captured_on" type="date" defaultValue={session.capture_date} />
              </div>
              <div className="flex items-end">
                <button type="submit" className="secondary-button w-full">
                  Add asset
                </button>
              </div>
            </form>
          </section>
        );
      })}
      <form action={completeAction}>
        <input type="hidden" name="capture_session_id" value={session.id} />
        <button type="submit" className="primary-button">
          Mark session done
        </button>
      </form>
    </div>
  );
}

