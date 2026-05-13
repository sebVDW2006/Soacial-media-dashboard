import { getDb, touchContentStatus } from "@/lib/db";
import type { PostAnalyticsMetrics, SocialPlatform } from "@/lib/types";
import { extractInstagramMediaIdFromUrl } from "@/services/social/instagram";
import { extractLinkedInPostUrnFromUrl } from "@/services/social/linkedin";

type SyncResult = {
  ok: boolean;
  message: string;
  postAnalyticsId: number;
};

function numberFromSeed(seed: string) {
  return seed.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
}

function normaliseMetricNumber(value: unknown) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function buildMockMetrics(seed: string, platform: SocialPlatform): PostAnalyticsMetrics {
  const base = numberFromSeed(seed);
  const platformLift = platform === "instagram" ? 1.18 : 0.94;
  const impressions = Math.round((900 + (base % 5200)) * platformLift);
  const reach = Math.round(impressions * (0.58 + ((base % 18) / 100)));
  const views = platform === "instagram" ? Math.round(impressions * 0.72) : Math.round(impressions * 0.38);
  const likes = Math.round(reach * (0.025 + ((base % 12) / 1000)));
  const comments = Math.max(1, Math.round(likes * (0.08 + ((base % 5) / 100))));
  const shares = Math.max(0, Math.round(likes * (0.05 + ((base % 7) / 100))));
  const saves = platform === "instagram" ? Math.max(0, Math.round(likes * 0.16)) : 0;
  const clicks = platform === "linkedin" ? Math.max(0, Math.round(reach * 0.012)) : Math.max(0, Math.round(reach * 0.004));

  return {
    impressions,
    reach,
    views,
    likes,
    comments,
    shares,
    saves,
    clicks,
    engagementRate: calculateEngagementRate({ impressions, reach, views, likes, comments, shares, saves, clicks }),
    followerGrowthFromPost: Math.max(0, Math.round((base % 9) * platformLift)),
  };
}

async function updatePostAnalyticsStatus(id: number, status: string, message: string) {
  const db = await getDb();
  await db.execute({
    sql: `UPDATE post_analytics
      SET status = ?, error_message = ?, updated_at = datetime('now')
      WHERE id = ?`,
    args: [status, message, id],
  });
}

function extractExternalPostId(platform: SocialPlatform, postUrl: string) {
  return platform === "instagram"
    ? extractInstagramMediaIdFromUrl(postUrl)
    : extractLinkedInPostUrnFromUrl(postUrl);
}

export function calculateEngagementRate(
  metrics: Pick<PostAnalyticsMetrics, "impressions" | "reach" | "views" | "likes" | "comments" | "shares" | "saves" | "clicks">,
) {
  const denominator = metrics.reach || metrics.impressions || metrics.views;
  const engagement = metrics.likes + metrics.comments + metrics.shares + metrics.saves + metrics.clicks;

  return denominator ? Number(((engagement / denominator) * 100).toFixed(2)) : 0;
}

export function shouldSyncPost(postedAt: string | null, lastSyncedAt: string | null, now = new Date()) {
  if (!postedAt) return false;

  const posted = new Date(postedAt);
  if (Number.isNaN(posted.getTime())) return false;

  const hoursSincePost = (now.getTime() - posted.getTime()) / 36e5;
  if (hoursSincePost > 24 * 30) return false;

  if (!lastSyncedAt) return true;

  const lastSynced = new Date(lastSyncedAt);
  if (Number.isNaN(lastSynced.getTime())) return true;

  const hoursSinceSync = (now.getTime() - lastSynced.getTime()) / 36e5;

  if (hoursSincePost <= 72) {
    return hoursSinceSync >= 6;
  }

  return hoursSinceSync >= 24;
}

