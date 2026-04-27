"use client";

import { useMemo, useState } from "react";
import type { Asset } from "@/lib/types";

export function AssetPicker({
  assets,
  selectedAssetIds,
  onToggle,
}: {
  assets: Asset[];
  selectedAssetIds: number[];
  onToggle: (assetId: number) => void;
}) {
  const [kind, setKind] = useState("all");
  const filtered = useMemo(() => {
    if (kind === "all") {
      return assets;
    }

    return assets.filter((asset) => asset.kind === kind);
  }, [assets, kind]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="asset-kind">Filter assets</label>
          <select id="asset-kind" value={kind} onChange={(event) => setKind(event.target.value)}>
            <option value="all">All kinds</option>
            <option value="founder_clip">Founder clip</option>
            <option value="product_clip">Product clip</option>
            <option value="lifestyle_clip">Lifestyle clip</option>
            <option value="proof_clip">Proof clip</option>
            <option value="photo">Photo</option>
            <option value="branding">Branding</option>
          </select>
        </div>
        <p className="muted text-sm">Tap to attach one asset to as many posts as you want.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((asset) => {
          const selected = selectedAssetIds.includes(asset.id);
          const isImage = asset.url ? /\.(png|jpe?g|gif|webp|avif)$/i.test(asset.url) : false;

          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onToggle(asset.id)}
              className={`soft-card overflow-hidden text-left ${selected ? "border-leaf bg-amber-50" : ""}`}
            >
              {asset.url && isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={asset.url}
                  alt={asset.title}
                  className="h-32 w-full object-cover"
                />
              ) : (
                <div className="flex h-32 items-center justify-center bg-stone-100 text-sm font-semibold text-stone-500">
                  {asset.kind.replaceAll("_", " ")}
                </div>
              )}
              <div className="space-y-2 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-semibold">{asset.title}</p>
                  <span className="chip">{selected ? "Attached" : "Attach"}</span>
                </div>
                <p className="text-sm text-stone-500">{asset.captured_on ?? "No date yet"}</p>
              </div>
            </button>
          );
        })}
        {!filtered.length ? <p className="muted text-sm">No assets match that filter yet.</p> : null}
      </div>
      {selectedAssetIds.map((assetId) => (
        <input key={assetId} type="hidden" name="asset_ids" value={assetId} />
      ))}
    </div>
  );
}

