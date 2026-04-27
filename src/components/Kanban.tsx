import Link from "next/link";
import type { Brand, ContentStatus } from "@/lib/types";
import { StatusPill } from "@/components/StatusPill";

const columns: ContentStatus[] = ["idea", "drafting", "captured", "scheduled", "posted", "tracked"];

export function Kanban({
  rows,
  brand = "all",
}: {
  rows: Array<{
    id: number;
    title: string;
    status: ContentStatus;
    brand: Brand;
    format_name: string;
    pillar_name: string;
    target_post_at: string | null;
  }>;
  brand?: Brand | "all";
}) {
  const filtered = brand === "all" ? rows : rows.filter((row) => row.brand === brand);

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {columns.map((column) => {
        const items = filtered.filter((row) => row.status === column);

        return (
          <section key={column} className="app-card p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">{column}</h2>
              <span className="chip">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.length ? (
                items.map((item) => (
                  <Link key={item.id} href={`/content/${item.id}`} className="soft-card block p-3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-2 text-sm text-stone-500">
                      {item.format_name} • {item.pillar_name}
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <StatusPill status={item.status} />
                      <span className="text-xs font-semibold text-stone-500">
                        {item.target_post_at ? item.target_post_at.slice(0, 10) : "No date"}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="muted text-sm">Nothing in this column yet.</p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

