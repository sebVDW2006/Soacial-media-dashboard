import Link from "next/link";
import { InspirationGallery } from "@/components/InspirationGallery";
import { KPIBars } from "@/components/KPIBars";
import { PaintingFeature } from "@/components/PaintingFeature";
import { featuredInspiration, inspirationArtworks } from "@/lib/inspiration";
import { getDashboardData, getKpiSummaryRows } from "@/lib/queries";

export default async function DashboardPage() {
  const dashboard = await getDashboardData();
  const [formatSummary, pillarSummary] = await Promise.all([
    getKpiSummaryRows("format", 28),
    getKpiSummaryRows("pillar", 28),
  ]);

  const nextPostDate = dashboard.nextPosts[0]?.scheduled_at ?? null;
  const nextPostDay = nextPostDate
    ? new Date(nextPostDate).toLocaleDateString("en-GB", { weekday: "long" })
    : "No posts scheduled";
  const daysUntil = nextPostDate
    ? Math.max(
        0,
        Math.ceil((new Date(nextPostDate).getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
      )
    : null;

  return (
    <div className="space-y-8">
      <section className="grid gap-8 2xl:grid-cols-[1.2fr_0.9fr]">
        <div className="app-card p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">This week</p>
          <h1 className="section-title mt-3">{dashboard.week}</h1>
          <p className="muted mt-4 max-w-xl text-base">
            {daysUntil !== null
              ? `${daysUntil} day${daysUntil === 1 ? "" : "s"} until the next scheduled post.`
              : "Nothing is scheduled yet."}{" "}
            {nextPostDay}
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="soft-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Idea inbox</p>
              <p className="mt-2 text-4xl font-bold tracking-[-0.08em]">{dashboard.ideaCount}</p>
              <Link href="/inbox" className="mt-4 inline-flex text-sm font-semibold text-emerald-900">
                Open inbox
              </Link>
            </div>
            <div className="soft-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Capture day</p>
              <p className="mt-2 text-xl font-bold">{dashboard.captureSession.capture_date}</p>
              <p className="mt-1 text-sm text-stone-500">{dashboard.captureSession.status}</p>
              <Link href="/capture" className="mt-4 inline-flex text-sm font-semibold text-emerald-900">
                Plan Tuesday
              </Link>
            </div>
            <div className="soft-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Weekly review</p>
              <p className="mt-2 text-xl font-bold">
                {dashboard.reviewMissing ? "Missing" : "Captured"}
              </p>
              <Link href={`/reviews/${dashboard.week}`} className="mt-4 inline-flex text-sm font-semibold text-emerald-900">
                Sunday review
              </Link>
            </div>
          </div>
        </div>

        <PaintingFeature
          artwork={featuredInspiration.dashboard}
          eyebrow="Creative inspiration"
          title="Build the system in a bigger atmosphere."
          copy="This workspace should feel more like composing a body of work than filling in a dashboard. Use the paintings as cues for rhythm, scale, clarity, and tone."
          heightClass="min-h-[560px]"
        />
      </section>

      <InspirationGallery
        title="Reference atmosphere"
        copy="A few visual anchors for the week: luminous skies, quiet structure, dramatic weather, and long horizons. The product should stay practical, but the creative mood can stay elevated."
        artworks={[
          inspirationArtworks[5],
          inspirationArtworks[10],
          inspirationArtworks[8],
          inspirationArtworks[12],
        ]}
      />

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="app-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="sub-title">Up next</h2>
            <Link href="/calendar" className="text-sm font-semibold text-emerald-900">
              Open calendar
            </Link>
          </div>
          <div className="grid gap-3">
            {dashboard.nextPosts.length ? (
              dashboard.nextPosts.map((post) => (
                <Link key={post.id} href={`/content/${post.content_id}`} className="soft-card flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                      {post.channel_name}
                    </p>
                    <p className="mt-1 font-semibold">{post.title}</p>
                  </div>
                  <span className="chip">
                    {(post.scheduled_at ?? "").slice(0, 10) || "Unscheduled"}
                  </span>
                </Link>
              ))
            ) : (
              <p className="muted text-sm">No upcoming scheduled posts yet.</p>
            )}
          </div>
        </div>
        <div className="app-card p-5">
          <h2 className="sub-title">KPI snapshot</h2>
          <div className="mt-4 grid gap-3">
            {(dashboard.kpiSummary.length ? dashboard.kpiSummary : formatSummary)
              .slice(0, 5)
              .map((row) => (
                <div key={row.groupKey} className="soft-card p-4">
                  <p className="text-sm font-semibold">{row.label}</p>
                  <p className="mt-1 text-2xl font-bold tracking-[-0.06em]">
                    {row.impressions}
                  </p>
                  <p className="mt-1 text-sm text-stone-500">impressions</p>
                </div>
              ))}
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <KPIBars title="Last 4 weeks by format" rows={formatSummary.slice(0, 5)} metric="impressions" />
        <KPIBars title="Last 4 weeks by pillar" rows={pillarSummary.slice(0, 5)} metric="impressions" />
      </div>
    </div>
  );
}
