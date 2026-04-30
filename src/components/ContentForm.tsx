"use client";

import { useMemo, useState } from "react";
import type { Asset, Channel, ContentItem, Format, Pillar, PostType } from "@/lib/types";
import { ChannelMultiSelect } from "@/components/ChannelMultiSelect";

// Which pillar slugs are relevant per brand
const PILLAR_BRAND_SLUGS: Record<"seb" | "ublend", string[]> = {
  seb: ["startup-journey", "discipline-lifestyle", "faith-integrity"],
  ublend: ["startup-journey", "b2b-experience", "healthy-eating"],
};

const defaultChannelMap: Record<string, string[]> = {
  "founder-lesson": ["seb_linkedin", "seb_instagram", "youtube_shorts"],
  "raw-build-update": ["seb_instagram", "ublend_instagram", "seb_linkedin"],
  "problem-proof-lesson": ["seb_linkedin", "ublend_linkedin"],
  "ublend-experience-demo": ["ublend_instagram", "tiktok", "youtube_shorts"],
  "ingredient-truth": ["ublend_instagram", "ublend_linkedin", "tiktok"],
  "discipline-bridge": ["seb_instagram", "youtube_shorts"],
  "venue-case": ["ublend_linkedin"],
  "founder-reflection": ["seb_linkedin", "seb_instagram"],
};

function formatChannelDefaults(format: Format | undefined, channels: Channel[]) {
  if (!format) return [];
  const preferred = defaultChannelMap[format.slug] ?? [];
  return channels.filter((channel) => preferred.includes(channel.slug)).map((channel) => channel.id);
}

