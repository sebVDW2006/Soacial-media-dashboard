"use client";

import { useMemo, useState } from "react";
import type { Asset, Channel, ContentItem, Format, Pillar } from "@/lib/types";
import { AssetPicker } from "@/components/AssetPicker";
import { ChannelMultiSelect } from "@/components/ChannelMultiSelect";
import { blueprintBySlug, weeklyFlow } from "@/lib/content-framework";
import { formatArtworkBySlug } from "@/lib/inspiration";

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
  initialTargetPostAt?: string | null;
}) {
  const initialFormatId = item?.format_id ?? formats[0]?.id ?? 1;
  const initialPillarId = item?.pillar_id ?? pillars[0]?.id ?? 1;
  const formatLookup = useMemo(
    () => new Map(formats.map((format) => [format.id, format])),
    [formats],
  );

  const [formatId, setFormatId] = useState(initialFormatId);
  const [brand, setBrand] = useState<"seb" | "ublend">(item?.brand ?? initialBrand ?? "seb");
  const [pillarId, setPillarId] = useState(initialPillarId);
  const [hook, setHook] = useState(item?.hook ?? "");
  const [body, setBody] = useState(item?.body ?? "");
  const [close, setClose] = useState(item?.close ?? "");
  const [selectedChannels, setSelectedChannels] = useState<number[]>(
    linkedChannelIds.length
      ? linkedChannelIds
      : formatChannelDefaults(formatLookup.get(initialFormatId), channels),
  );
  const [selectedAssets, setSelectedAssets] = useState<number[]>(linkedAssetIds);
  // Only show pillars that belong to the selected brand
  const visiblePillars = useMemo(
    () => pillars.filter((p) => PILLAR_BRAND_SLUGS[brand].includes(p.slug)),
    [pillars, brand],
  );

  const selectedFormat = formatLookup.get(formatId);
  const selectedBlueprint = selectedFormat ? blueprintBySlug[selectedFormat.slug] : undefined;
  const selectedArtwork = selectedFormat ? formatArtworkBySlug[selectedFormat.slug] : undefined;
  const selectedChannelObjects = channels.filter((channel) => selectedChannels.includes(channel.id));
  const selectedAssetObjects = assets.filter((asset) => selectedAssets.includes(asset.id));

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

  const toggleAsset = (assetId: number) => {
    setSelectedAssets((current) =>
      current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId],
    );
  };

  return (
    <form action={action} className="space-y-6">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <section className="app-card space-y-6 p-6 sm:p-7">
            <div className="flex flex-wrap gap-2">
              <span className="chip active">{item?.id ? "Draft workspace" : "New draft"}</span>
              {selectedBlueprint ? <span className="chip">{selectedBlueprint.weeklySlot}</span> : null}
            </div>

            <div className="space-y-3">
              <label htmlFor="title">Working title</label>
              <input
                id="title"
                name="title"
                defaultValue={item?.title ?? ""}
                placeholder="What is this post really about?"
                required
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <div>
                <label htmlFor="format_id">Format</label>
                <select
                  id="format_id"
                  name="format_id"
                  value={formatId}
                  onChange={(event) => applyFormat(Number(event.target.value))}
                >
                  {formats.map((format) => (
                    <option key={format.id} value={format.id}>
                      {format.name}
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
                  onChange={(e) => setPillarId(Number(e.target.value))}
                >
                  {visiblePillars.map((pillar) => (
                    <option key={pillar.id} value={pillar.id}>
                      {pillar.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="target_post_at">Target post at</label>
                <input
                  id="target_post_at"
                  name="target_post_at"
                  type="datetime-local"
                  defaultValue={initialTargetPostAt ?? item?.target_post_at?.slice(0, 16) ?? ""}
                />
              </div>
            </div>

            <div>
              <label>Brand</label>
              <div className="grid gap-3 sm:grid-cols-2">
                {(["seb", "ublend"] as const).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleBrandChange(option)}
                    className={`soft-card min-h-[56px] px-4 py-3 text-left ${
                      brand === option ? "border-[var(--brand)] bg-white/95" : ""
                    }`}
                  >
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      Brand
                    </div>
                    <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--brand)]">
                      {option === "seb" ? "Seb" : "uBlend"}
                    </div>
                  </button>
                ))}
              </div>
              <input type="hidden" name="brand" value={brand} />
            </div>

            <div>
              <label>Distribution channels</label>
              <ChannelMultiSelect
                channels={channels}
                selectedIds={selectedChannels}
                brand={brand}
                onToggle={toggleChannel}
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {selectedChannelObjects.map((channel) => (
                  <span key={channel.id} className="chip">
                    {channel.name}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="app-card space-y-5 p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="eyebrow">Writing space</div>
                <h3 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
                  Draft the post with room to think
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--ink-soft)]">
                  Keep the structure visible, then write cleanly. The chosen format only fills empty fields so your
                  edits stay yours.
                </p>
              </div>
              {selectedBlueprint ? <span className="chip">{selectedBlueprint.purpose}</span> : null}
            </div>

            <div className="grid gap-5">
              <div>
                <label htmlFor="hook">Hook</label>
                <textarea
                  id="hook"
                  name="hook"
                  value={hook}
                  onChange={(event) => setHook(event.target.value)}
                  className="min-h-[140px]"
                />
              </div>
              <div>
                <label htmlFor="body">Body</label>
                <textarea
                  id="body"
                  name="body"
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  className="min-h-[280px]"
                />
              </div>
              <div>
                <label htmlFor="close">Close</label>
                <textarea
                  id="close"
                  name="close"
                  value={close}
                  onChange={(event) => setClose(event.target.value)}
                  className="min-h-[140px]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                defaultValue={item?.notes ?? ""}
                className="min-h-[160px]"
                placeholder="Angle, audience, proof point, or edit note..."
              />
            </div>

            <button type="submit" className="primary-button">
              Save content
            </button>
          </section>
        </div>

        <div className="space-y-6">
          {selectedBlueprint ? (
            <section className="app-card space-y-5 p-6">
              <div className="eyebrow">Format blueprint</div>
              <div>
                <h3 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
                  {selectedBlueprint.name}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                  {selectedBlueprint.purpose}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="soft-card p-4">
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Best for
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[var(--ink)]">
                    {selectedBlueprint.bestFor.join(" • ")}
                  </div>
                </div>
                <div className="soft-card p-4">
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Format / effort
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[var(--ink)]">
                    {selectedBlueprint.format} • {selectedBlueprint.time} • {selectedBlueprint.effort}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="soft-card p-4">
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Voice
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[var(--ink)]">{selectedBlueprint.voice}</div>
                </div>
                <div className="soft-card p-4">
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Proof to include
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[var(--ink)]">{selectedBlueprint.proofPrompt}</div>
                </div>
                <div className="soft-card p-4 studio-accent-card">
                  <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                    Creative cue
                  </div>
                  <div className="mt-2 text-sm leading-7 text-[var(--ink)]">{selectedBlueprint.creativeCue}</div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--line)] bg-white/55 p-5">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Structure
                </div>
                <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--ink)]">
                  <div>
                    <div className="font-semibold text-[var(--brand)]">Hook</div>
                    <div>{selectedBlueprint.structure.hook}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--brand)]">Body</div>
                    <div>{selectedBlueprint.structure.body}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-[var(--brand)]">Close</div>
                    <div>{selectedBlueprint.structure.close}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-[24px] border border-[var(--line)] bg-white/55 p-5">
                <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Capture sources
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedBlueprint.captureSources.map((source) => (
                    <span key={source} className="chip">
                      {source}
                    </span>
                  ))}
                </div>
                <div className="mt-5 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                  Example angles
                </div>
                <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--ink-soft)]">
                  {selectedBlueprint.examples.map((example) => (
                    <div key={example} className="rounded-[20px] border border-[var(--line)] bg-white/55 px-4 py-3">
                      {example}
                    </div>
                  ))}
                </div>
              </div>

              {selectedArtwork ? (
                <div className="soft-card overflow-hidden">
                  <div
                    className="aspect-[5/4] bg-cover bg-center"
                    style={{ backgroundImage: `url(${selectedArtwork.src})` }}
                  />
                </div>
              ) : null}
            </section>
          ) : null}

          <section className="app-card space-y-5 p-6">
            <div className="eyebrow">Attached assets</div>
            <div>
              <h3 className="text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
                Draft from one calm asset space
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">
                Link the clips and photos you actually need for this post. One asset can support multiple drafts.
              </p>
            </div>

            {selectedAssetObjects.length ? (
              <div className="space-y-3">
                {selectedAssetObjects.map((asset) => (
                  <div key={asset.id} className="soft-card flex items-center justify-between gap-3 px-4 py-3">
                    <div>
                      <div className="font-semibold text-[var(--brand)]">{asset.title}</div>
                      <div className="text-sm text-[var(--ink-soft)]">
                        {asset.captured_on ?? "No capture date"} • {asset.kind.replaceAll("_", " ")}
                      </div>
                    </div>
                    <span className="chip">Attached</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[22px] border border-dashed border-[var(--line)] bg-white/35 p-4 text-sm leading-7 text-[var(--ink-soft)]">
                No assets linked yet. Pick only the clips or photos that actually help you write this post clearly.
              </div>
            )}

            <AssetPicker
              assets={assets}
              selectedAssetIds={selectedAssets}
              onToggle={toggleAsset}
            />
          </section>

          <section className="app-card p-6">
            <div className="eyebrow">Weekly operating system</div>
            <h3 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
              Where this draft fits
            </h3>
            <div className="mt-5 space-y-3">
              {weeklyFlow.map((item) => (
                <div key={item.day} className="rounded-[22px] border border-[var(--line)] bg-white/55 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                        {item.day}
                      </div>
                      <div className="mt-1 font-semibold tracking-[-0.02em] text-[var(--brand)]">
                        {item.title}
                      </div>
                    </div>
                    <span className="chip">{item.output}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
