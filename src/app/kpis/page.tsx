import Link from "next/link";
import { KPIBars } from "@/components/KPIBars";
import { DeleteKpiButton } from "@/components/DeleteKpiButton";
import { KpiInputs } from "@/components/KpiInputs";
import { upsertKpi } from "@/app/content/actions";
import { analyticsStatusLabel, inferPlatformFromChannel, platformLabel } from "@/lib/social";
import { getKpiSummaryRows, getPostedItemsWithChannels, getTopKpiPosts } from "@/lib/queries";

type KpisPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const GROUP_BY_LABELS: Record<string, string> = {
  format: "Style",
  pillar: "Pillar",
  channel: "Channel",
  brand: "Brand",
};

function statusClass(status?: string | null) {
  if (status === "synced") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "failed") return "border-red-200 bg-red-50 text-red-800";
  if (status === "manual") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-[var(--line)] bg-white text-[var(--ink-soft)]";
}

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

  const groupByLabel = GROUP_BY_LABELS[groupBy] ?? groupBy;
  const channelsAwaitingKpis = postedItems.reduce(
    (acc, item) => acc + item.channels.filter((ch) => !ch.snapshot_id).length,
    0,
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="section-title">Track data</h1>
            <p className="muted mt-2 text-sm">Enter your numbers after posting, then see what is working.</p>
          </div>
          {channelsAwaitingKpis > 0 && (
            <span className="chip">
              {channelsAwaitingKpis} channel{channelsAwaitingKpis === 1 ? "" : "s"} awaiting numbers
            </span>
          )}
        </div>
      </section>

      {/* Log / Edit KPIs */}
      {postedItems.length > 0 ? (
        <section className="app-card space-y-5 p-6 sm:p-7">
          <div>
            <h2 className="sub-title">Log KPIs</h2>
            <p className="muted mt-1 text-sm">
              Numbers save per channel. Tap &quot;Paste from Insights&quot; to fill all fields from a copied insights screen.
            </p>
          </div>

          {postedItems.map((item) => (
            <div key={item.content_id} className="soft-card space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/content/${item.content_id}`} className="font-semibold hover:text-[var(--brand)]">
                  {item.title}
                </Link>
                <span className="chip">{item.brand === "seb" ? "Seb" : "uBlend"}</span>
              </div>

              {item.channels.map((ch) => {
                const platform = inferPlatformFromChannel(ch.channel_slug, ch.channel_name);
                const status = ch.analytics_status ?? "manual";

                return (
                  <div key={ch.content_channel_id} className="space-y-3 border-t border-[var(--line)] pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                          {ch.channel_name}
                        </p>
                        {platform && (
                          <span className="chip">{platformLabel(platform)}</span>
                        )}
                        <span className={`chip ${statusClass(status)}`}>
                          {analyticsStatusLabel(status)}
                        </span>
                        {ch.posted_url && (
                          <a
                            href={ch.posted_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-sm font-semibold text-[var(--brand)] hover:underline"
                          >
                            View post ↗
                          </a>
                        )}
                      </div>
                      {ch.snapshot_id && (
                        <DeleteKpiButton
                          snapshotId={ch.snapshot_id}
                          contentItemId={item.content_id}
                        />
                      )}
                    </div>

                    {status === "manual" && ch.analytics_error_message && (
                      <p className="text-sm text-[var(--ink-soft)]">{ch.analytics_error_message}</p>
                    )}

                    <KpiInputs
                      action={upsertKpi}
                      contentChannelId={ch.content_channel_id}
                      contentItemId={item.content_id}
                      postedUrl={ch.posted_url}
                      postAnalyticsId={ch.post_analytics_id}
                      snapshotId={ch.snapshot_id}
                      analyticsStatus={ch.analytics_status}
                      initial={{
                        impressions: ch.impressions,
                        reach: ch.reach,
                        views: ch.views,
                        likes: ch.likes,
                        comments: ch.comments,
                        shares: ch.shares,
                        saves: ch.saves,
                        link_clicks: ch.link_clicks,
                        follows: ch.follows,
                        dms_or_leads: ch.dms_or_leads,
                      }}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ) : (
        <section className="app-card p-6 sm:p-7">
          <p className="muted text-sm">
            No posted content yet.{" "}
            <Link href="/pipeline" className="text-[var(--brand)] font-semibold">
              Mark something as posted in Post Flow →
            </Link>
          </p>
        </section>
      )}

      {/* Results — filter + charts */}
      <section className="app-card p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="sub-title">Results</h2>
          <form className="flex flex-wrap items-end gap-3">
            <div>
              <label>Group by</label>
              <select name="groupBy" defaultValue={groupBy}>
                <option value="format">Style</option>
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

        {summary.length > 0 ? (
          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            <KPIBars title={`Impressions by ${groupByLabel}`} rows={summary} metric="impressions" />
            <KPIBars title={`Engagement by ${groupByLabel}`} rows={summary} metric="engagement_rate" />
            <KPIBars title={`Follows by ${groupByLabel}`} rows={summary} metric="follows" />
            <KPIBars title={`DMs / leads by ${groupByLabel}`} rows={summary} metric="dms_or_leads" />
          </div>
        ) : (
          <p className="muted mt-4 text-sm">No data yet for this range. Save some KPIs above to see results.</p>
        )}
      </section>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <section className="app-card p-6 sm:p-7">
          <h2 className="sub-title">Top posts</h2>
          <div className="mt-4 grid gap-3">
            {topPosts.map((post, index) => (
              <Link
                key={post.id}
                href={`/content/${post.id}`}
                className="soft-card flex items-center justify-between gap-3 p-4"
              >
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--ink-soft)]">#{index + 1}</p>
                  <p className="mt-1 font-semibold">{post.title}</p>
                </div>
                <span className="chip">{post.total_engagement} engagement</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
