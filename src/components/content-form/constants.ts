import type { Brand, Channel, Format, PostType } from "@/lib/types";

export const PILLAR_BRAND_SLUGS: Record<Brand, readonly string[]> = {
  seb: ["startup-journey", "discipline-lifestyle", "faith-integrity"],
  ublend: ["startup-journey", "b2b-experience", "healthy-eating"],
};

const DEFAULT_CHANNEL_SLUGS: Record<string, readonly string[]> = {
  "founder-lesson": ["seb_linkedin", "seb_instagram", "youtube_shorts"],
  "raw-build-update": ["seb_instagram", "ublend_instagram", "seb_linkedin"],
  "problem-proof-lesson": ["seb_linkedin", "ublend_linkedin"],
  "ublend-experience-demo": ["ublend_instagram", "tiktok", "youtube_shorts"],
  "ingredient-truth": ["ublend_instagram", "ublend_linkedin", "tiktok"],
  "discipline-bridge": ["seb_instagram", "youtube_shorts"],
  "venue-case": ["ublend_linkedin"],
  "founder-reflection": ["seb_linkedin", "seb_instagram"],
};

export const POST_TYPE_OPTIONS = [
  { value: "single-image", label: "Single Image" },
  { value: "carousel", label: "Carousel" },
  { value: "reel", label: "Reel" },
  { value: "story", label: "Story" },
  { value: "short-video", label: "Short Video" },
  { value: "text-post", label: "Text Post" },
  { value: "long-video", label: "Long Video" },
  { value: "document", label: "Document / PDF" },
] satisfies Array<{ value: PostType; label: string }>;

export function formatChannelDefaults(format: Format | undefined, channels: Channel[]) {
  if (!format) return [];

  const preferred = DEFAULT_CHANNEL_SLUGS[format.slug] ?? [];
  return channels
    .filter((channel) => preferred.includes(channel.slug))
    .map((channel) => channel.id);
}
