import Link from "next/link";
import { ArchiveButton } from "@/components/ArchiveButton";
import { ContentFilterBar } from "@/components/ContentFilterBar";
import { DeleteButton } from "@/components/DeleteButton";
import { StatusPill } from "@/components/StatusPill";
import {
  ContentTypeBadge,
  ContentTypeLegend,
  StorytellingStructureBadge,
  SubPillarBadge,
} from "@/components/TaxonomyBadges";
import {
  getContentItems,
  getContentStatusCounts,
  getReferenceData,
  type ContentSortKey,
  type ContentStatusGroup,
} from "@/lib/queries";
import type { Brand, ContentListItem, ContentStatus, ContentType } from "@/lib/types";
import {
  ALL_SUB_PILLARS,
  CONTENT_TYPES,
  getFormatLabel,
  getSubPillarsForBrand,
} from "@/lib/taxonomy";
import { getCurrentWeek, weekRange } from "@/lib/week";

type ContentPiecesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const STATUS_GROUPS: { key: ContentStatusGroup; label: string }[] = [
  { key: "all", label: "All" },
  { key: "draft", label: "Draft" },
  { key: "ready", label: "Ready" },
  { key: "scheduled", label: "Scheduled" },
  { key: "posted", label: "Posted" },
  { key: "repurpose", label: "Repurpose" },
  { key: "archived", label: "Archived" },
];

function classifyStatus(status: ContentStatus | string): Exclude<ContentStatusGroup, "all" | "archived"> {
  if (status === "idea" || status === "drafting") return "draft";
  if (status === "ready" || status === "captured") return "ready";
  if (status === "scheduled") return "scheduled";
  if (status === "repurpose") return "repurpose";
  return "posted";
}