export async function syncPostAnalytics(postAnalyticsId: number): Promise<SyncResult> {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT
        pa.*,
        cc.content_item_id,
        cc.posted_at,
        ci.title,
        sa.connection_status,
        sa.account_type,
        sa.display_name AS account_display_name
      FROM post_analytics pa
      INNER JOIN content_channels cc ON cc.id = pa.post_id
      INNER JOIN content_items ci ON ci.id = cc.content_item_id
      LEFT JOIN social_accounts sa ON sa.id = pa.social_account_id
      WHERE pa.id = ?`,
    args: [postAnalyticsId],
  });
  const row = result.rows[0];

  if (!row) {
    throw new Error("Post analytics record was not found.");
  }

  const accountStatus = row.connection_status ? String(row.connection_status) : null;
  const accountType = row.account_type ? String(row.account_type) : null;
  const platform = String(row.platform) as SocialPlatform;
  const postUrl = String(row.post_url ?? "");
  const externalPostId = String(row.external_post_id ?? "") || extractExternalPostId(platform, postUrl);

  if (!row.social_account_id || !accountStatus) {
    const message = "Analytics cannot sync yet. Connect the account or add KPIs manually.";
    await updatePostAnalyticsStatus(postAnalyticsId, "not_connected", message);
    return { ok: false, message, postAnalyticsId };
  }

  if (accountStatus === "expired") {
    const message = "Account token expired — reconnect account";
    await updatePostAnalyticsStatus(postAnalyticsId, "failed", message);
    return { ok: false, message, postAnalyticsId };
  }

  if (accountStatus === "manual_only" || accountType === "linkedin_member") {
    const message = "LinkedIn personal profile analytics are not available with current API access";
    await updatePostAnalyticsStatus(postAnalyticsId, "manual", message);
    return { ok: false, message, postAnalyticsId };
  }

  if (accountStatus !== "connected") {
    const message = "Analytics cannot sync yet. Connect the account or add KPIs manually.";
    await updatePostAnalyticsStatus(postAnalyticsId, "failed", message);
    return { ok: false, message, postAnalyticsId };
  }

  if (!externalPostId) {
    const message = "Post URL could not be matched to a platform post ID";
    await updatePostAnalyticsStatus(postAnalyticsId, "failed", message);
    return { ok: false, message, postAnalyticsId };
  }

  await updatePostAnalyticsStatus(postAnalyticsId, "syncing", "Syncing analytics");

  const metrics = buildMockMetrics(`${row.title}:${externalPostId}:${postAnalyticsId}`, platform);

  await db.execute({
    sql: `UPDATE post_analytics
      SET external_post_id = ?,
          status = 'synced',
          last_synced_at = datetime('now'),
          error_message = 'Analytics synced successfully',
          impressions = ?,
          reach = ?,
          views = ?,
          likes = ?,
          comments = ?,
          shares = ?,
          saves = ?,
          clicks = ?,
          engagement_rate = ?,
          follower_growth_from_post = ?,
          updated_at = datetime('now')
      WHERE id = ?`,
    args: [
      externalPostId,
      metrics.impressions,
      metrics.reach,
      metrics.views,
      metrics.likes,
      metrics.comments,
      metrics.shares,
      metrics.saves,
      metrics.clicks,
      metrics.engagementRate,
      metrics.followerGrowthFromPost,
      postAnalyticsId,
    ],
  });

  await db.execute({
    sql: `UPDATE social_accounts
      SET last_synced_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?`,
    args: [Number(row.social_account_id)],
  });

  await db.execute({
    sql: `INSERT INTO kpi_snapshots
      (content_channel_id, impressions, reach, views, likes, comments, shares, saves, link_clicks, follows, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      Number(row.post_id),
      metrics.impressions,
      metrics.reach,
      metrics.views,
      metrics.likes,
      metrics.comments,
      metrics.shares,
      metrics.saves,
      metrics.clicks,
      metrics.followerGrowthFromPost,
      "Auto-synced from Stage 1 mock analytics.",
    ],
  });

  await touchContentStatus(Number(row.content_item_id));

  return {
    ok: true,
    message: "Analytics synced successfully",
    postAnalyticsId,
  };
}

export async function syncAllDueAnalytics() {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT pa.id, cc.posted_at, pa.last_synced_at
      FROM post_analytics pa
      INNER JOIN content_channels cc ON cc.id = pa.post_id
      INNER JOIN social_accounts sa ON sa.id = pa.social_account_id
      WHERE pa.status IN ('connected', 'synced', 'failed')
        AND sa.connection_status = 'connected'`,
    args: [],
  });
  const dueRows = result.rows.filter((row) =>
    shouldSyncPost(
      row.posted_at ? String(row.posted_at) : null,
      row.last_synced_at ? String(row.last_synced_at) : null,
    ),
  );
  const outcomes: SyncResult[] = [];

  for (const row of dueRows) {
    outcomes.push(await syncPostAnalytics(normaliseMetricNumber(row.id)));
  }

  return outcomes;
}

