import Link from "next/link";
import { Kanban } from "@/components/Kanban";
import { moveStatus } from "@/app/pipeline/actions";
import { getContentItems } from "@/lib/queries";

type PipelinePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const params = (await searchParams) ?? {};
  const brand = typeof params.brand === "string" ? params.brand : "all";
  const rows = await getContentItems(brand as "all" | "seb" | "ublend");

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 6</p>
          <h1 className="section-title mt-2">Pipeline</h1>
          <p className="muted mt-4 max-w-2xl">
            View the whole system as a single lane from idea to tracked. Use the quick controls below when something needs a manual stage bump.
          </p>
        </div>
        <div className="flex gap-2">
          {(["all", "seb", "ublend"] as const).map((option) => (
            <Link
              key={option}
              href={option === "all" ? "/pipeline" : `/pipeline?brand=${option}`}
              className={`chip ${brand === option ? "active" : ""}`}
            >
              {option === "all" ? "All" : option === "seb" ? "Seb" : "uBlend"}
            </Link>
          ))}
        </div>
      </section>

      <Kanban
        rows={rows.map((row) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          brand: row.brand,
          format_name: row.format_name,
          pillar_name: row.pillar_name,
          target_post_at: row.target_post_at,
        }))}
        brand={brand as "all" | "seb" | "ublend"}
      />

      <section className="app-card p-5">
        <h2 className="sub-title">Quick status edits</h2>
        <div className="mt-4 grid gap-3">
          {rows.map((row) => (
            <form
              key={row.id}
              action={moveStatus}
              className="soft-card grid gap-3 p-4 md:grid-cols-[1.8fr_1fr_auto]"
            >
              <input type="hidden" name="id" value={row.id} />
              <div>
                <p className="font-semibold">{row.title}</p>
                <p className="text-sm text-stone-500">
                  {row.format_name} • {row.pillar_name}
                </p>
              </div>
              <select name="status" defaultValue={row.status}>
                <option value="idea">Idea</option>
                <option value="drafting">Drafting</option>
                <option value="captured">Captured</option>
                <option value="scheduled">Scheduled</option>
                <option value="posted">Posted</option>
                <option value="tracked">Tracked</option>
              </select>
              <button type="submit" className="secondary-button">
                Update
              </button>
            </form>
          ))}
        </div>
      </section>
    </div>
  );
}