function parseString(value: string | string[] | undefined, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function parseNumber(value: string | string[] | undefined): number | null {
  if (typeof value !== "string" || !value || value === "all") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBrand(value: string | string[] | undefined): Brand | "all" {
  if (value === "seb" || value === "ublend") return value;
  return "all";
}

function parseSort(value: string | string[] | undefined): ContentSortKey {
  if (value === "created" || value === "posted" || value === "edited") return value;
  return "scheduled";
}

function parseStatusGroup(value: string | string[] | undefined): ContentStatusGroup {
  if (typeof value !== "string") return "all";
  const match = STATUS_GROUPS.find((option) => option.key === value);
  return match ? match.key : "all";
}

function parseContentType(value: string | string[] | undefined): ContentType | "all" {
  if (typeof value !== "string") return "all";
  return CONTENT_TYPES.some((type) => type.value === value) ? (value as ContentType) : "all";
}

function parseSubPillar(value: string | string[] | undefined): string | null {
  if (typeof value !== "string" || !value || value === "all") return null;
  return ALL_SUB_PILLARS.some((sp) => sp.slug === value) ? value : null;
}

function parseWeekIso(value: string | string[] | undefined): string | null {
  if (typeof value !== "string" || !value || value === "all") return null;
  return /^\d{4}-W\d{2}$/.test(value) ? value : null;
}

function rowWeekKey(row: ContentListItem): string {
  if (row.week_iso) return row.week_iso;
  const reference = row.target_post_at || row.updated_at || row.created_at;
  if (!reference) return "Unscheduled";
  const date = new Date(reference);
  if (Number.isNaN(date.getTime())) return "Unscheduled";
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

function formatWeekLabel(weekIso: string) {
  if (weekIso === "Unscheduled") return { title: "Unscheduled", subtitle: "No week set yet" };
  const range = weekRange(weekIso);
  const [, week] = weekIso.split("-W");
  const start = range.days[0]?.label ?? "";
  const end = range.days[6]?.label ?? "";
  return {
    title: `Week ${week}`,
    subtitle: `${start} – ${end}`,
  };
}

function formatTargetDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatRelativeDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function brandLabel(brand: Brand) {
  return brand === "seb" ? "Seb" : "uBlend";
}

function channelChips(channelNames: string | null) {
  if (!channelNames) return [];
  return channelNames
    .split(", ")
    .map((name) => name.trim())
    .filter(Boolean);
}

function buildHref(baseParams: URLSearchParams, updates: Record<string, string | null>) {
  const params = new URLSearchParams(baseParams.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (!value) params.delete(key);
    else params.set(key, value);
  }
  const query = params.toString();
  return query ? `/content?${query}` : "/content";
}

function ContentCard({ row }: { row: ContentListItem }) {
  const archived = Boolean(row.archived);
  const formatLabel = getFormatLabel(row.post_type);
  const target = formatTargetDate(row.target_post_at);
  const lastEdited = formatRelativeDate(row.updated_at);
  const channels = channelChips(row.channel_names);

  return (
    <div className="soft-card flex flex-col gap-4 p-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="flex-1 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="chip">{brandLabel(row.brand)}</span>
          <ContentTypeBadge contentType={row.content_type} />
          <SubPillarBadge subPillar={row.sub_pillar} />
          <StorytellingStructureBadge structure={row.storytelling_structure} />
          <StatusPill status={row.status} />
          {formatLabel && <span className="chip">{formatLabel}</span>}
          {archived && <span className="chip">Archived</span>}
        </div>
        <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--brand)]">
          <Link href={`/content/${row.id}`} className="hover:underline">
            {row.title}
          </Link>
        </h3>
        <p className="text-sm leading-6 text-[var(--ink-soft)]">
          Framework: {row.format_name}
        </p>
        {channels.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {channels.map((channel) => (
              <span
                key={channel}
                className="rounded-full border border-[var(--line)] bg-white/60 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[var(--ink-soft)]"
              >
                {channel}
              </span>
            ))}
          </div>
        )}
        <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          {target ? `Scheduled ${target}` : "No scheduled date"}
          {lastEdited ? ` · Edited ${lastEdited}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end">
        <Link href={`/content/${row.id}`} className="primary-button">
          Edit piece
        </Link>
        <ArchiveButton id={row.id} archived={archived} />
        <DeleteButton id={row.id} />
      </div>
    </div>
  );
}

export default async function ContentPiecesPage({ searchParams }: ContentPiecesPageProps) {
  const params = (await searchParams) ?? {};
  const brand = parseBrand(params.brand);
  const search = parseString(params.q);
  const statusGroup = parseStatusGroup(params.status);
  const sort = parseSort(params.sort);
  const formatId = parseNumber(params.format);
  const pillarId = parseNumber(params.pillar);
  const channelId = parseNumber(params.channel);
  const contentType = parseContentType(params.contentType);
  const subPillar = parseSubPillar(params.subPillar);
  const weekFilter = parseWeekIso(params.week);

  const [{ formats, pillars, channels }, rows, counts] = await Promise.all([
    getReferenceData(),
    getContentItems({
      brand,
      search,
      statusGroup,
      formatId,
      pillarId,
      channelId,
      contentType,
      subPillar,
      weekIso: weekFilter,
      sort,
    }),
    getContentStatusCounts({
      brand,
      search,
      formatId,
      pillarId,
      channelId,
      contentType,
      subPillar,
      weekIso: weekFilter,
    }),
  ]);

  const currentParams = new URLSearchParams();
  if (brand !== "all") currentParams.set("brand", brand);
  if (search) currentParams.set("q", search);
  if (statusGroup !== "all") currentParams.set("status", statusGroup);
  if (sort !== "scheduled") currentParams.set("sort", sort);
  if (formatId) currentParams.set("format", String(formatId));
  if (pillarId) currentParams.set("pillar", String(pillarId));
  if (channelId) currentParams.set("channel", String(channelId));
  if (contentType !== "all") currentParams.set("contentType", contentType);
  if (subPillar) currentParams.set("subPillar", subPillar);
  if (weekFilter) currentParams.set("week", weekFilter);

  const currentWeek = getCurrentWeek();
  const weekOrder: string[] = [];
  const weeklyMap = new Map<string, ContentListItem[]>();

  for (const row of rows) {
    const key = rowWeekKey(row);
    if (!weeklyMap.has(key)) {
      weeklyMap.set(key, []);
      weekOrder.push(key);
    }
    weeklyMap.get(key)!.push(row);
  }

  weekOrder.sort((a, b) => {
    if (a === "Unscheduled") return 1;
    if (b === "Unscheduled") return -1;
    return b.localeCompare(a);
  });

  const subPillarsForFilter = getSubPillarsForBrand(brand === "all" ? null : brand);
  const newPieceHref = brand === "all" ? "/content/new" : `/content/new?brand=${brand}`;
  const countByGroup: Record<ContentStatusGroup, number> = {
    all: counts.all + counts.archived,
    draft: counts.draft,
    ready: counts.ready,
    scheduled: counts.scheduled,
    posted: counts.posted,
    repurpose: counts.repurpose,
    archived: counts.archived,
  };

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="section-title">Content pieces</h1>
            <p className="muted mt-3 text-sm">
              {rows.length} piece{rows.length === 1 ? "" : "s"} across {weekOrder.length} week
              {weekOrder.length === 1 ? "" : "s"}
            </p>
            <div className="mt-4">
              <ContentTypeLegend />
            </div>
          </div>
          <Link href={newPieceHref} className="primary-button">
            + New piece
          </Link>
        </div>
      </section>

      <section className="app-card space-y-5 p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_GROUPS.map((option) => {
            const active = statusGroup === option.key;
            const count = countByGroup[option.key];
            const href = buildHref(currentParams, {
              status: option.key === "all" ? null : option.key,
            });
            return (
              <Link
                key={option.key}
                href={href}
                className={`chip ${active ? "active" : ""}`}
              >
                {option.label}
                <span className="ml-2 text-[0.66rem] opacity-70">{count}</span>
              </Link>
            );
          })}
        </div>

        <ContentFilterBar
          search={search}
          sort={sort}
          formatId={formatId ? String(formatId) : "all"}
          pillarId={pillarId ? String(pillarId) : "all"}
          channelId={channelId ? String(channelId) : "all"}
          contentType={contentType}
          subPillar={subPillar ?? "all"}
          weekIso={weekFilter ?? "all"}
          formats={formats.map((f) => ({ value: String(f.id), label: f.name }))}
          pillars={pillars.map((p) => ({ value: String(p.id), label: p.name }))}
          channels={channels.map((c) => ({ value: String(c.id), label: c.name }))}
          subPillars={subPillarsForFilter.map((sp) => ({ value: sp.slug, label: sp.name }))}
        />
      </section>

      {weekOrder.length === 0 ? (
        <section className="app-card p-7 text-sm text-[var(--ink-soft)]">
          No content pieces match the current filters. Try clearing the search, switching the status, or hit{" "}
          <Link href={newPieceHref} className="font-semibold text-[var(--brand)] underline">
            + New piece
          </Link>{" "}
          to start a new one.
        </section>
      ) : (
        weekOrder.map((weekKey) => {
          const items = weeklyMap.get(weekKey) ?? [];
          const { title, subtitle } = formatWeekLabel(weekKey);
          const isCurrent = weekKey === currentWeek;

          // Group by brand within the week
          const byBrand: Record<"seb" | "ublend", ContentListItem[]> = {
            seb: [],
            ublend: [],
          };
          const archivedItems: ContentListItem[] = [];
          for (const item of items) {
            if (item.archived) {
              archivedItems.push(item);
              continue;
            }
            byBrand[item.brand].push(item);
          }
          const showArchivedSection =
            statusGroup === "archived" || (statusGroup === "all" && archivedItems.length > 0);

          return (
            <section key={weekKey} className="app-card space-y-5 p-6 sm:p-7">
              <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="eyebrow">
                    {isCurrent ? "This week" : weekKey === "Unscheduled" ? "" : weekKey}
                  </p>
                  <h2 className="sub-title mt-1">{title}</h2>
                  <p className="muted text-sm">{subtitle}</p>
                </div>
                <p className="text-xs uppercase tracking-[0.14em] text-[var(--ink-soft)]">
                  {items.length} piece{items.length === 1 ? "" : "s"}
                </p>
              </header>

              {(["seb", "ublend"] as const).map((brandKey) => {
                const brandItems = byBrand[brandKey];
                if (brandItems.length === 0) return null;
                return (
                  <div key={brandKey} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                        {brandLabel(brandKey)}
                      </h3>
                      <span className="text-xs text-[var(--ink-soft)]">
                        {brandItems.length} piece{brandItems.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div className="grid gap-3">
                      {brandItems
                        .sort((a, b) => {
                          // Sort by status order, then by date
                          const order = ["idea", "drafting", "ready", "scheduled", "posted", "repurpose"];
                          const aIndex = order.indexOf(classifyStatus(a.status));
                          const bIndex = order.indexOf(classifyStatus(b.status));
                          if (aIndex !== bIndex) return aIndex - bIndex;
                          return (a.target_post_at ?? "").localeCompare(b.target_post_at ?? "");
                        })
                        .map((row) => (
                          <ContentCard key={row.id} row={row} />
                        ))}
                    </div>
                  </div>
                );
              })}

              {showArchivedSection && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Archived
                    </h3>
                    <span className="text-xs text-[var(--ink-soft)]">
                      {archivedItems.length}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {archivedItems.map((row) => (
                      <ContentCard key={row.id} row={row} />
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
