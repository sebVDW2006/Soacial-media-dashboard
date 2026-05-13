import Link from "next/link";
import type {
  Brand,
  ContentStatus,
  ContentType,
  StorytellingStructure,
} from "@/lib/types";
import {
  ContentTypeBadge,
  StorytellingStructureBadge,
  SubPillarBadge,
} from "@/components/TaxonomyBadges";

const COLUMNS: { key: ContentStatus; label: string; helper: string }[] = [
  { key: "idea", label: "Idea", helper: "Captured but not started" },
  { key: "drafting", label: "Drafting", helper: "Writing in progress" },
  { key: "ready", label: "Ready", helper: "Written and ready to schedule" },
  { key: "scheduled", label: "Scheduled", helper: "Live date set" },
  { key: "posted", label: "Posted", helper: "Out in the world" },
  { key: "repurpose", label: "Repurpose", helper: "Worth running again" },
];

type KanbanRow = {
  id: number;
  title: string;
  status: ContentStatus | string;
  brand: Brand;
  content_type: ContentType | null;
  sub_pillar: string | null;
  storytelling_structure: StorytellingStructure | null;
  format_name: string;
  pillar_name: string;
  target_post_at: string | null;
};

function normalizeStatus(status: string): ContentStatus {
  if (status === "captured") return "ready";
  if (status === "tracked") return "posted";
  if (
    status === "idea" ||
    status === "drafting" ||
    status === "ready" ||
    status === "scheduled" ||
    status === "posted" ||
    status === "repurpose"
  ) {
    return status;
  }
  return "drafting";
}

function brandLabel(brand: Brand) {
  return brand === "seb" ? "Seb" : "uBlend";
}

export function Kanban({
  rows,
  brand = "all",
}: {
  rows: KanbanRow[];
  brand?: Brand | "all";
}) {
  const filtered = brand === "all" ? rows : rows.filter((row) => row.brand === brand);

  return (
    <div className="grid gap-4 xl:grid-cols-6">
      {COLUMNS.map((column) => {
        const items = filtered.filter((row) => normalizeStatus(row.status) === column.key);

        return (
          <section key={column.key} className="app-card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-stone-600">
                  {column.label}
                </h2>
                <p className="mt-1 text-[0.65rem] text-stone-500">{column.helper}</p>
              </div>
              <span className="chip">{items.length}</span>
            </div>
            <div className="space-y-3">
              {items.length ? (
                items.map((item) => (
                  <Link key={item.id} href={`/content/${item.id}`} className="soft-card block space-y-2 p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="chip">{brandLabel(item.brand)}</span>
                      <ContentTypeBadge contentType={item.content_type} />
                    </div>
                    <p className="font-semibold leading-snug">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5">
                      <SubPillarBadge subPillar={item.sub_pillar} />
                      <StorytellingStructureBadge structure={item.storytelling_structure} />
                    </div>
                    <p className="text-[0.7rem] text-stone-500">
                      Framework: {item.format_name}
                    </p>
                    <p className="text-[0.7rem] font-semibold text-stone-500">
                      {item.target_post_at ? item.target_post_at.slice(0, 10) : "No date"}
                    </p>
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
