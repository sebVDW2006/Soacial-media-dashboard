import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getWeeklyContentTypeBalance, getWeeklySlotContent } from "@/lib/queries";
import { getCurrentWeek, getISOWeek, shiftWeek, weekRange } from "@/lib/week";
import { CONTENT_TYPES, SUGGESTED_WEEKLY_BALANCE } from "@/lib/taxonomy";
import type { Brand, ContentType } from "@/lib/types";

type Slot = {
  day: string;
  brand: "seb" | "ublend";
  channelSlug: string;
  channelName: string;
  formatSlug: string;
  pillarSlug: string;
  postType: string;
  style: string;
  format: string;
  purpose: string;
  optional?: boolean;
};

type PendingDraft = {
  channelSlug: string;
  date?: string | null;
};

const WEEKLY_SLOTS: Slot[] = [
  {
    day: "Mon",
    brand: "seb",
    channelSlug: "seb_linkedin",
    channelName: "Seb LinkedIn",
    formatSlug: "founder-lesson",
    pillarSlug: "startup-journey",
    postType: "linkedin-text-post",
    style: "Founder Lesson",
    format: "Text post",
    purpose: "Build founder authority",
  },
  {
    day: "Tue",
    brand: "ublend",
    channelSlug: "ublend_instagram",
    channelName: "uBlend Instagram",
    formatSlug: "ingredient-truth",
    pillarSlug: "healthy-eating",
    postType: "carousel",
    style: "Ingredient Truth / Product Proof",
    format: "Photo or Carousel",
    purpose: "Build product trust",
  },
  {
    day: "Wed",
    brand: "seb",
    channelSlug: "seb_instagram",
    channelName: "Seb Instagram",
    formatSlug: "discipline-bridge",
    pillarSlug: "discipline-lifestyle",
    postType: "photo-post",
    style: "Discipline Bridge or Founder Reflection",
    format: "Photo or Story stack",
    purpose: "Build personal connection",
  },
  {
    day: "Thu",
    brand: "ublend",
    channelSlug: "ublend_linkedin",
    channelName: "uBlend LinkedIn",
    formatSlug: "venue-case",
    pillarSlug: "b2b-experience",
    postType: "linkedin-text-post",
    style: "Venue Case Post",
    format: "Text post",
    purpose: "Attract venues and gyms",
  },
  {
    day: "Fri",
    brand: "ublend",
    channelSlug: "tiktok",
    channelName: "Reel / TikTok / Shorts",
    formatSlug: "ublend-experience-demo",
    pillarSlug: "b2b-experience",
    postType: "reel-short",
    style: "Experience Demo or Raw Build Update",
    format: "Short video",
    purpose: "Reach new people",
    optional: true,
  },
];

const STATUS_COLOR: Record<string, string> = {
  posted: "text-emerald-600",
  scheduled: "text-blue-600",
  ready: "text-amber-600",
  drafting: "text-amber-600",
  idea: "text-amber-600",
  repurpose: "text-purple-600",
};

function buildBalanceCounts(
  rows: Awaited<ReturnType<typeof getWeeklyContentTypeBalance>>,
) {
  const totals: Record<Brand, Record<ContentType | "untyped", number>> = {
    seb: { educational: 0, storytelling: 0, authority: 0, untyped: 0 },
    ublend: { educational: 0, storytelling: 0, authority: 0, untyped: 0 },
  };
  for (const row of rows) {
    const brand = row.brand;
    if (brand !== "seb" && brand !== "ublend") continue;
    const key: ContentType | "untyped" = row.content_type ?? "untyped";
    totals[brand][key] += Number(row.count ?? 0);
  }
  return totals;
}

