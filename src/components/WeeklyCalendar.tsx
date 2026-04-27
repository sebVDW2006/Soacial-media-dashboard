import Link from "next/link";
import type { Brand } from "@/lib/types";

type CalendarRow = {
  content_channel_id: number;
  scheduled_at: string | null;
  brand: Brand;
  channel_name: string;
  channel_slug: string;
  content_id: number;
  title: string;
  status: string;
  target_post_at: string | null;
};

export function WeeklyCalendar({
  days,
  rows,
}: {
  days: Array<{ date: string; label: string; weekday: string }>;
  rows: CalendarRow[];
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-7">
      {days.map((day) => (
        <div key={day.date} className="app-card p-4">
          <div className="mb-4 border-b border-stone-200 pb-3">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">{day.weekday}</p>
            <p className="mt-1 text-lg font-bold">{day.label}</p>
          </div>
          <div className="space-y-4">
            {(["seb", "ublend"] as const).map((brand) => {
              const entries = rows.filter(
                (row) =>
                  row.brand === brand &&
                  (row.scheduled_at ?? row.target_post_at ?? "").slice(0, 10) === day.date,
              );

              return (
                <div key={`${day.date}-${brand}`} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-[0.12em] text-stone-500">
                      {brand === "seb" ? "Seb" : "uBlend"}
                    </h3>
                    <Link
                      href={`/content/new?date=${day.date}&brand=${brand}`}
                      className="text-xs font-semibold text-[var(--brand)]"
                    >
                      Add
                    </Link>
                  </div>
                  {entries.length ? (
                    entries.map((entry) => (
                      <Link
                        key={entry.content_channel_id}
                        href={`/content/${entry.content_id}`}
                        className="soft-card block p-3"
                      >
                        <p className="text-xs font-bold uppercase tracking-[0.12em] text-stone-500">
                          {entry.channel_name}
                        </p>
                        <p className="mt-1 font-semibold">{entry.title}</p>
                      </Link>
                    ))
                  ) : (
                    <Link
                      href={`/content/new?date=${day.date}&brand=${brand}`}
                      className="soft-card block p-3 text-sm text-stone-500"
                    >
                      Schedule something
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
