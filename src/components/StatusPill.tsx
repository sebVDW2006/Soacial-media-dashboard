import type { ContentStatus } from "@/lib/types";

const colors: Record<ContentStatus, string> = {
  idea: "bg-stone-200 text-stone-700",
  drafting: "bg-amber-100 text-amber-800",
  captured: "bg-sky-100 text-sky-800",
  scheduled: "bg-violet-100 text-violet-800",
  posted: "bg-emerald-100 text-emerald-800",
  tracked: "bg-rose-100 text-rose-800",
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

