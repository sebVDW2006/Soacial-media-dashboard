"use client";

import type { ContentType, StorytellingStructure } from "@/lib/types";
import { SMART_TEMPLATES, getStorytellingStructure } from "@/lib/taxonomy";
import { ContentTypeBadge } from "@/components/TaxonomyBadges";

type SmartTemplatePanelProps = {
  contentType: ContentType | null;
  storytellingStructure: StorytellingStructure | null;
  hookEmpty: boolean;
  bodyEmpty: boolean;
  closeEmpty: boolean;
  onApply: (next: { hook?: string; body?: string; close?: string }) => void;
};

type Step = { label: string; prompt: string };

export function SmartTemplatePanel({
  contentType,
  storytellingStructure,
  hookEmpty,
  bodyEmpty,
  closeEmpty,
  onApply,
}: SmartTemplatePanelProps) {
  const structure = getStorytellingStructure(storytellingStructure);

  let title: string;
  let badge: ContentType | null = contentType;
  let steps: Step[];
  let helper: string;

  if (structure) {
    title = `${structure.name} structure`;
    steps = structure.steps;
    helper =
      "Fill-in writing guide for this story arc. Use this structure only fills empty fields - your existing copy stays.";
  } else if (contentType) {
    title = "Smart structure";
    steps = SMART_TEMPLATES[contentType].steps;
    helper =
      "Use this as a scaffold. The Use this structure button only fills empty fields - your existing copy stays.";
  } else {
    return (
      <section className="app-card space-y-3 p-6 sm:p-7">
        <h2 className="sub-title">Smart structure</h2>
        <p className="text-sm text-[var(--ink-soft)]">
          Pick a Content Type to see the recommended writing structure for this post.
        </p>
      </section>
    );
  }

  const allEmpty = hookEmpty && bodyEmpty && closeEmpty;

  return (
    <section className="app-card space-y-4 p-6 sm:p-7">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="sub-title">{title}</h2>
          {badge ? <ContentTypeBadge contentType={badge} /> : null}
          {structure ? (
            <span className="chip">Story arc</span>
          ) : null}
        </div>
        {allEmpty && steps.length >= 3 && (
          <button
            type="button"
            onClick={() => {
              const hook = steps[0]?.prompt ?? "";
              const middleSteps = steps.slice(1, -1);
              const body = middleSteps
                .map((step) => `${step.label}: ${step.prompt}`)
                .join("\n\n");
              const close = steps[steps.length - 1]?.prompt ?? "";
              onApply({ hook, body, close });
            }}
            className="secondary-button"
          >
            Use this structure
          </button>
        )}
      </header>
      {structure ? (
        <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
          <div className="space-y-3">
            <div>
              <p className="eyebrow">Description</p>
              <p className="mt-1 text-sm text-[var(--ink)]">{structure.description}</p>
            </div>
            <div>
              <p className="eyebrow">Meaning</p>
              <p className="mt-1 text-sm font-semibold text-[var(--ink)]">
                "{structure.meaning}"
              </p>
            </div>
            {structure.important ? (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-950">
                {structure.important}
              </p>
            ) : null}
            <div>
              <p className="eyebrow">Example</p>
              <p className="mt-1 text-sm text-[var(--ink)]">"{structure.example}"</p>
            </div>
          </div>
          <div>
            <p className="eyebrow">Best For</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {structure.bestFor.map((item) => (
                <span key={item} className="chip">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <div>
        <p className="eyebrow">Writing Guide</p>
        <ol className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
          {steps.map((step) => (
            <li
              key={step.label}
              className="rounded-2xl border border-[var(--line)] bg-white/60 p-3"
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--brand)]">
                {step.label}:
              </span>
              <span className="mt-1 block text-[var(--ink)]">{step.prompt}</span>
            </li>
          ))}
        </ol>
      </div>
      <p className="text-xs text-[var(--ink-soft)]">{helper}</p>
    </section>
  );
}
