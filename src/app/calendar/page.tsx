import { PaintingFeature } from "@/components/PaintingFeature";
import { WeekPicker } from "@/components/WeekPicker";
import { WeeklyCalendar } from "@/components/WeeklyCalendar";
import { featuredInspiration } from "@/lib/inspiration";
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
      <section className="grid gap-8 2xl:grid-cols-[1.15fr_0.95fr]">
        <div className="app-card p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 3</p>
          <h1 className="section-title mt-2">Schedule</h1>
          <p className="muted mt-4 max-w-2xl leading-8">
            Place each content piece into the week so the publishing plan is visible Monday to Sunday.
          </p>
          <div className="mt-8">
            <WeekPicker currentWeek={week} />
          </div>
        </div>

        <PaintingFeature
          artwork={featuredInspiration.calendar}
          eyebrow="Page atmosphere"
          title="Place the week with calm order."
          copy="The calendar should feel composed and spacious, like arranging the week inside a larger horizon."
          heightClass="min-h-[420px]"
          align="top"
        />
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
