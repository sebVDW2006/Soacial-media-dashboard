import Link from "next/link";
import { getCurrentWeek } from "@/lib/week";
import { getWeeklyReviews } from "@/lib/queries";

export default async function ReviewsPage() {
  const reviews = await getWeeklyReviews();
  const currentWeek = getCurrentWeek();

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 10</p>
          <h1 className="section-title mt-2">Weekly reviews</h1>
          <p className="muted mt-4 max-w-2xl">
            Sunday reflection: what worked, what didn&apos;t, and what gets tightened next week.
          </p>
        </div>
        <Link href={`/reviews/${currentWeek}`} className="primary-button">
          Review current week
        </Link>
      </section>

      <div className="grid gap-4">
        {reviews.length ? (
          reviews.map((review) => (
            <Link key={review.id} href={`/reviews/${review.week_iso}`} className="app-card block p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{review.week_iso}</h2>
                  <p className="mt-2 text-sm text-stone-500">
                    {review.next_week_focus ?? "No focus captured yet"}
                  </p>
                </div>
                <span className="chip">{review.created_at.slice(0, 10)}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="app-card p-6">
            <p className="muted">No weekly reviews yet. Start with the current week.</p>
          </div>
        )}
      </div>
    </div>
  );
}

