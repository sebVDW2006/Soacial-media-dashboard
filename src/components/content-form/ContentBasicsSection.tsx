"use client";

import { useMemo } from "react";
import type { Brand, ContentType, Format, Pillar, PostType } from "@/lib/types";
import { POST_TYPE_OPTIONS } from "@/components/content-form/constants";
import {
  CONTENT_TYPES,
  CONTENT_TYPE_HELPER,
  POST_FRAMEWORK_HELPER,
  POST_FRAMEWORKS,
  SUB_PILLAR_HELPER,
  getPostFramework,
  getSuggestedSubPillarSlugs,
  rankPostFrameworks,
  type SubPillar,
} from "@/lib/taxonomy";
import { ContentTypeBadge } from "@/components/TaxonomyBadges";

type ContentBasicsSectionProps = {
  title: string;
  formatId: number;
  postType: PostType;
  pillarId: number;
  brand: Brand;
  contentType: ContentType | null;
  subPillar: string | null;
  formats: Format[];
  visiblePillars: Pillar[];
  visibleSubPillars: SubPillar[];
  onTitleChange: (value: string) => void;
  onFormatChange: (formatId: number) => void;
  onPostTypeChange: (postType: PostType) => void;
  onBrandChange: (brand: Brand) => void;
  onContentTypeChange: (contentType: ContentType | null) => void;
  onSubPillarChange: (subPillar: string | null) => void;
};

export function ContentBasicsSection({
  title,
  formatId,
  postType,
  pillarId,
  brand,
  contentType,
  subPillar,
  formats,
  visiblePillars,
  visibleSubPillars,
  onTitleChange,
  onFormatChange,
  onPostTypeChange,
  onBrandChange,
  onContentTypeChange,
  onSubPillarChange,
}: ContentBasicsSectionProps) {
  const rankedFrameworkSlugs = useMemo(
    () => rankPostFrameworks(brand, contentType).map((framework) => framework.slug),
    [brand, contentType],
  );
  const rankedFormats = useMemo(() => {
    const lookup = new Map(formats.map((format) => [format.slug, format]));
    const ordered: Format[] = [];
    for (const slug of rankedFrameworkSlugs) {
      const match = lookup.get(slug);
      if (match) ordered.push(match);
    }
    for (const format of formats) {
      if (!rankedFrameworkSlugs.includes(format.slug)) ordered.push(format);
    }
    return ordered;
  }, [formats, rankedFrameworkSlugs]);

  const currentFormat = formats.find((format) => format.id === formatId);
  const currentFramework = currentFormat ? getPostFramework(currentFormat.slug) : null;
  const topFrameworkSlugs = rankedFrameworkSlugs.slice(0, 3);
  const isRecommendedFramework = currentFramework
    ? topFrameworkSlugs.includes(currentFramework.slug)
    : false;

  const suggestedSubPillars = useMemo(
    () => new Set(getSuggestedSubPillarSlugs(brand, contentType)),
    [brand, contentType],
  );

  return (
    <section className="app-card space-y-6 p-6 sm:p-7">
      {/* Row 1 — Title */}
      <div className="space-y-3">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder="What is this post about?"
          required
        />
      </div>

      {/* Row 2 — Brand | Content Type | Sub-Pillar */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div>
          <label>Brand</label>
          <div className="mt-1 flex gap-2">
            {(["seb", "ublend"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onBrandChange(option)}
                className={`flex-1 rounded-full border px-4 py-2.5 text-sm font-semibold ${
                  brand === option
                    ? "border-[var(--brand)] bg-[var(--brand)] text-white"
                    : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--brand)]"
                }`}
              >
                {option === "seb" ? "Seb" : "uBlend"}
              </button>
            ))}
          </div>
          <input type="hidden" name="brand" value={brand} />
        </div>

        <div>
          <label htmlFor="content_type">Content Type</label>
          <select
            id="content_type"
            name="content_type"
            value={contentType ?? ""}
            onChange={(event) => onContentTypeChange((event.target.value || null) as ContentType | null)}
          >
            <option value="">Choose a content type…</option>
            {CONTENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">{CONTENT_TYPE_HELPER}</p>
          {contentType && (
            <div className="mt-3">
              <ContentTypeBadge contentType={contentType} />
            </div>
          )}
        </div>

        <div>
          <label htmlFor="sub_pillar">Sub-Pillar</label>
          <select
            id="sub_pillar"
            name="sub_pillar"
            value={subPillar ?? ""}
            onChange={(event) => onSubPillarChange(event.target.value || null)}
          >
            <option value="">Choose a sub-pillar…</option>
            {suggestedSubPillars.size > 0 && (
              <optgroup label="Suggested for this brand + type">
                {visibleSubPillars
                  .filter((sp) => suggestedSubPillars.has(sp.slug))
                  .map((sp) => (
                    <option key={sp.slug} value={sp.slug}>
                      {sp.name}
                    </option>
                  ))}
              </optgroup>
            )}
            <optgroup label={brand === "seb" ? "All Seb sub-pillars" : "All uBlend sub-pillars"}>
              {visibleSubPillars
                .filter((sp) => !suggestedSubPillars.has(sp.slug))
                .map((sp) => (
                  <option key={sp.slug} value={sp.slug}>
                    {sp.name}
                  </option>
                ))}
            </optgroup>
          </select>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">{SUB_PILLAR_HELPER}</p>
        </div>
      </div>

      {/* Row 3 — Post Framework | Format */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <label htmlFor="format_id">Post Framework</label>
          <select
            id="format_id"
            name="format_id"
            value={formatId}
            onChange={(event) => onFormatChange(Number(event.target.value))}
          >
            {rankedFormats.map((format, index) => {
              const isTopRecommendation = index < 3 && rankedFrameworkSlugs.includes(format.slug);
              return (
                <option key={format.id} value={format.id}>
                  {isTopRecommendation ? `★ ${format.name}` : format.name}
                </option>
              );
            })}
          </select>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">{POST_FRAMEWORK_HELPER}</p>
          {currentFramework && (
            <p className="mt-1 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--ink-soft)]">
              {isRecommendedFramework ? "Recommended for this brand + type" : "Allowed but not the top match"}
              {currentFramework.question ? ` · ${currentFramework.question}` : ""}
            </p>
          )}
          {topFrameworkSlugs.length > 0 && contentType && (
            <p className="mt-1 text-[0.7rem] text-[var(--ink-soft)]">
              Top picks:{" "}
              {topFrameworkSlugs
                .map((slug) => POST_FRAMEWORKS.find((f) => f.slug === slug)?.name)
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="post_type">Format</label>
          <select
            id="post_type"
            name="post_type"
            value={postType}
            onChange={(event) => onPostTypeChange(event.target.value as PostType)}
          >
            {POST_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-[var(--ink-soft)]">
            How will this show up in feed?
          </p>
        </div>
      </div>

      {/* Hidden pillar field — derived from brand for legacy back-compat */}
      <input
        type="hidden"
        name="pillar_id"
        value={
          visiblePillars.some((p) => p.id === pillarId)
            ? pillarId
            : visiblePillars[0]?.id ?? pillarId
        }
      />
    </section>
  );
}