function balanceWarning(
  totals: ReturnType<typeof buildBalanceCounts>[Brand],
  brand: Brand,
) {
  const target = SUGGESTED_WEEKLY_BALANCE[brand];
  const total = totals.educational + totals.storytelling + totals.authority + totals.untyped;
  if (total === 0) return null;

  const missing: ContentType[] = [];
  for (const type of ["storytelling", "educational", "authority"] as ContentType[]) {
    if (target[type] > 0 && totals[type] === 0) missing.push(type);
  }
  if (missing.length === 0 && totals.untyped === 0) return null;

  const sentences: string[] = [];
  if (missing.length > 0) {
    const heaviest = (["educational", "storytelling", "authority"] as ContentType[])
      .map((type) => ({ type, count: totals[type] }))
      .sort((a, b) => b.count - a.count)[0];
    if (heaviest && heaviest.count >= 3) {
      const otherTypeLabel = CONTENT_TYPES.find((t) => t.value === missing[0])?.label;
      const heaviestLabel = CONTENT_TYPES.find((t) => t.value === heaviest.type)?.label;
      sentences.push(
        `You have ${heaviest.count} ${heaviestLabel} posts and no ${otherTypeLabel} posts this week. Consider adding a ${otherTypeLabel?.toLowerCase()} post to balance the mix.`,
      );
    } else {
      const labels = missing
        .map((type) => CONTENT_TYPES.find((t) => t.value === type)?.label ?? type)
        .join(", ");
      sentences.push(`Missing: ${labels}.`);
    }
  }
  if (totals.untyped > 0) {
    sentences.push(
      `${totals.untyped} post${totals.untyped === 1 ? "" : "s"} have no content type set — open and tag them so the balance is accurate.`,
    );
  }
  return sentences.join(" ");
}