const POST_TYPE_OPTIONS: { value: PostType; label: string }[] = [
  { value: "single-image", label: "Single Image" },
  { value: "carousel", label: "Carousel" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
  { value: "short-video", label: "Short Video" },
  { value: "text-post", label: "Text Post" },
  { value: "long-video", label: "Long Video" },
  { value: "document", label: "Document / PDF" },
];

export function ContentForm({
  action,
  item,
  linkedChannelIds,
  linkedAssetIds,
  formats,
  pillars,
  channels,
  assets,
  initialBrand,
  initialFormatId,
  initialPillarId,
  initialChannelIds,
  initialPostType,
  initialTargetPostAt,
}: {
  action: (formData: FormData) => Promise<void>;
  item?: ContentItem | null;
  linkedChannelIds: number[];
  linkedAssetIds: number[];
  formats: Format[];
  pillars: Pillar[];
  channels: Channel[];
  assets: Asset[];
  initialBrand?: "seb" | "ublend";
  initialFormatId?: number;
  initialPillarId?: number;
  initialChannelIds?: number[];
  initialPostType?: PostType;
  initialTargetPostAt?: string | null;
}) {
  const activeFormatId = item?.format_id ?? initialFormatId ?? formats[0]?.id ?? 1;
  const activePillarId = item?.pillar_id ?? initialPillarId ?? pillars[0]?.id ?? 1;
  const formatLookup = useMemo(
    () => new Map(formats.map((format) => [format.id, format])),
    [formats],
  );

  const initialActiveBrand: "seb" | "ublend" = item?.brand ?? initialBrand ?? "seb";

  const [formatId, setFormatId] = useState(activeFormatId);
  const [postType, setPostType] = useState<PostType>(item?.post_type ?? initialPostType ?? "single-image");
  const [brand, setBrand] = useState<"seb" | "ublend">(initialActiveBrand);
  const [pillarId, setPillarId] = useState(activePillarId);
  const [hook, setHook] = useState(item?.hook ?? "");
  const [body, setBody] = useState(item?.body ?? "");
  const [close, setClose] = useState(item?.close ?? "");
  const [selectedChannels, setSelectedChannels] = useState<number[]>(() => {
    if (linkedChannelIds.length) {
      // Filter out any channels that don't match the piece's brand — guards against the old cross-brand bug
      return linkedChannelIds.filter((id) => {
        const ch = channels.find((c) => c.id === id);
        return ch?.brand === initialActiveBrand;
      });
    }
    if (initialChannelIds?.length) {
      return initialChannelIds.filter((id) => {
        const ch = channels.find((channel) => channel.id === id);
        return ch?.brand === initialActiveBrand;
      });
    }
    return formatChannelDefaults(formatLookup.get(activeFormatId), channels);
  });
  // Only show pillars that belong to the selected brand
  const visiblePillars = useMemo(
    () => pillars.filter((p) => PILLAR_BRAND_SLUGS[brand].includes(p.slug)),
    [pillars, brand],
  );

  const selectedChannelObjects = channels.filter((channel) => selectedChannels.includes(channel.id));

  const applyFormat = (nextFormatId: number) => {
    const nextFormat = formatLookup.get(nextFormatId);
    setFormatId(nextFormatId);

    if (nextFormat) {
      if (!hook.trim()) setHook(nextFormat.hook_template ?? "");
      if (!body.trim()) setBody(nextFormat.body_template ?? "");
      if (!close.trim()) setClose(nextFormat.close_template ?? "");

      if (!selectedChannels.length) {
        setSelectedChannels(formatChannelDefaults(nextFormat, channels));
      }
    }
  };

  const handleBrandChange = (nextBrand: "seb" | "ublend") => {
    setBrand(nextBrand);
    // Drop any selected channels that don't belong to the new brand
    setSelectedChannels((prev) =>
      prev.filter((id) => channels.find((ch) => ch.id === id && ch.brand === nextBrand)),
    );
    // If the currently selected pillar isn't valid for the new brand, pick the first valid one
    const validSlugs = PILLAR_BRAND_SLUGS[nextBrand];
    const currentPillar = pillars.find((p) => p.id === pillarId);
    if (!currentPillar || !validSlugs.includes(currentPillar.slug)) {
      const firstValid = pillars.find((p) => validSlugs.includes(p.slug));
      if (firstValid) setPillarId(firstValid.id);
    }
  };

  const toggleChannel = (channelId: number) => {
    setSelectedChannels((current) =>
      current.includes(channelId)
        ? current.filter((id) => id !== channelId)
        : [...current, channelId],
    );
  };

  return (
    <form action={action} className="space-y-6">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}

      <section className="app-card space-y-6 p-6 sm:p-7">
        <div className="space-y-3">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            name="title"
            defaultValue={item?.title ?? ""}
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
              onChange={(e) => applyFormat(Number(e.target.value))}
            >
              {formats.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="post_type">Format</label>
            <select
              id="post_type"
              name="post_type"
              value={postType}
              onChange={(e) => setPostType(e.target.value as PostType)}
            >
              {POST_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="pillar_id">Pillar</label>
            <select
              id="pillar_id"
              name="pillar_id"
              value={pillarId}
              onChange={(e) => setPillarId(Number(e.target.value))}
            >
              {visiblePillars.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Brand</label>
            <div className="flex gap-2 mt-1">
              {(["seb", "ublend"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleBrandChange(option)}
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
            <label htmlFor="target_post_at">Target date</label>
            <input
              id="target_post_at"
              name="target_post_at"
              type="datetime-local"
              defaultValue={initialTargetPostAt ?? item?.target_post_at?.slice(0, 16) ?? ""}
            />
          </div>
        </div>

        <div>
          <label>Channels</label>
          <ChannelMultiSelect
            channels={channels}
            selectedIds={selectedChannels}
            brand={brand}
            onToggle={toggleChannel}
          />
          {selectedChannelObjects.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedChannelObjects.map((ch) => (
                <span key={ch.id} className="chip">{ch.name}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="app-card space-y-5 p-6 sm:p-7">
        <h2 className="sub-title">Write the post</h2>
        <div>
          <label htmlFor="hook">Hook</label>
          <textarea
            id="hook"
            name="hook"
            value={hook}
            onChange={(e) => setHook(e.target.value)}
            className="min-h-[120px]"
            placeholder="Opening line that stops the scroll"
          />
        </div>
        <div>
          <label htmlFor="body">Body</label>
          <textarea
            id="body"
            name="body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-[240px]"
            placeholder="The substance of the post"
          />
        </div>
        <div>
          <label htmlFor="close">Close</label>
          <textarea
            id="close"
            name="close"
            value={close}
            onChange={(e) => setClose(e.target.value)}
            className="min-h-[120px]"
            placeholder="Call to action or final thought"
          />
        </div>
        <div>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            name="notes"
            defaultValue={item?.notes ?? ""}
            className="min-h-[80px]"
            placeholder="Angle, audience, proof point, or edit note..."
          />
        </div>
        <button type="submit" className="primary-button">
          Save content
        </button>
      </section>
    </form>
  );
}
