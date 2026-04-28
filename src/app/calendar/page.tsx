import Link from "next/link";
import { MonthlyCalendar } from "@/components/MonthlyCalendar";
import { getCurrentMonth, getMonthRange } from "@/lib/week";
import { getScheduledRange } from "@/lib/queries";

type CalendarPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CalendarPage({ searchParams }: CalendarPageProps) {
  const params = (await searchParams) ?? {};
  const month = typeof params.month === "string" ? params.month : getCurrentMonth();
  const range = getMonthRange(month);
  const rows = await getScheduledRange(range.start, range.end);

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="section-title">Schedule</h1>
          <div className="flex items-center gap-4">
            <Link
              href={`/calendar?month=${range.prevMonth}`}
              className="secondary-button"
            >
              ←
            </Link>
            <span className="text-base font-semibold">{range.label}</span>
            <Link
              href={`/calendar?month=${range.nextMonth}`}
              className="secondary-button"
            >
              →
            </Link>
          </div>
        </div>
      </section>

      <MonthlyCalendar days={range.days} rows={rows} month={month} />
    </div>
  );
}
