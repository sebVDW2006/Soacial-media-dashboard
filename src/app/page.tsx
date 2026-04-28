import Link from "next/link";
import { KPIBars } from "@/components/KPIBars";
import { PaintingFeature } from "@/components/PaintingFeature";
import { WorkflowSteps } from "@/components/WorkflowSteps";
import { weeklyFlow } from "@/lib/content-framework";
import { featuredInspiration } from "@/lib/inspiration";
import { getDashboardData, getKpiSummaryRows } from "@/lib/queries";

export default async function DashboardPage() {
  const [dashboard, pillarSummary] = await Promise.all([
    getDashboardData(),
    getKpiSummaryRows("pillar", 28),
  ]);
  // formatSummary is already fetched inside getDashboardData — reuse it
  const formatSummary = dashboard.kpiSummary;

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
  const leadingFormat = formatSummary[0]?.label ?? "No format data yet";

  return (
    <div className="space-y-8">
      <section className="grid gap-8 2xl:grid-cols-[1.2fr_0.9fr]">
        <div className="app-card p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">This week</p>
          <h1 className="section-title mt-3">Creative operating system</h1>
          <p className="muted mt-4 max-w-3xl text-base leading-8">
            {daysUntil !== null
              ? `${daysUntil} day${daysUntil === 1 ? "" : "s"} until the next scheduled post.`
              : "Nothing is scheduled yet."}{" "}
            {nextPostDay}. The point of this workspace is to keep the system practical while protecting the creative
            atmosphere behind the work.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="soft-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Idea inbox</p>
              <p className="mt-2 text-4xl font-bold tracking-[-0.08em]">{dashboard.ideaCount}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">Unshaped thoughts waiting to become formats.</p>
              <Link href="/inbox" className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)]">
                Open inbox
              </Link>
            </div>
            <div className="soft-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Capture day</p>
              <p className="mt-2 text-xl font-bold">{dashboard.captureSession.capture_date}</p>
              <p className="mt-1 text-sm text-stone-500">{dashboard.captureSession.status}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">Tuesday is the raw material day for the whole week.</p>
              <Link href="/capture" className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)]">
                Plan Tuesday
              </Link>
            </div>
            <div className="soft-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Leading format</p>
              <p className="mt-2 text-xl font-bold">{leadingFormat}</p>
              <p className="mt-1 text-sm text-stone-500">Last 4 weeks</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">Use this to see which repeatable angle is carrying momentum.</p>
            </div>
            <div className="soft-card p-4">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">Weekly review</p>
              <p className="mt-2 text-xl font-bold">{dashboard.reviewMissing ? "Missing" : "Captured"}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--ink-soft)]">Close the loop so taste, proof, and performance stay connected.</p>
              <Link href={`/reviews/${dashboard.week}`} className="mt-4 inline-flex text-sm font-semibold text-[var(--brand)]">
                Sunday review
              </Link>
            </div>
          </div>
        </div>

        <PaintingFeature
          artwork={featuredInspiration.dashboard}
          eyebrow="Creative inspiration"
          title="A cleaner system for a more expressive body of work."
          copy="The references are here to hold the emotional and visual standard. The product itself should stay calm, useful, and very close to the actual way you create content."
          heightClass="min-h-[560px]"
        />
      </section>

      <WorkflowSteps />

      <section className="grid gap-4">
        <section className="app-card p-7 sm:p-8 lg:p-10">
          <div className="eyebrow">Weekly pulse</div>
          <h2 className="sub-title mt-3 text-[var(--brand)]">What the week is asking for.</h2>
          <div className="mt-8 grid gap-4 xl:grid-cols-5">
            {weeklyFlow.map((item, index) => (
              <div key={item.day} className={`soft-card p-5 ${index === 1 ? "studio-accent-card" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      {item.day}
                    </div>
                    <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--brand)]">
                      {item.title}
                    </div>
                  </div>
                  <span className={`chip ${index === 1 ? "active" : ""}`}>{item.output}</span>
                </div>
                <p className="mt-4 text-sm leading-7 text-[var(--ink-soft)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <div className="app-card p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="sub-title">Scheduled output</h2>
            <Link href="/calendar" className="text-sm font-semibold text-[var(--brand)]">
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
          <h2 className="sub-title">Performance pulse</h2>
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
