import type { ContentStatus } from "@/lib/types";

const colors: Record<ContentStatus | "captured" | "tracked", string> = {
  idea: "bg-stone-200 text-stone-700",
  drafting: "bg-amber-100 text-amber-900",
  ready: "bg-slate-200 text-slate-800",
  scheduled: "bg-stone-300 text-stone-900",
  posted: "bg-amber-200 text-amber-950",
  repurpose: "bg-zinc-900 text-white",
  captured: "bg-slate-200 text-slate-800",
  tracked: "bg-amber-200 text-amber-950",
};

const labels: Record<ContentStatus | "captured" | "tracked", string> = {
  idea: "Idea",
  drafting: "Drafting",
  ready: "Ready",
  scheduled: "Scheduled",
  posted: "Posted",
  repurpose: "Repurpose",
  captured: "Ready",
  tracked: "Posted",
};

export function StatusPill({ status }: { status: ContentStatus | string }) {
  const key = (status in colors ? status : "drafting") as keyof typeof colors;
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${colors[key]}`}
    >
      {labels[key]}
    </span>
  );
}
