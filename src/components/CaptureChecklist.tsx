import type { Asset, CaptureSession } from "@/lib/types";
import { captureSectionGuides } from "@/lib/content-framework";

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
      {captureSectionGuides.map((item) => {
        const grouped = assets.filter((asset) => asset.kind === item.kind);

        return (
          <section key={item.kind} className="app-card p-5 sm:p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
                    {item.title}
                  </h3>
                  <span className="chip">
                    {grouped.length}/{item.target}
                  </span>
                </div>
                <p className="muted text-sm">{item.detail}</p>
                <p className="text-sm leading-7 text-[var(--ink-soft)]">{item.prompt}</p>
                <div className="flex flex-wrap gap-2">
                  {item.feeds.map((feed) => (
                    <span key={feed} className="chip">
                      {feed}
                    </span>
                  ))}
                </div>
              </div>

              <div className="min-w-[180px] rounded-[24px] border border-[var(--line)] bg-white/55 p-4">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Feeds into
                </p>
                <div className="mt-3 space-y-2 text-sm leading-6 text-[var(--ink)]">
                  {item.feeds.map((feed) => (
                    <div key={`${item.kind}-${feed}`}>{feed}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="my-5 grid gap-3">
              {grouped.length ? (
                grouped.map((asset) => (
                  <div
                    key={asset.id}
                    className="soft-card flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="text-lg font-semibold tracking-[-0.03em] text-[var(--brand)]">
                        {asset.title}
                      </p>
                      <p className="text-sm text-stone-500">{asset.url || "No URL yet"}</p>
                    </div>
                    <span className="chip">{asset.kind.replaceAll("_", " ")}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/35 p-4 text-sm leading-7 text-[var(--ink-soft)]">
                  Nothing logged in this section yet.
                </div>
              )}
            </div>

            <form
              action={addAssetAction}
              className="grid gap-3 rounded-[24px] border border-[var(--line)] bg-white/45 p-4 xl:grid-cols-[1.2fr_1.2fr_1fr_0.9fr]"
            >
              <input type="hidden" name="capture_session_id" value={session.id} />
              <input type="hidden" name="kind" value={item.kind} />
              <div>
                <label>Title</label>
                <input name="title" placeholder={item.placeholder} required />
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
      <form action={completeAction} className="pt-2">
        <input type="hidden" name="capture_session_id" value={session.id} />
        <button type="submit" className="primary-button">
          Mark session done
        </button>
      </form>
    </div>
  );
}
