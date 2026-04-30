import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";
import { getWeeklySlotContent } from "@/lib/queries";
import { getCurrentWeek, getISOWeek, weekRange } from "@/lib/week";

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

const WEEKLY_SLOTS: Slot[] = [
  {
    day: "Mon",
    brand: "seb",
    channelSlug: "seb_linkedin",
    channelName: "Seb LinkedIn",
    formatSlug: "founder-lesson",
    pillarSlug: "startup-journey",
    postType: "text-post",
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
    postType: "story",
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
    postType: "text-post",
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
    postType: "short-video",
    style: "Experience Demo or Raw Build Update",
    format: "Short video",
    purpose: "Reach new people",
    optional: true,
  },
];

const STATUS_COLOR: Record<string, string> = {
  tracked: "text-emerald-600",
  posted: "text-emerald-600",
  scheduled: "text-blue-600",
  captured: "text-amber-600",
  drafting: "text-amber-600",
  idea: "text-amber-600",
};

export async function WeeklyPlanSidebar({
  weekIso,
  date,
}: {
  weekIso?: string;
  date?: string | null;
}) {
  noStore();
  const week = weekIso ?? (date ? getISOWeek(date) : getCurrentWeek());
  const range = weekRange(week);
  const items = await getWeeklySlotContent(week);

  // Build a map: channel_slug -> list of content items
  const byChannel = new Map<string, typeof items>();
  for (const item of items) {
    const existing = byChannel.get(item.channel_slug) ?? [];
    existing.push(item);
    byChannel.set(item.channel_slug, existing);
  }

  const done = WEEKLY_SLOTS.filter((s) => byChannel.has(s.channelSlug)).length;

  return (
    <aside className="app-card h-fit p-5 space-y-4">
      {/* Header */}
      <div>
        <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
          This week · {range.days[0]?.date?.slice(5)} – {range.days[6]?.date?.slice(5)}
        </p>
        <h2 className="mt-1 text-base font-bold tracking-[-0.03em]">Weekly plan</h2>
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

      {/* Slots */}
      <div className="space-y-2">
        {WEEKLY_SLOTS.map((slot) => {
          const slotItems = byChannel.get(slot.channelSlug) ?? [];
          const isDone = slotItems.length > 0;
          const dayIndex = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].indexOf(slot.day);
          const slotDate = range.days[dayIndex]?.date ?? "";
          const createParams = new URLSearchParams({
            brand: slot.brand,
            channel: slot.channelSlug,
            date: slotDate,
            format: slot.formatSlug,
            pillar: slot.pillarSlug,
            postType: slot.postType,
          });

          return (
            <div
              key={slot.channelSlug}
              className={`rounded-xl border p-3 ${
                isDone
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-[var(--line)] bg-white/60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  {/* Day badge */}
                  <span
                    className={`inline-flex h-6 w-9 items-center justify-center rounded-full text-[0.6rem] font-bold uppercase tracking-wider ${
                      isDone
                        ? "bg-emerald-500 text-white"
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
              {slotItems.length > 0 && (
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
