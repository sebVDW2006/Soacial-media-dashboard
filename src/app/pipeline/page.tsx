import Link from "next/link";
import { Kanban } from "@/components/Kanban";
import { moveStatus } from "@/app/pipeline/actions";
import { markPosted, saveChannelSchedule } from "@/app/content/actions";
import { getContentItems, getScheduledAndPostedItems } from "@/lib/queries";

type PipelinePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const params = (await searchParams) ?? {};
  const brand = typeof params.brand === "string" ? params.brand : "all";

  const [rows, scheduledItems] = await Promise.all([
    getContentItems(brand as "all" | "seb" | "ublend"),
    getScheduledAndPostedItems(brand as "all" | "seb" | "ublend"),
  ]);

  const unpostedItems = scheduledItems.filter((item) =>
    item.channels.some((ch) => ch.channel_status !== "posted"),
  );
  const postedItems = scheduledItems.filter((item) =>
    item.channels.every((ch) => ch.channel_status === "posted"),
  );

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Post flow</h1>
            <p className="muted mt-2 text-sm">Mark pieces as posted here, then head to Track Data to log your KPIs.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "seb", "ublend"] as const).map((option) => (
              <Link
                key={option}
                href={option === "all" ? "/pipeline" : `/pipeline?brand=${option}`}
                className={`chip ${brand === option ? "active" : ""}`}
              >
                {option === "all" ? "All" : option === "seb" ? "Seb" : "uBlend"}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Kanban
        rows={rows.map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          brand: row.brand,
          format_name: row.format_name,
          pillar_name: row.pillar_name,
          target_post_at: row.target_post_at,
        }))}
        brand={brand as "all" | "seb" | "ublend"}
      />

      {/* Step 1 — Mark as posted */}
      {unpostedItems.length > 0 && (
        <section className="app-card space-y-4 p-6 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="sub-title">Step 1 — Mark as posted</h2>
              <p className="muted mt-1 text-sm">Hit the button for each channel once it is live. URL is optional but useful for tracking.</p>
            </div>
          </div>
          {unpostedItems.map((item) => (
            <div key={item.content_id} className="soft-card space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/content/${item.content_id}`} className="font-semibold hover:text-[var(--brand)]">
                  {item.title}
                </Link>
                <span className="chip">{item.brand === "seb" ? "Seb" : "uBlend"}</span>
                {item.target_post_at && (
                  <span className="text-sm text-[var(--ink-soft)]">{item.target_post_at.slice(0, 10)}</span>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {item.channels
                  .filter((ch) => ch.channel_status !== "posted")
                  .map((ch) => (
                    <div key={ch.content_channel_id} className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                        {ch.channel_name}
                      </p>
                      {/* URL field (optional) */}
                      <form action={saveChannelSchedule} className="flex gap-2">
                        <input type="hidden" name="content_channel_id" value={ch.content_channel_id} />
                        <input type="hidden" name="content_item_id" value={item.content_id} />
                        <input type="hidden" name="scheduled_at" value={ch.scheduled_at ?? ""} />
                        <input
                          name="posted_url"
                          defaultValue={ch.posted_url ?? ""}
                          placeholder="Post URL (optional)"
                          className="min-w-0 flex-1 text-sm"
                        />
                        <button type="submit" className="secondary-button shrink-0 text-sm">
                          Save
                        </button>
                      </form>
                      {/* Mark posted button (no URL required) */}
                      <form action={markPosted}>
                        <input type="hidden" name="content_channel_id" value={ch.content_channel_id} />
                        <input type="hidden" name="content_item_id" value={item.content_id} />
                        <button type="submit" className="primary-button w-full">
                          ✓ Mark posted
                        </button>
                      </form>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* Step 2 — Go to Track Data */}
      {postedItems.length > 0 && (
        <section className="app-card p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="sub-title">Step 2 — Log your KPIs</h2>
              <p className="muted mt-2 text-sm">
                {postedItems.length} piece{postedItems.length > 1 ? "s are" : " is"} marked posted and ready for KPI entry.
              </p>
            </div>
            <Link href="/kpis" className="primary-button">
              Go to Track Data →
            </Link>
          </div>
          <div className="mt-4 grid gap-2">
            {postedItems.map((item) => (
              <div key={item.content_id} className="soft-card flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {item.channels.map((ch) => ch.channel_name).join(", ")}
                  </p>
                </div>
                <Link href="/kpis" className="secondary-button shrink-0">
                  Log KPIs
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Update status manually */}
      <section className="app-card p-6 sm:p-7">
        <h2 className="sub-title">Update status</h2>
        <p className="muted mt-1 mb-4 text-sm">Manually move any piece to a different stage.</p>
        <div className="grid gap-3">
          {rows.map((row) => (
            <form
              key={row.id}
              action={moveStatus}
              className="soft-card grid gap-3 p-4 md:grid-cols-[1.8fr_1fr_auto]"
            >
              <input type="hidden" name="id" value={row.id} />
              <div>
                <p className="font-semibold">{row.title}</p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {row.format_name} • {row.pillar_name}
                </p>
              </div>
              <select name="status" defaultValue={row.status}>
                <option value="idea">Idea</option>
                <option value="drafting">Drafting</option>
                <option value="captured">Captured</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
                <option value="tracked">Tracked</option>
              </select>
              <button type="submit" className="secondary-button">
                Update
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}
