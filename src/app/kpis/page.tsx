import Link from "next/link";
import { KPIBars } from "@/components/KPIBars";
import { getKpiSummaryRows, getTopKpiPosts } from "@/lib/queries";

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

  const [summary, topPosts] = await Promise.all([
    getKpiSummaryRows(groupBy, Number.isFinite(range) ? range : 30),
    getTopKpiPosts(Number.isFinite(range) ? range : 30),
  ]);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 9</p>
          <h1 className="section-title mt-2">KPIs</h1>
          <p className="muted mt-4 max-w-2xl">
            Latest snapshot per content-channel, grouped the way you want, without a charting library.
          </p>
        </div>
        <form className="app-card grid gap-3 p-4 md:grid-cols-2">
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
            <select name="range" defaultValue={String(range)}>
              <option value="30">Last 30 days</option>
              <option value="14">Last 14 days</option>
              <option value="7">Last 7 days</option>
              <option value="60">Last 60 days</option>
            </select>
          </div>
          <button type="submit" className="secondary-button md:col-span-2">
            Refresh
          </button>
        </form>
      </section>

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
              <Link key={post.id} href={`/content/${post.id}`} className="soft-card flex items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
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

