import {
  CONTENT_TYPES,
  getContentTypeMeta,
  getStorytellingStructureLabel,
  getSubPillarLabel,
} from "@/lib/taxonomy";
import type { ContentType } from "@/lib/types";

export function ContentTypeBadge({
  contentType,
  variant = "default",
}: {
  contentType: ContentType | null | undefined;
  variant?: "default" | "ghost";
}) {
  const meta = getContentTypeMeta(contentType ?? null);
  if (!meta) {
    return (
      <span className="inline-flex rounded-full bg-stone-100 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-stone-500">
        Untyped
      </span>
    );
  }
  const className =
    variant === "ghost"
      ? "inline-flex rounded-full border border-[var(--line)] px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[var(--ink)]"
      : `inline-flex rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${meta.badgeClass}`;
  return <span className={className}>{meta.label}</span>;
}

export function SubPillarBadge({ subPillar }: { subPillar: string | null | undefined }) {
  if (!subPillar) return null;
  return (
    <span className="inline-flex rounded-full border border-[var(--line)] bg-white/70 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
      {getSubPillarLabel(subPillar)}
    </span>
  );
}

export function StorytellingStructureBadge({
  structure,
}: {
  structure: string | null | undefined;
}) {
  if (!structure) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-[var(--line)] bg-stone-100 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.14em] text-stone-700">
      <span aria-hidden>◐</span>
      {getStorytellingStructureLabel(structure)}
    </span>
  );
}

export function ContentTypeLegend() {
  return (
    <div className="flex flex-wrap gap-2">
      {CONTENT_TYPES.map((type) => (
        <span
          key={type.value}
          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.14em] ${type.badgeClass}`}
        >
          {type.label}
        </span>
      ))}
    </div>
  );
}
