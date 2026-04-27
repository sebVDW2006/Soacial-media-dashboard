import Link from "next/link";
import { getContentItems } from "@/lib/queries";
import type { ContentStatus } from "@/lib/types";

type ContentPiecesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statuses: ContentStatus[] = ["drafting", "captured", "scheduled", "posted", "tracked"];

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
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 1 + 2</p>
          <h1 className="section-title mt-2">Content pieces</h1>
          <p className="muted mt-4 max-w-3xl">
            This is the main working surface. Create the piece, open any draft again, and move straight from writing
            into scheduling without hunting around the product.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href={brand === "all" ? "/content/new" : `/content/new?brand=${brand}`} className="primary-button">
            Create new piece
          </Link>
          <Link href={brand === "all" ? "/inbox" : `/inbox?brand=${brand}`} className="secondary-button">
            Open inbox
          </Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statuses.map((status) => {
          const count = rows.filter((row) => row.status === status).length;

          return (
            <div key={status} className="soft-card p-5">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                {statusLabels[status]}
              </div>
              <div className="mt-2 text-3xl font-semibold tracking-[-0.06em] text-[var(--brand)]">{count}</div>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <div className="app-card p-6 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="eyebrow">Working list</div>
              <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
                Edit what already exists
              </h2>
            </div>
            <Link href={brand === "all" ? "/calendar" : `/calendar?brand=${brand}`} className="secondary-button">
              Go to schedule
            </Link>
          </div>

          <div className="mt-6 grid gap-3">
            {rows.length ? (
              rows.map((row) => (
                <div key={row.id} className="soft-card flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <span className="chip">{row.brand === "seb" ? "Seb" : "uBlend"}</span>
                      <span className="chip">{statusLabels[row.status]}</span>
                    </div>
                    <h3 className="text-xl font-semibold tracking-[-0.03em] text-[var(--brand)]">{row.title}</h3>
                    <p className="text-sm leading-7 text-[var(--ink-soft)]">
                      {row.format_name} • {row.pillar_name}
                      {row.channel_names ? ` • ${row.channel_names}` : ""}
                    </p>
                    <p className="text-sm text-[var(--ink-soft)]">
                      {row.target_post_at ? `Target post: ${row.target_post_at.slice(0, 16).replace("T", " ")}` : "No target post date yet"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href={`/content/${row.id}`} className="primary-button">
                      Edit piece
                    </Link>
                    <Link href={`/content/${row.id}`} className="secondary-button">
                      Schedule / post
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="soft-card p-5 text-sm text-[var(--ink-soft)]">
                No content pieces yet. Create one above or promote an idea from the inbox.
              </div>
            )}
          </div>
        </div>

        <section className="app-card p-6 sm:p-7">
          <div className="eyebrow">What to do next</div>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
            Use this page like a command centre
          </h2>
          <div className="mt-6 space-y-4">
            {[
              "Create the piece when the idea is ready.",
              "Open the same piece again to edit the draft.",
              "Add the channels and target date before moving to schedule.",
              "Use the calendar for timing and the pipeline for posting status.",
              "Use track data only after the post is live and performance exists.",
            ].map((item, index) => (
              <div key={item} className={`soft-card p-4 ${index === 0 ? "studio-accent-card" : ""}`}>
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Step {index + 1}
                </div>
                <p className="mt-2 text-sm leading-7 text-[var(--ink)]">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
