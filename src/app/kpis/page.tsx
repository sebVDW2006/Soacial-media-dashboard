import Link from "next/link";
import { KPIBars } from "@/components/KPIBars";
import { addKpi } from "@/app/content/actions";
import { getKpiSummaryRows, getPostedItemsWithChannels, getTopKpiPosts } from "@/lib/queries";

type KpisPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KpisPage({ searchParams }: KpisPageProps) {
  const params = (await searchParams) ?? {};
  const groupBy =
    typeof params.groupBy === "string" &&
    ["format", "pillar", "channel", "brand"].includes(params.groupBy)
      ? (params.groupBy as "format" | "pillar" | "channel" | "brand")
      : "format";
  const range = typeof params.range === "string" ? Number(params.range) : 30;
  const safeRange = Number.isFinite(range) ? range : 30;

  const [summary, topPosts, postedItems] = await Promise.all([
    getKpiSummaryRows(groupBy, safeRange),
    getTopKpiPosts(safeRange),
    getPostedItemsWithChannels(),
  ]);

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Track data</h1>
            <p className="muted mt-2 text-sm">Log KPIs for posted content, then see what formats and channels perform best.</p>
          </div>
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label>Group by</label>
              <select name="groupBy" defaultValue={groupBy}>
                <option value="format">Format</option>
                <option value="pillar">Pillar</option>
                <option value="channel">Channel</option>
                <option value="brand">Brand</option>
              </select>
            </div>
            <div>
              <label>Range</label>
              <select name="range" defaultValue={String(safeRange)}>
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
              </select>
            </div>
            <button type="submit" className="secondary-button">Apply</button>
          </form>
        </div>
      </section>

      {/* Log KPIs */}
      {postedItems.length > 0 && (
        <section className="app-card space-y-4 p-6 sm:p-7">
          <div>
            <h2 className="sub-title">Log KPIs</h2>
            <p className="muted mt-1 text-sm">Enter the numbers from each platform after posting.</p>
          </div>
          {postedItems.map((item) => (
            <div key={item.content_id} className="soft-card space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/content/${item.content_id}`} className="font-semibold hover:text-[var(--brand)]">
                  {item.title}
                </Link>
                <span className="chip">{item.brand === "seb" ? "Seb" : "uBlend"}</span>
              </div>
              {item.channels.map((ch) => (
                <form
                  key={ch.content_channel_id}
                  action={addKpi}
                  className="space-y-3"
                >
                  <input type="hidden" name="content_channel_id" value={ch.content_channel_id} />
                  <input type="hidden" name="content_item_id" value={item.content_id} />
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                    {ch.channel_name}
                    {ch.posted_url && (
                      <a href={ch.posted_url} target="_blank" rel="noreferrer" className="ml-2 normal-case font-normal text-[var(--brand)]">
                        view post ↗
                      </a>
                    )}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {[
                      ["impressions", "Impressions"],
                      ["likes", "Likes"],
                      ["comments", "Comments"],
                      ["shares", "Shares"],
                      ["follows", "Follows"],
                      ["dms_or_leads", "DMs / leads"],
                    ].map(([name, label]) => (
                      <div key={name}>
                        <label>{label}</label>
                        <input name={name} type="number" min="0" defaultValue="0" />
                      </div>
                    ))}
                  </div>
                  <button type="submit" className="primary-button">Save KPIs</button>
                </form>
              ))}
            </div>
          ))}
        </section>
      )}

      {/* Charts */}
      <div className="grid gap-4 xl:grid-cols-2">
        <KPIBars title={`Impressions by ${groupBy}`} rows={summary} metric="impressions" />
        <KPIBars title={`Engagement by ${groupBy}`} rows={summary} metric="engagement_rate" />
        <KPIBars title={`Follows by ${groupBy}`} rows={summary} metric="follows" />
        <KPIBars title={`DMs / leads by ${groupBy}`} rows={summary} metric="dms_or_leads" />
      </div>

      <section className="app-card p-5">
        <h2 className="sub-title">Top 10 posts</h2>
        <div className="mt-4 grid gap-3">
          {topPosts.length ? (
            topPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/content/${post.id}`}
                className="soft-card flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">
                    #{index + 1}
                  </p>
                  <p className="mt-1 font-semibold">{post.title}</p>
                </div>
                <span className="chip">{post.total_engagement}</span>
              </Link>
            ))
          ) : (
            <p className="muted text-sm">No KPI snapshots yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
