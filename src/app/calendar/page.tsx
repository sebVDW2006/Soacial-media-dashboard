import { WeekPicker } from "@/components/WeekPicker";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { getCurrentWeek } from "@/lib/week";
import { getScheduledWeek } from "@/lib/queries";

type CalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = (await searchParams) ?? {};
  const week = typeof params.week === "string" ? params.week : getCurrentWeek();
  const { range, rows } = await getScheduledWeek(week);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 5</p>
          <h1 className="section-title mt-2">Weekly calendar</h1>
          <p className="muted mt-4 max-w-2xl">
            Monday to Sunday, split by Seb and uBlend, with empty cells ready to become posts.
          </p>
        </div>
        <WeekPicker currentWeek={week} />
      </section>

      <div className="app-card p-5">
        <p className="text-sm font-semibold text-stone-500">
          Week runs {range.start} to {range.end}
        </p>
      </div>

      <WeeklyCalendar days={range.days} rows={rows} />
    </div>
  );
}

