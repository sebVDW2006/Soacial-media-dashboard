import type { ContentStatus } from "@/lib/types";

const colors: Record<ContentStatus, string> = {
  idea: "bg-stone-200 text-stone-700",
  drafting: "bg-amber-100 text-amber-900",
  captured: "bg-slate-200 text-slate-800",
  scheduled: "bg-stone-300 text-stone-900",
  posted: "bg-amber-200 text-amber-950",
  tracked: "bg-zinc-900 text-white",
};

export function StatusPill({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] ${colors[status]}`}
    >
      {status}
    </span>
  );
}
