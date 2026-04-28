import Link from "next/link";
import { Kanban } from "@/components/Kanban";
import { moveStatus } from "@/app/pipeline/actions";
import { saveChannelSchedule } from "@/app/content/actions";
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

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Post flow</h1>
            <p className="muted mt-2 text-sm">Move pieces through the stages. Mark them posted and update statuses here.</p>
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

      {scheduledItems.length > 0 && (
        <section className="app-card space-y-4 p-6 sm:p-7">
          <div>
            <h2 className="sub-title">Mark as posted</h2>
            <p className="muted mt-1 text-sm">For each channel, paste the live URL and hit Mark posted.</p>
          </div>
          {scheduledItems.map((item) => (
            <div key={item.content_id} className="soft-card space-y-3 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/content/${item.content_id}`} className="font-semibold hover:text-[var(--brand)]">
                  {item.title}
                </Link>
                <span className="chip">{item.brand === "seb" ? "Seb" : "uBlend"}</span>
                {item.target_post_at && (
                  <span className="text-sm text-[var(--ink-soft)]">
                    {item.target_post_at.slice(0, 10)}
                  </span>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {item.channels.map((ch) => (
                  <form key={ch.content_channel_id} action={saveChannelSchedule} className="flex flex-col gap-2">
                    <input type="hidden" name="content_channel_id" value={ch.content_channel_id} />
                    <input type="hidden" name="content_item_id" value={item.content_id} />
                    <input type="hidden" name="scheduled_at" value={ch.scheduled_at ?? ""} />
                    <label className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                      {ch.channel_name}
                    </label>
                    <input
                      name="posted_url"
                      defaultValue={ch.posted_url ?? ""}
                      placeholder="https://..."
                    />
                    <button type="submit" className={ch.posted_url ? "secondary-button" : "primary-button"}>
                      {ch.posted_url ? "Update URL" : "Mark posted"}
                    </button>
                  </form>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

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
