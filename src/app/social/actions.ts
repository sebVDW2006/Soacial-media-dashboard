"use server";

import { revalidatePath } from "next/cache";
import { getDb, parseNullableInteger, parseText } from "@/lib/db";
import {
  getSocialAccountSlot,
  inferPlatformFromChannel,
  platformLabel,
} from "@/lib/social";
import type { Brand, SocialPlatform } from "@/lib/types";
import { extractInstagramMediaIdFromUrl } from "@/services/social/instagram";
import { extractLinkedInPostUrnFromUrl } from "@/services/social/linkedin";
import { syncPostAnalytics } from "@/services/social/sync";

const SOCIAL_REVALIDATE_PATHS = ["/", "/analytics-sync", "/pipeline", "/kpis"] as const;

function revalidateSocialPaths(contentItemId?: number | null) {
  for (const path of SOCIAL_REVALIDATE_PATHS) {
    revalidatePath(path);
  }

  if (contentItemId) {
    revalidatePath(`/content/${contentItemId}`);
  }
}

function parseBrand(value: FormDataEntryValue | null): Brand {
  const brand = parseText(value);

  if (brand !== "seb" && brand !== "ublend") {
    throw new Error("Select a valid brand.");
  }

  return brand;
}

function parsePlatform(value: FormDataEntryValue | null): SocialPlatform {
  const platform = parseText(value);

  if (platform !== "instagram" && platform !== "linkedin") {
    throw new Error("Select Instagram or LinkedIn.");
  }

  return platform;
}

function extractExternalPostId(platform: SocialPlatform, postUrl: string) {
  return platform === "instagram"
    ? extractInstagramMediaIdFromUrl(postUrl)
    : extractLinkedInPostUrnFromUrl(postUrl);
}

async function getContentChannelContext(contentChannelId: number) {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT
        cc.id,
        cc.content_item_id,
        cc.posted_url,
        ch.slug AS channel_slug,
        ch.name AS channel_name,
        ci.brand
      FROM content_channels cc
      INNER JOIN channels ch ON ch.id = cc.channel_id
      INNER JOIN content_items ci ON ci.id = cc.content_item_id
      WHERE cc.id = ?`,
    args: [contentChannelId],
  });

  return result.rows[0] ?? null;
}

async function upsertPostAnalyticsLink(formData: FormData) {
  const contentChannelId = parseNullableInteger(formData.get("content_channel_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));
  const brand = parseBrand(formData.get("brand"));
  const platform = parsePlatform(formData.get("platform"));
  const socialAccountId = parseNullableInteger(formData.get("social_account_id"));
  const postUrl = parseText(formData.get("post_url")) ?? parseText(formData.get("posted_url"));

  if (!contentChannelId || !contentItemId) {
    throw new Error("Post context is required.");
  }

  if (!postUrl) {
    throw new Error("Paste a post URL before saving analytics.");
  }

  const db = await getDb();
  const accountResult = socialAccountId
    ? await db.execute({
        sql: `SELECT id, connection_status, account_type
          FROM social_accounts
          WHERE id = ? AND brand = ? AND platform = ?`,
        args: [socialAccountId, brand, platform],
      })
    : null;
  const account = accountResult?.rows[0] ?? null;
  const externalPostId = extractExternalPostId(platform, postUrl);
  let status = "not_connected";
  let errorMessage = "Analytics cannot sync yet. Connect the account or add KPIs manually.";

  if (account) {
    const connectionStatus = String(account.connection_status ?? "");
    const accountType = String(account.account_type ?? "");

    if (connectionStatus === "manual_only" || accountType === "linkedin_member") {
      status = "manual";
      errorMessage = "LinkedIn personal profile analytics are not available with current API access";
    } else if (connectionStatus === "expired") {
      status = "failed";
      errorMessage = "Account token expired — reconnect account";
    } else if (connectionStatus === "connected") {
      status = "connected";
      errorMessage = externalPostId
        ? "Post link saved. Ready to sync."
        : "Post URL could not be matched to a platform post ID";
    } else {
      status = "failed";
      errorMessage = "Analytics cannot sync yet. Connect the account or add KPIs manually.";
    }
  }

  await db.execute({
    sql: "UPDATE content_channels SET posted_url = ? WHERE id = ?",
    args: [postUrl, contentChannelId],
  });

  const existing = await db.execute({
    sql: "SELECT id FROM post_analytics WHERE post_id = ?",
    args: [contentChannelId],
  });
  const existingId = existing.rows[0]?.id ? Number(existing.rows[0].id) : null;

  if (existingId) {
    await db.execute({
      sql: `UPDATE post_analytics
        SET social_account_id = ?,
            platform = ?,
            brand = ?,
            post_url = ?,
            external_post_id = ?,
            status = ?,
            error_message = ?,
            updated_at = datetime('now')
        WHERE id = ?`,
      args: [
        socialAccountId,
        platform,
        brand,
        postUrl,
        externalPostId,
        status,
        errorMessage,
        existingId,
      ],
    });

    return { postAnalyticsId: existingId, contentItemId };
  }

  const inserted = await db.execute({
    sql: `INSERT INTO post_analytics
      (post_id, social_account_id, platform, brand, post_url, external_post_id, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      contentChannelId,
      socialAccountId,
      platform,
      brand,
      postUrl,
      externalPostId,
      status,
      errorMessage,
    ],
  });

  return { postAnalyticsId: Number(inserted.lastInsertRowid), contentItemId };
}

