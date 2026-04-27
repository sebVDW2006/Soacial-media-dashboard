import Link from "next/link";
import { deleteContent } from "@/app/content/actions";
import { getContentItems } from "@/lib/queries";
import type { ContentStatus } from "@/lib/types";

type ContentPiecesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabels: Record<ContentStatus, string> = {
  idea: "Idea",
  drafting: "Drafting",
  captured: "Captured",
  scheduled: "Scheduled",
  posted: "Posted",
  tracked: "Tracked",
};

export default async function ContentPiecesPage({ searchParams }: ContentPiecesPageProps) {
  const params = (await searchParams) ?? {};
  const brand = typeof params.brand === "string" ? params.brand : "all";
  const rows = await getContentItems(brand as "all" | "seb" | "ublend");

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="section-title">Content pieces</h1>
          <Link
            href={brand === "all" ? "/content/new" : `/content/new?brand=${brand}`}
            className="primary-button"
          >
            + New piece
          </Link>
        </div>
      </section>

      <section className="app-card p-6 sm:p-7">
        <div className="grid gap-3">
          {rows.length ? (
            rows.map((row) => (
              <div
                key={row.id}
                className="soft-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <span className="chip">{row.brand === "seb" ? "Seb" : "uBlend"}</span>
                    <span className="chip">{statusLabels[row.status]}</span>
                  </div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--brand)]">
                    {row.title}
                  </h3>
                  <p className="text-sm leading-7 text-[var(--ink-soft)]">
                    {row.format_name} • {row.pillar_name}
                    {row.channel_names ? ` • ${row.channel_names}` : ""}
                  </p>
                  <p className="text-sm text-[var(--ink-soft)]">
                    {row.target_post_at
                      ? `Target: ${row.target_post_at.slice(0, 16).replace("T", " ")}`
                      : "No target date yet"}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Link href={`/content/${row.id}`} className="primary-button">
                    Edit piece
                  </Link>
                  <form action={deleteContent}>
                    <input type="hidden" name="id" value={row.id} />
                    <button
                      type="submit"
                      className="secondary-button"
                      onClick={(e) => {
                        if (!confirm("Delete this piece? This cannot be undone.")) e.preventDefault();
                      }}
                    >
                      Delete
                    </button>
                  </form>
                </div>
              </div>
            ))
          ) : (
            <div className="soft-card p-5 text-sm text-[var(--ink-soft)]">
              No content pieces yet. Hit &quot;+ New piece&quot; to start.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
