import type { Brand, Format, Pillar, PostType } from "@/lib/types";
import { POST_TYPE_OPTIONS } from "@/components/content-form/constants";

type ContentBasicsSectionProps = {
  title: string;
  formatId: number;
  postType: PostType;
  pillarId: number;
  brand: Brand;
  formats: Format[];
  visiblePillars: Pillar[];
  onTitleChange: (value: string) => void;
  onFormatChange: (formatId: number) => void;
  onPostTypeChange: (postType: PostType) => void;
  onPillarChange: (pillarId: number) => void;
  onBrandChange: (brand: Brand) => void;
};

export function ContentBasicsSection({
  title,
  formatId,
  postType,
  pillarId,
  brand,
  formats,
  visiblePillars,
  onTitleChange,
  onFormatChange,
  onPostTypeChange,
  onPillarChange,
  onBrandChange,
}: ContentBasicsSectionProps) {
  return (
    <section className="app-card space-y-6 p-6 sm:p-7">
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="format_id">Style</label>
          <select
            id="format_id"
            name="format_id"
            value={formatId}
            onChange={(event) => onFormatChange(Number(event.target.value))}
          >
            {formats.map((format) => (
              <option key={format.id} value={format.id}>
                {format.name}
              </option>
            ))}
          </select>
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
        </div>
        <div>
          <label htmlFor="pillar_id">Pillar</label>
          <select
            id="pillar_id"
            name="pillar_id"
            value={pillarId}
            onChange={(event) => onPillarChange(Number(event.target.value))}
          >
            {visiblePillars.map((pillar) => (
              <option key={pillar.id} value={pillar.id}>
                {pillar.name}
              </option>
            ))}
          </select>
        </div>
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
      </div>
    </section>
  );
}
