"use client";

import { useMemo } from "react";
import type { Brand, ContentType, StorytellingStructure } from "@/lib/types";
import {
  STORYTELLING_STRUCTURE_HELPER,
  getStorytellingStructure,
  getSuggestedStorytellingStructures,
  rankStorytellingStructures,
} from "@/lib/taxonomy";

type StorytellingStructureFieldProps = {
  brand: Brand;
  contentType: ContentType | null;
  frameworkSlug: string | null;
  value: StorytellingStructure | null;
  onChange: (next: StorytellingStructure | null) => void;
  variant: "prominent" | "collapsed";
};

export function StorytellingStructureField({
  brand,
  contentType,
  frameworkSlug,
  value,
  onChange,
  variant,
}: StorytellingStructureFieldProps) {
  const ranked = useMemo(
    () => rankStorytellingStructures(brand, contentType, frameworkSlug),
    [brand, contentType, frameworkSlug],
  );
  const suggested = useMemo(
    () => new Set(getSuggestedStorytellingStructures(brand, contentType, frameworkSlug)),
    [brand, contentType, frameworkSlug],
  );
  const selected = getStorytellingStructure(value);
  const topSlugs = ranked
    .slice(0, Math.min(3, ranked.length))
    .filter((option) => suggested.has(option.slug))
    .map((option) => option.name);
  const optionLabel = (option: (typeof ranked)[number]) =>
    `${option.name} - ${option.helper}`;

  const content = (
    <div className="space-y-4">
      <select
        id="storytelling_structure"
        name="storytelling_structure"
        value={value ?? ""}
        title={selected?.description ?? STORYTELLING_STRUCTURE_HELPER}
        onChange={(event) => onChange((event.target.value || null) as StorytellingStructure | null)}
      >
        <option value="">No story arc selected</option>
        {suggested.size > 0 && (
          <optgroup label="Suggested for this brand / type / framework">
            {ranked
              .filter((option) => suggested.has(option.slug))
              .map((option) => (
                <option key={option.slug} value={option.slug}>
                  {optionLabel(option)}
                </option>
              ))}
          </optgroup>
        )}
        <optgroup label="All structures">
          {ranked
            .filter((option) => !suggested.has(option.slug))
            .map((option) => (
              <option key={option.slug} value={option.slug}>
                {optionLabel(option)}
              </option>
            ))}
        </optgroup>
      </select>
      <p className="text-xs text-[var(--ink-soft)]">{STORYTELLING_STRUCTURE_HELPER}</p>
      {topSlugs.length > 0 && (
        <p className="text-[0.7rem] text-[var(--ink-soft)]">
          Top picks: {topSlugs.join(", ")}
        </p>
      )}
      {selected && (
        <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white/75 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                Selected story arc
              </p>
              <h3 className="mt-1 text-lg font-semibold">{selected.name}</h3>
            </div>
            <span
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[var(--line)] text-xs font-bold text-[var(--ink-soft)]"
              title={`${selected.name}: ${selected.description}`}
              aria-label={`${selected.name} description`}
            >
              i
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3">
              <div>
                <p className="eyebrow">Description</p>
                <p className="mt-1 text-sm text-[var(--ink)]">{selected.description}</p>
              </div>
              <div>
                <p className="eyebrow">Meaning</p>
                <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                  "{selected.meaning}"
                </p>
              </div>
              {selected.important ? (
                <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                  {selected.important}
                </p>
              ) : null}
            </div>

            <div>
              <p className="eyebrow">Best For</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selected.bestFor.map((item) => (
                  <span key={item} className="chip">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <p className="eyebrow">Writing Guide</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {selected.steps.map((step) => (
                <div key={step.label} className="rounded-xl border border-[var(--line)] bg-white/75 p-3">
                  <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-[var(--brand)]">
                    {step.label}:
                  </p>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{step.prompt}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="eyebrow">Example</p>
            <p className="mt-1 text-sm text-[var(--ink)]">"{selected.example}"</p>
          </div>
        </div>
      )}
    </div>
  );

  if (variant === "prominent") {
    return (
      <div>
        <div className="mb-2 flex items-center gap-2">
          <label htmlFor="storytelling_structure" className="mb-0">
            Storytelling Structure
          </label>
          <span
            className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--line)] text-[0.62rem] font-bold text-[var(--ink-soft)]"
            title={STORYTELLING_STRUCTURE_HELPER}
            aria-label="Storytelling structure help"
          >
            i
          </span>
        </div>
        {content}
      </div>
    );
  }

  return (
    <details className="rounded-2xl border border-[var(--line)] bg-white/40 p-4 open:bg-white/60">
      <summary className="cursor-pointer text-[0.7rem] font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]">
        Advanced story structure
        {selected ? ` · ${selected.name}` : ""}
      </summary>
      <div className="mt-3">
        <label htmlFor="storytelling_structure" className="sr-only">
          Storytelling Structure
        </label>
        {content}
      </div>
    </details>
  );
}
