import Link from "next/link";
import type { Brand } from "@/lib/types";

type CalendarRow = {
  content_channel_id: number;
  scheduled_at: string | null;
  brand: Brand;
  channel_name: string;
  content_id: number;
  title: string;
  target_post_at: string | null;
};

type Day = {
  date: string;
  dayNum: number;
  currentMonth: boolean;
};

const DOT_COLORS: Record<Brand, string> = {
  seb: "bg-[var(--brand)]",
  ublend: "bg-pink-500",
};

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthlyCalendar({
  days,
  rows,
  month,
}: {
  days: Day[];
  rows: CalendarRow[];
  month: string;
}) {
  const postsByDate = new Map<string, CalendarRow[]>();
  for (const row of rows) {
    const date = (row.scheduled_at ?? row.target_post_at ?? "").slice(0, 10);
    if (!date) continue;
    if (!postsByDate.has(date)) postsByDate.set(date, []);
    postsByDate.get(date)!.push(row);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="app-card overflow-hidden">
      {/* Legend */}
      <div className="flex items-center gap-6 border-b border-[var(--line)] px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[var(--brand)]" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">Seb</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-pink-500" />
          <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ink-soft)]">uBlend</span>
        </div>
        <div className="ml-auto text-xs text-[var(--ink-soft)]">
          Click a dot to edit · Click + to add
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-[var(--line)]">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="border-r border-[var(--line)] px-3 py-2 text-center text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)] last:border-r-0"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const posts = postsByDate.get(day.date) ?? [];
          const isToday = day.date === today;
          const isLast = i === days.length - 1;
          const isLastInRow = (i + 1) % 7 === 0;

          return (
            <div
              key={day.date}
              className={[
                "relative min-h-[80px] border-b border-r border-[var(--line)] p-2",
                isLastInRow ? "border-r-0" : "",
                isLast || i >= days.length - 7 ? "border-b-0" : "",
                !day.currentMonth ? "bg-[var(--surface-muted,#fafaf9)]" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {/* Day number + add link */}
              <div className="flex items-start justify-between">
                <span
                  className={[
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold",
                    isToday
                      ? "bg-[var(--brand)] text-white"
                      : day.currentMonth
                        ? "text-[var(--ink)]"
                        : "text-[var(--ink-soft)]",
                  ].join(" ")}
                >
                  {day.dayNum}
                </span>
                <Link
                  href={`/content/new?date=${day.date}`}
                  className="text-[0.65rem] font-bold text-[var(--ink-soft)] hover:text-[var(--brand)]"
                  title="New piece"
                >
                  +
                </Link>
              </div>

              {/* Dots */}
              {posts.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {posts.map((post) => (
                    <Link
                      key={post.content_channel_id}
                      href={`/content/${post.content_id}`}
                      title={`${post.channel_name}: ${post.title}`}
                      className={`h-2.5 w-2.5 rounded-full ${DOT_COLORS[post.brand]} transition-transform hover:scale-125`}
                    />
                  ))}
                </div>
              )}

              {/* Post titles (shown on md+ screens for days with few posts) */}
              {posts.length > 0 && posts.length <= 2 && (
                <div className="mt-1.5 hidden space-y-1 sm:block">
                  {posts.map((post) => (
                    <Link
                      key={`label-${post.content_channel_id}`}
                      href={`/content/${post.content_id}`}
                      className={[
                        "block truncate rounded px-1 py-0.5 text-[0.62rem] font-semibold leading-tight",
                        post.brand === "seb"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-pink-50 text-pink-700",
                      ].join(" ")}
                      title={`${post.channel_name}: ${post.title}`}
                    >
                      {post.title}
                    </Link>
                  ))}
                </div>
              )}

              {/* Overflow indicator */}
              {posts.length > 2 && (
                <p className="mt-1 hidden text-[0.6rem] text-[var(--ink-soft)] sm:block">
                  +{posts.length - 2} more
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
