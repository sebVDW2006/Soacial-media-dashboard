"use client";

import { useMemo, useState } from "react";
import type { Asset, Channel, ContentItem, Format, Pillar } from "@/lib/types";
import { AssetPicker } from "@/components/AssetPicker";
import { ChannelMultiSelect } from "@/components/ChannelMultiSelect";

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
  const [hook, setHook] = useState(item?.hook ?? "");
  const [body, setBody] = useState(item?.body ?? "");
  const [close, setClose] = useState(item?.close ?? "");
  const [selectedChannels, setSelectedChannels] = useState<number[]>(
    linkedChannelIds.length
      ? linkedChannelIds
      : formatChannelDefaults(formatLookup.get(initialFormatId), channels),
  );
  const [selectedAssets, setSelectedAssets] = useState<number[]>(linkedAssetIds);

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
      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <section className="app-card space-y-5 p-5">
          <div>
            <label htmlFor="title">Title</label>
            <input id="title" name="title" defaultValue={item?.title ?? ""} required />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
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
              <select id="pillar_id" name="pillar_id" defaultValue={initialPillarId}>
                {pillars.map((pillar) => (
                  <option key={pillar.id} value={pillar.id}>
                    {pillar.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label>Brand</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {(["seb", "ublend"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setBrand(option)}
                  className={`soft-card min-h-[50px] px-4 py-3 text-left font-semibold ${
                    brand === option ? "border-leaf bg-amber-50" : ""
                  }`}
                >
                  {option === "seb" ? "Seb" : "uBlend"}
                </button>
              ))}
            </div>
            <input type="hidden" name="brand" value={brand} />
          </div>
          <div>
            <label>Channels</label>
            <ChannelMultiSelect
              channels={channels}
              selectedIds={selectedChannels}
              brand={brand}
              onToggle={toggleChannel}
            />
          </div>
          <div>
            <label htmlFor="hook">Hook</label>
            <textarea id="hook" name="hook" value={hook} onChange={(event) => setHook(event.target.value)} />
          </div>
          <div>
            <label htmlFor="body">Body</label>
            <textarea id="body" name="body" value={body} onChange={(event) => setBody(event.target.value)} />
          </div>
          <div>
            <label htmlFor="close">Close</label>
            <textarea id="close" name="close" value={close} onChange={(event) => setClose(event.target.value)} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="target_post_at">Target post at</label>
              <input
                id="target_post_at"
                name="target_post_at"
                type="datetime-local"
                defaultValue={initialTargetPostAt ?? item?.target_post_at?.slice(0, 16) ?? ""}
              />
            </div>
            <div>
              <label htmlFor="notes">Notes</label>
              <textarea id="notes" name="notes" defaultValue={item?.notes ?? ""} className="min-h-[120px]" />
            </div>
          </div>
        </section>
        <section className="app-card space-y-5 p-5">
          <div>
            <h3 className="sub-title">Asset picker</h3>
            <p className="muted mt-2 text-sm">Search by kind, then link proof, capture, and photo assets.</p>
          </div>
          <AssetPicker
            assets={assets}
            selectedAssetIds={selectedAssets}
            onToggle={toggleAsset}
          />
        </section>
      </div>
      <button type="submit" className="primary-button">
        Save content
      </button>
    </form>
  );
}