export async function mockConnectSocialAccount(formData: FormData) {
  const slotKey = parseText(formData.get("slot_key"));
  const slot = slotKey ? getSocialAccountSlot(slotKey) : null;

  if (!slot) {
    throw new Error("Choose an account slot to connect.");
  }

  const isManualOnly = slot.account_type === "linkedin_member";
  const db = await getDb();

  await db.execute({
    sql: `INSERT INTO social_accounts
      (brand, platform, account_type, display_name, handle, external_account_id, access_token, refresh_token, token_expires_at, connection_status)
      VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL, ?)
      ON CONFLICT(brand, platform, account_type)
      DO UPDATE SET
        display_name = excluded.display_name,
        handle = excluded.handle,
        external_account_id = excluded.external_account_id,
        connection_status = excluded.connection_status,
        updated_at = datetime('now')`,
    args: [
      slot.brand,
      slot.platform,
      slot.account_type,
      slot.displayName,
      slot.handle,
      `mock:${slot.key}`,
      isManualOnly ? "manual_only" : "connected",
    ],
  });

  revalidateSocialPaths();
}

export async function savePostAnalyticsLink(formData: FormData) {
  const result = await upsertPostAnalyticsLink(formData);
  revalidateSocialPaths(result.contentItemId);
}

export async function syncLinkedPostAnalytics(formData: FormData) {
  const result = await upsertPostAnalyticsLink(formData);
  await syncPostAnalytics(result.postAnalyticsId);
  revalidateSocialPaths(result.contentItemId);
}

export async function syncExistingPostAnalytics(formData: FormData) {
  const postAnalyticsId = parseNullableInteger(formData.get("post_analytics_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));

  if (!postAnalyticsId) {
    throw new Error("Analytics record is required.");
  }

  await syncPostAnalytics(postAnalyticsId);
  revalidateSocialPaths(contentItemId);
}

export async function attachPostUrlFromChannel(formData: FormData) {
  const contentChannelId = parseNullableInteger(formData.get("content_channel_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));
  const postedUrl = parseText(formData.get("posted_url"));

  if (!contentChannelId || !contentItemId || !postedUrl) {
    throw new Error("Post URL is required.");
  }

  const context = await getContentChannelContext(contentChannelId);
  if (!context) {
    throw new Error("Post context could not be found.");
  }

  const platform = inferPlatformFromChannel(String(context.channel_slug ?? ""), String(context.channel_name ?? ""));
  if (!platform) {
    throw new Error(`${platformLabel("instagram")} or ${platformLabel("linkedin")} channel required.`);
  }

  const payload = new FormData();
  payload.set("content_channel_id", String(contentChannelId));
  payload.set("content_item_id", String(contentItemId));
  payload.set("brand", String(context.brand ?? "seb"));
  payload.set("platform", platform);
  payload.set("post_url", postedUrl);

  await upsertPostAnalyticsLink(payload);
  revalidateSocialPaths(contentItemId);
}

