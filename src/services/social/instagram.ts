import type { PostAnalyticsMetrics, SafeSocialAccount } from "@/lib/types";

type InstagramRawMetrics = Partial<{
  impressions: number;
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  followerGrowthFromPost: number;
}>;

export async function connectInstagramAccount() {
  throw new Error(
    "Instagram account connection is reserved for Stage 2. Configure META_APP_ID, META_APP_SECRET, META_REDIRECT_URI and Instagram Graph API permissions first.",
  );
}

export async function refreshInstagramToken() {
  throw new Error("Instagram token refresh is reserved for Stage 3.");
}

export function extractInstagramMediaIdFromUrl(postUrl: string) {
  try {
    const url = new URL(postUrl);
    const host = url.hostname.toLowerCase();

    if (!host.includes("instagram.com")) {
      return null;
    }

    const parts = url.pathname.split("/").filter(Boolean);
    const mediaTypeIndex = parts.findIndex((part) => ["p", "reel", "reels", "tv"].includes(part));
    const shortcode = mediaTypeIndex >= 0 ? parts[mediaTypeIndex + 1] : parts[0];

    return shortcode ? `ig:${shortcode}` : null;
  } catch {
    return null;
  }
}

export async function fetchInstagramPostInsights(
  _account: SafeSocialAccount,
  _externalPostId: string,
) {
  throw new Error("Instagram Graph API media insights are not enabled in Stage 1 mock mode.");
}

export function normaliseInstagramMetrics(raw: InstagramRawMetrics): PostAnalyticsMetrics {
  const metrics = {
    impressions: raw.impressions ?? 0,
    reach: raw.reach ?? 0,
    views: raw.views ?? 0,
    likes: raw.likes ?? 0,
    comments: raw.comments ?? 0,
    shares: raw.shares ?? 0,
    saves: raw.saves ?? 0,
    clicks: raw.clicks ?? 0,
    engagementRate: 0,
    followerGrowthFromPost: raw.followerGrowthFromPost ?? 0,
  };
  const denominator = metrics.reach || metrics.impressions || metrics.views;
  const engagement = metrics.likes + metrics.comments + metrics.shares + metrics.saves + metrics.clicks;

  return {
    ...metrics,
    engagementRate: denominator ? Number(((engagement / denominator) * 100).toFixed(2)) : 0,
  };
}

