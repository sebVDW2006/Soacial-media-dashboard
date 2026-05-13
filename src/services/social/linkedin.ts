import type { PostAnalyticsMetrics, SafeSocialAccount } from "@/lib/types";

type LinkedInRawMetrics = Partial<{
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

export async function connectLinkedInAccount() {
  throw new Error(
    "LinkedIn account connection is reserved for Stage 2. Configure LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_REDIRECT_URI and approved Marketing API access first.",
  );
}

export async function refreshLinkedInToken() {
  throw new Error("LinkedIn token refresh is reserved for Stage 3.");
}

export function extractLinkedInPostUrnFromUrl(postUrl: string) {
  try {
    const url = new URL(postUrl);
    const host = url.hostname.toLowerCase();

    if (!host.includes("linkedin.com")) {
      return null;
    }

    const encodedUrn = url.searchParams.get("updateUrn") ?? url.searchParams.get("activity");
    if (encodedUrn) {
      return decodeURIComponent(encodedUrn);
    }

    const activityMatch = url.pathname.match(/activity-(\d+)/);
    if (activityMatch?.[1]) {
      return `urn:li:activity:${activityMatch[1]}`;
    }

    const shareMatch = url.pathname.match(/shares\/([^/?]+)/);
    if (shareMatch?.[1]) {
      return `urn:li:share:${shareMatch[1]}`;
    }

    return null;
  } catch {
    return null;
  }
}

export async function fetchLinkedInOrganizationPostStats(
  _account: SafeSocialAccount,
  _externalPostId: string,
) {
  throw new Error("LinkedIn Organization Share Statistics are not enabled in Stage 1 mock mode.");
}

export async function fetchLinkedInMemberPostStats() {
  throw new Error("LinkedIn personal profile analytics are not available with current API access.");
}

export function normaliseLinkedInMetrics(raw: LinkedInRawMetrics): PostAnalyticsMetrics {
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