function BalanceBars({
  totals,
  brand,
}: {
  totals: ReturnType<typeof buildBalanceCounts>[Brand];
  brand: Brand;
}) {
  const total = totals.educational + totals.storytelling + totals.authority;
  const slotsTarget = Math.max(
    total,
    SUGGESTED_WEEKLY_BALANCE[brand].educational +
      SUGGESTED_WEEKLY_BALANCE[brand].storytelling +
      SUGGESTED_WEEKLY_BALANCE[brand].authority,
  );
  return (
    <div className="space-y-1.5">
      {(["educational", "storytelling", "authority"] as ContentType[]).map((type) => {
        const meta = CONTENT_TYPES.find((t) => t.value === type);
        const count = totals[type];
        const widthPct = slotsTarget > 0 ? Math.min(100, (count / slotsTarget) * 100) : 0;
        return (
          <div key={type} className="space-y-1">
            <div className="flex items-center justify-between gap-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              <span>{meta?.label}</span>
              <span className="text-[var(--ink)]">
                {count}
                {SUGGESTED_WEEKLY_BALANCE[brand][type] > 0
                  ? ` / ${SUGGESTED_WEEKLY_BALANCE[brand][type]}`
                  : ""}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-[var(--line)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--brand)]"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export async function WeeklyPlanSidebar({
  weekIso,
  date,
  pendingDraft,
  basePath,
}: {
  weekIso?: string;
  date?: string | null;
  pendingDraft?: PendingDraft | null;
  basePath?: string;
}) {
  noStore();
  const week = weekIso ?? (date ? getISOWeek(date) : getCurrentWeek());
  const range = weekRange(week);
  const [items, balanceRows] = await Promise.all([
    getWeeklySlotContent(week),
    getWeeklyContentTypeBalance(week),
  ]);
  const balance = buildBalanceCounts(balanceRows);
  const currentWeek = getCurrentWeek();
  const isCurrent = week === currentWeek;
  const navBase = basePath ?? "";
  const prevHref = `${navBase}?week=${shiftWeek(week, -1)}`;
  const nextHref = `${navBase}?week=${shiftWeek(week, 1)}`;
  const todayHref = `${navBase}?week=${currentWeek}`;
  const weekPickerAction = navBase || undefined;
  const offsetWeeks = (() => {
    const monday = (iso: string) => new Date(`${weekRange(iso).start}T00:00:00Z`).getTime();
    const diff = monday(week) - monday(currentWeek);
    return Math.round(diff / (7 * 24 * 60 * 60 * 1000));
  })();
  const weekLabel =
    offsetWeeks === 0
      ? "This week"
      : offsetWeeks === 1
        ? "Next week"
        : offsetWeeks === -1
          ? "Last week"
          : offsetWeeks > 0
            ? `In ${offsetWeeks} weeks`
            : `${Math.abs(offsetWeeks)} weeks ago`;

  // Build a map: channel_slug -> list of content items
  const byChannel = new Map<string, typeof items>();
  for (const item of items) {
    const existing = byChannel.get(item.channel_slug) ?? [];
    existing.push(item);
    byChannel.set(item.channel_slug, existing);
  }

  const isPendingSlot = (slot: Slot, slotDate: string) =>
    pendingDraft?.channelSlug === slot.channelSlug &&
    (!pendingDraft.date || pendingDraft.date === slotDate);

  const done = WEEKLY_SLOTS.filter((slot) => {
    const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(slot.day);
    const slotDate = range.days[dayIndex]?.date ?? "";
    return byChannel.has(slot.channelSlug) || isPendingSlot(slot, slotDate);
  }).length;

  const sebWarning = balanceWarning(balance.seb, "seb");
  const ublendWarning = balanceWarning(balance.ublend, "ublend");

  const totalPosts =
    balance.seb.educational + balance.seb.storytelling + balance.seb.authority + balance.seb.untyped +
    balance.ublend.educational + balance.ublend.storytelling + balance.ublend.authority + balance.ublend.untyped;

  return (
    <aside className="app-card h-fit p-5 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <Link
            href={prevHref}
            aria-label="Previous week"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--line)] hover:text-[var(--ink)]"
          >
            ←
          </Link>
          <p className="flex-1 text-center text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            {weekLabel} · {range.days[0]?.date?.slice(5)} – {range.days[6]?.date?.slice(5)}
          </p>
          <Link
            href={nextHref}
            aria-label="Next week"
            className="flex h-7 w-7 items-center justify-center rounded-full text-[var(--ink-soft)] hover:bg-[var(--line)] hover:text-[var(--ink)]"
          >
            →
          </Link>
        </div>
        <div className="mt-1 flex items-center justify-between gap-2">
          <h2 className="text-base font-bold tracking-[-0.03em]">Weekly plan</h2>
          {!isCurrent && (
            <Link
              href={todayHref}
              className="text-[0.65rem] font-semibold text-[var(--brand)] hover:underline"
            >
              Today
            </Link>
          )}
        </div>
        <form action={weekPickerAction} className="mt-3 flex items-center gap-2">
          <label htmlFor="weekly-plan-week" className="sr-only">
            Jump to week
          </label>
          <input
            id="weekly-plan-week"
            name="week"
            type="week"
            defaultValue={week}
            className="h-9 min-w-0 flex-1 rounded-full border border-[var(--line)] bg-white/90 px-3 text-[0.72rem] font-semibold text-[var(--ink)]"
          />
          <button
            type="submit"
            className="h-9 rounded-full border border-[var(--line)] px-3 text-[0.7rem] font-bold text-[var(--brand)] hover:bg-[var(--line)]"
          >
            Go
          </button>
        </form>
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 rounded-full bg-[var(--line)] overflow-hidden">
            <div
              className="h-full rounded-full bg-[var(--brand)] transition-all"
              style={{ width: `${Math.round((done / WEEKLY_SLOTS.length) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-[var(--ink-soft)]">
            {done}/{WEEKLY_SLOTS.length}
          </span>
        </div>
      </div>

      {/* Content type balance */}
      <div className="space-y-3 rounded-2xl border border-[var(--line)] bg-white/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
            Content mix
          </p>
          <span className="text-[0.65rem] text-[var(--ink-soft)]">{totalPosts} total</span>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              Seb
            </p>
            <div className="mt-1">
              <BalanceBars totals={balance.seb} brand="seb" />
            </div>
            {sebWarning && (
              <p className="mt-2 rounded-xl bg-amber-50 px-2.5 py-2 text-[0.65rem] text-amber-900">
                {sebWarning}
              </p>
            )}
          </div>
          <div>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
              uBlend
            </p>
            <div className="mt-1">
              <BalanceBars totals={balance.ublend} brand="ublend" />
            </div>
            {ublendWarning && (
              <p className="mt-2 rounded-xl bg-amber-50 px-2.5 py-2 text-[0.65rem] text-amber-900">
                {ublendWarning}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="space-y-2">
        {WEEKLY_SLOTS.map((slot) => {
          const slotItems = byChannel.get(slot.channelSlug) ?? [];
          const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(slot.day);
          const slotDate = range.days[dayIndex]?.date ?? "";
          const hasSavedContent = slotItems.length > 0;
          const draftInProgress = !hasSavedContent && isPendingSlot(slot, slotDate);
          const isDone = hasSavedContent || draftInProgress;
          const createParams = new URLSearchParams({
            brand: slot.brand,
            channel: slot.channelSlug,
            date: slotDate,
            week,
            format: slot.formatSlug,
            pillar: slot.pillarSlug,
            postType: slot.postType,
          });

          return (
            <div
              key={slot.channelSlug}
              className={`rounded-xl border p-3 ${
                hasSavedContent
                  ? "border-emerald-200 bg-emerald-50"
                  : draftInProgress
                    ? "border-amber-200 bg-amber-50"
                  : "border-[var(--line)] bg-white/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Day badge */}
                  <span
                    className={`inline-flex h-6 w-9 items-center justify-center rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${
                      hasSavedContent
                        ? "bg-emerald-500 text-white"
                        : draftInProgress
                          ? "bg-amber-500 text-white"
                        : "bg-[var(--line)] text-[var(--ink-soft)]"
                    }`}
                  >
                    {slot.day}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[var(--ink)]">{slot.channelName}</p>
                    <p className="text-[0.65rem] text-[var(--ink-soft)]">{slot.style}</p>
                  </div>
                </div>
                {slot.optional && (
                  <span className="shrink-0 text-[0.6rem] font-semibold uppercase tracking-wider text-[var(--ink-soft)]">
                    opt
                  </span>
                )}
              </div>

              {/* Format + purpose */}
              <p className="mt-1.5 text-[0.65rem] text-[var(--ink-soft)] pl-11">
                {slot.format} · {slot.purpose}
              </p>

              {/* Existing pieces */}
              {hasSavedContent && (
                <div className="mt-2 space-y-1 pl-11">
                  {slotItems.map((item) => (
                    <Link
                      key={item.id}
                      href={`/content/${item.id}`}
                      className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-emerald-700 hover:underline"
                    >
                      <span>✓</span>
                      <span className="truncate">{item.title}</span>
                      <span className={`ml-auto shrink-0 capitalize ${STATUS_COLOR[item.status] ?? ""}`}>
                        {item.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {draftInProgress && (
                <div className="mt-2 pl-11">
                  <div className="flex items-center gap-1.5 text-[0.65rem] font-semibold text-amber-700">
                    <span>•</span>
                    <span>Draft in progress</span>
                    <span className="ml-auto shrink-0 uppercase tracking-wide text-amber-600">
                      unsaved
                    </span>
                  </div>
                </div>
              )}

              {/* Not created yet */}
              {!isDone && (
                <div className="mt-2 pl-11">
                  <Link
                    href={`/content/new?${createParams.toString()}`}
                    className="text-[0.65rem] font-semibold text-[var(--brand)] hover:underline"
                  >
                    + Create this piece
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
