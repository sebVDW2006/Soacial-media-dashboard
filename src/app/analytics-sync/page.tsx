import Link from "next/link";
import { mockConnectSocialAccount } from "@/app/social/actions";
import {
  accountTypeLabel,
  analyticsStatusLabel,
  brandLabel,
  connectionStatusLabel,
  platformLabel,
  shortBrandLabel,
} from "@/lib/social";
import { getSocialAccountSlots, getSocialAnalyticsOverview } from "@/lib/queries";
import type { Brand } from "@/lib/types";

type AnalyticsSyncPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-GB").format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function formatDate(value?: string | null) {
  if (!value) return "Never";
  return value.slice(0, 16).replace("T", " ");
}

function statusClass(status?: string | null) {
  if (status === "connected" || status === "synced") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (status === "expired" || status === "failed") return "border-red-200 bg-red-50 text-red-800";
  if (status === "manual_only" || status === "manual") return "border-amber-200 bg-amber-50 text-amber-900";
  return "border-[var(--line)] bg-white text-[var(--ink-soft)]";
}

export default async function AnalyticsSyncPage({ searchParams }: AnalyticsSyncPageProps) {
  const params = (await searchParams) ?? {};
  const brand = typeof params.brand === "string" ? params.brand : "all";
  const safeBrand = brand === "seb" || brand === "ublend" ? (brand as Brand) : "all";
  const [accountSlots, overview] = await Promise.all([
    getSocialAccountSlots(),
    getSocialAnalyticsOverview(safeBrand),
  ]);
  const connectedCount = accountSlots.filter((slot) => slot.account?.connection_status === "connected").length;

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="eyebrow">Overview</p>
            <h1 className="section-title mt-2">Analytics</h1>
            <p className="muted mt-2 max-w-2xl text-sm">
              Rollup of every linked post. Keep account slots as a registry — KPIs are entered manually in Track Data.
            </p>
          </div>
          <Link href="/kpis" className="primary-button shrink-0 self-start">
            Log KPIs →
          </Link>
        </div>
      </section>

      <section id="account-slots" className="app-card space-y-4 p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="sub-title">Account slots</h2>
            <p className="muted mt-1 text-sm">{connectedCount} of 4 accounts marked active.</p>
          </div>
          <span className="chip">{accountSlots.length} core slots</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {accountSlots.map((slot) => {
            const account = slot.account;
            const status = account?.connection_status ?? "not_connected";

            return (
              <div key={slot.key} className="soft-card flex flex-col justify-between gap-5 p-5">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="eyebrow">{slot.displayName}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em]">{slot.handle}</h3>
                    </div>
                    <span className={`chip ${statusClass(status)}`}>{connectionStatusLabel(status)}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="chip">{brandLabel(slot.brand)}</span>
                    <span className="chip">{platformLabel(slot.platform)}</span>
                    <span className="chip">{accountTypeLabel(slot.account_type)}</span>
                  </div>

                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <p className="eyebrow">Last synced</p>
                      <p className="mt-1 font-semibold">{formatDate(account?.last_synced_at)}</p>
                    </div>
                    <div>
                      <p className="eyebrow">External ID</p>
                      <p className="mt-1 truncate font-semibold">{account?.external_account_id ?? "Not connected"}</p>
                    </div>
                  </div>
                </div>

                <form action={mockConnectSocialAccount}>
                  <input type="hidden" name="slot_key" value={slot.key} />
                  <button type="submit" className={status === "expired" ? "primary-button w-full" : "secondary-button w-full"}>
                    {status === "expired" ? "Reconnect" : status === "not_connected" ? "Mark active" : "Refresh slot"}
                  </button>
                </form>
              </div>
            );
          })}
        </div>
      </section>

      <section className="app-card p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="sub-title">Dashboard</h2>
            <p className="muted mt-1 text-sm">Rollup from linked post analytics records.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "seb", "ublend"] as const).map((option) => (
              <Link
                key={option}
                href={option === "all" ? "/analytics-sync" : `/analytics-sync?brand=${option}`}
                className={`chip ${safeBrand === option ? "active" : ""}`}
              >
                {option === "all" ? "All" : shortBrandLabel(option)}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Total impressions", formatNumber(overview.totals.impressions)],
            ["Total reach", formatNumber(overview.totals.reach)],
            ["Total engagement", formatNumber(overview.totals.engagement)],
            ["Average engagement", formatPercent(overview.averageEngagementRate)],
          ].map(([label, value]) => (
            <div key={label} className="soft-card p-4">
              <p className="eyebrow">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{value}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {[
            ["Best post", overview.bestPost?.label ?? "No synced posts"],
            ["Best platform", overview.bestPlatform?.label ? platformLabel(overview.bestPlatform.label as "instagram" | "linkedin") : "No synced posts"],
            ["Best account", overview.bestAccount?.label ?? "No synced posts"],
          ].map(([label, value]) => (
            <div key={label} className="soft-card p-4">
              <p className="eyebrow">{label}</p>
              <p className="mt-2 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card p-6 sm:p-7">
        <h2 className="sub-title">Linked posts</h2>
        {overview.rows.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-[0.68rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                  <th className="py-3 pr-4">Post title</th>
                  <th className="py-3 pr-4">Brand</th>
                  <th className="py-3 pr-4">Platform</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 pr-4">Impressions</th>
                  <th className="py-3 pr-4">Reach</th>
                  <th className="py-3 pr-4">Likes</th>
                  <th className="py-3 pr-4">Comments</th>
                  <th className="py-3 pr-4">Shares</th>
                  <th className="py-3 pr-4">Saves</th>
                  <th className="py-3 pr-4">Eng. rate</th>
                  <th className="py-3 pr-4">Last synced</th>
                  <th className="py-3 pr-4">Action</th>
                </tr>
              </thead>
              <tbody>
                {overview.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="py-4 pr-4">
                      <Link href={`/content/${row.content_id}`} className="font-semibold hover:text-[var(--brand)]">
                        {row.title}
                      </Link>
                    </td>
                    <td className="py-4 pr-4">{shortBrandLabel(row.brand)}</td>
                    <td className="py-4 pr-4">{platformLabel(row.platform)}</td>
                    <td className="py-4 pr-4">
                      <span className={`chip ${statusClass(row.status)}`}>{analyticsStatusLabel(row.status)}</span>
                    </td>
                    <td className="py-4 pr-4">{formatNumber(row.metrics.impressions)}</td>
                    <td className="py-4 pr-4">{formatNumber(row.metrics.reach)}</td>
                    <td className="py-4 pr-4">{formatNumber(row.metrics.likes)}</td>
                    <td className="py-4 pr-4">{formatNumber(row.metrics.comments)}</td>
                    <td className="py-4 pr-4">{formatNumber(row.metrics.shares)}</td>
                    <td className="py-4 pr-4">{formatNumber(row.metrics.saves)}</td>
                    <td className="py-4 pr-4">{formatPercent(row.metrics.engagementRate)}</td>
                    <td className="py-4 pr-4">{formatDate(row.last_synced_at)}</td>
                    <td className="py-4 pr-4">
                      <Link href="/kpis" className="secondary-button whitespace-nowrap">
                        Log KPIs
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted mt-4 text-sm">No live post URLs linked yet. Add one from Post Flow after marking a post as posted.</p>
        )}
      </section>
    </div>
  );
}

