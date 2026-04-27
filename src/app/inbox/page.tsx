import Link from "next/link";
import { IdeaQuickAdd } from "@/components/IdeaQuickAdd";
import { createIdea, deleteIdea, promoteIdea } from "@/app/inbox/actions";
import { getIdeas, getReferenceData } from "@/lib/queries";

type InboxPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function InboxPage({ searchParams }: InboxPageProps) {
  const params = (await searchParams) ?? {};
  const brand = typeof params.brand === "string" ? params.brand : "all";
  const { formats } = await getReferenceData();
  const ideas = await getIdeas(brand as "all" | "seb" | "ublend");

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 1</p>
          <h1 className="section-title mt-2">Idea inbox</h1>
          <p className="muted mt-4 max-w-2xl">
            This is the fast capture surface. Keep it stupid simple so ideas can land in under ten seconds.
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "seb", "ublend"] as const).map((option) => (
            <Link
              key={option}
              href={option === "all" ? "/inbox" : `/inbox?brand=${option}`}
              className={`chip ${brand === option ? "active" : ""}`}
            >
              {option === "all" ? "All" : option === "seb" ? "Seb" : "uBlend"}
            </Link>
          ))}
        </div>
      </section>

      <IdeaQuickAdd action={createIdea} formats={formats} />

      <section className="grid gap-4">
        {ideas.length ? (
          ideas.map((idea) => (
            <article key={idea.id} className="app-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <h2 className="text-xl font-bold">{idea.title}</h2>
                <div className="flex flex-wrap gap-2">
                  <span className="chip">{idea.format_name ?? "No format yet"}</span>
                  <span className="text-sm text-stone-500">
                    {idea.created_at.slice(0, 10)}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <form action={promoteIdea}>
                  <input type="hidden" name="id" value={idea.id} />
                  <button type="submit" className="primary-button">
                    Promote
                  </button>
                </form>
                <form action={deleteIdea}>
                  <input type="hidden" name="id" value={idea.id} />
                  <button type="submit" className="danger-button">
                    Drop
                  </button>
                </form>
              </div>
            </article>
          ))
        ) : (
          <div className="app-card p-6">
            <p className="muted">No ideas in the inbox yet. Add one above to start the weekly flow.</p>
          </div>
        )}
      </section>
    </div>
  );
}

