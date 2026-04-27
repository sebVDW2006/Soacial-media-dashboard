import { upsertReview } from "@/app/reviews/actions";
import { getWeeklyReview } from "@/lib/queries";

type ReviewDetailPageProps = {
  params: Promise<{ week: string }>;
};

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const { week } = await params;
  const detail = await getWeeklyReview(week);

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Weekly review</p>
        <h1 className="section-title mt-2">{week}</h1>
        <p className="muted mt-4 max-w-2xl">
          Capture the learning loop so the next week gets sharper instead of just busier.
        </p>
      </section>

      <form action={upsertReview} className="app-card space-y-5 p-5">
        <input type="hidden" name="week_iso" value={week} />
        <div>
          <label>What worked</label>
          <textarea name="what_worked" defaultValue={detail.review?.what_worked ?? ""} />
        </div>
        <div>
          <label>What didn&apos;t</label>
          <textarea name="what_didnt" defaultValue={detail.review?.what_didnt ?? ""} />
        </div>
        <div>
          <label>Next week focus</label>
          <textarea
            name="next_week_focus"
            defaultValue={detail.review?.next_week_focus ?? ""}
          />
        </div>
        <div>
          <label>Top content item</label>
          <select
            name="top_content_id"
            defaultValue={detail.review?.top_content_id ? String(detail.review.top_content_id) : ""}
          >
            <option value="">No top post selected</option>
            {detail.content.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="primary-button">
          Save review
        </button>
      </form>
    </div>
  );
}

