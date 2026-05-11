"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, parseInteger, parseNullableInteger, parseText, touchContentStatus } from "@/lib/db";
import { getCurrentWeek, getISOWeek } from "@/lib/week";

const CONTENT_COLLECTION_PATHS = ["/", "/content", "/content/new", "/calendar", "/pipeline"] as const;
const KPI_PATHS = ["/", "/pipeline", "/kpis"] as const;

function getEarliestDate(values: Array<string | null>) {
  const valid = values.filter((value): value is string => Boolean(value));
  if (!valid.length) return null;
  return valid.reduce((earliest, current) => (current < earliest ? current : earliest));
}

function parseWeekIso(value: string | null) {
  if (!value || !/^\d{4}-W\d{2}$/.test(value)) return null;

  const weekNumber = Number(value.slice(-2));
  return weekNumber >= 1 && weekNumber <= 53 ? value : null;
}

function getSelectedIds(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}

function getChannelStatus({
  scheduledAt,
  postedAt,
  postedUrl,
  existingStatus,
}: {
  scheduledAt?: string | null;
  postedAt?: string | null;
  postedUrl?: string | null;
  existingStatus?: string | null;
}) {
  if (existingStatus === "posted" || postedAt || postedUrl) {
    return "posted";
  }

  return scheduledAt ? "scheduled" : "planned";
}

function revalidatePaths(paths: readonly string[]) {
  for (const path of paths) {
    revalidatePath(path);
  }
}

function revalidateContentRoutes(contentItemId: number) {
  revalidatePath(`/content/${contentItemId}`);
  revalidatePaths(CONTENT_COLLECTION_PATHS);
}

function revalidateKpiRoutes(contentItemId?: number | null) {
  if (contentItemId) {
    revalidatePath(`/content/${contentItemId}`);
  }

  revalidatePaths(KPI_PATHS);
}

async function syncContentChannels(
  contentItemId: number,
  channelIds: number[],
  channelSchedules: Record<number, string | null>,
) {
  const db = await getDb();
  const existing = await db.execute({
    sql: `SELECT id, channel_id, posted_at, posted_url, status
      FROM content_channels
      WHERE content_item_id = ?`,
    args: [contentItemId],
  });
  const existingByChannelId = new Map(
    existing.rows.map((row) => [
      Number(row.channel_id),
      {
        id: Number(row.id),
        posted_at: row.posted_at ? String(row.posted_at) : null,
        posted_url: row.posted_url ? String(row.posted_url) : null,
        status: String(row.status ?? "planned"),
      },
    ]),
  );
  const nextChannelIds = new Set(channelIds);
  const toDelete = existing.rows
    .filter((row) => !nextChannelIds.has(Number(row.channel_id)))
    .map((row) => Number(row.id));

  for (const channelId of channelIds) {
    const scheduledAt = channelSchedules[channelId] ?? null;
    const existingRow = existingByChannelId.get(channelId);
    const status = getChannelStatus({
      scheduledAt,
      postedAt: existingRow?.posted_at,
      postedUrl: existingRow?.posted_url,
      existingStatus: existingRow?.status,
    });

    if (!existingRow) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO content_channels
          (content_item_id, channel_id, scheduled_at, status)
          VALUES (?, ?, ?, ?)`,
        args: [contentItemId, channelId, scheduledAt, status],
      });
      continue;
    }

    await db.execute({
      sql: `UPDATE content_channels
        SET scheduled_at = ?, status = ?
        WHERE id = ?`,
      args: [scheduledAt, status, existingRow.id],
    });
  }

  for (const id of toDelete) {
    await db.execute({
      sql: "DELETE FROM content_channels WHERE id = ?",
      args: [id],
    });
  }
}

async function syncAssets(contentItemId: number, assetIds: number[]) {
  const db = await getDb();
  const existing = await db.execute({
    sql: "SELECT asset_id FROM content_assets WHERE content_item_id = ?",
    args: [contentItemId],
  });
  const existingIds = new Set(existing.rows.map((row) => Number(row.asset_id)));
  const nextAssetIds = new Set(assetIds);

  for (const assetId of assetIds) {
    if (!existingIds.has(assetId)) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO content_assets (content_item_id, asset_id)
          VALUES (?, ?)`,
        args: [contentItemId, assetId],
      });
    }
  }

  for (const assetId of existing.rows.map((row) => Number(row.asset_id))) {
    if (!nextAssetIds.has(assetId)) {
      await db.execute({
        sql: "DELETE FROM content_assets WHERE content_item_id = ? AND asset_id = ?",
        args: [contentItemId, assetId],
      });
    }
  }
}

export async function upsertContent(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));
  const title = parseText(formData.get("title"));
  const formatId = parseInteger(formData.get("format_id"));
  const pillarId = parseInteger(formData.get("pillar_id"));
  const brand = parseText(formData.get("brand"));
  const postType = parseText(formData.get("post_type")) ?? "single-image";
  const hook = parseText(formData.get("hook"));
  const body = parseText(formData.get("body"));
  const close = parseText(formData.get("close"));
  const submittedTargetPostAt = parseText(formData.get("target_post_at"));
  const submittedWeekIso = parseWeekIso(parseText(formData.get("week_iso")));
  const notes = parseText(formData.get("notes"));
  const channelIds = getSelectedIds(formData, "channel_ids");
  const channelSchedules = Object.fromEntries(
    channelIds.map((channelId) => [channelId, parseText(formData.get(`channel_schedule_${channelId}`))]),
  ) as Record<number, string | null>;
  const targetPostAt = getEarliestDate(Object.values(channelSchedules))
    ?? (channelIds.length ? null : submittedTargetPostAt);
  const assetIds = getSelectedIds(formData, "asset_ids");

  if (!title || !formatId || !pillarId || (brand !== "seb" && brand !== "ublend")) {
    throw new Error("Missing required content fields.");
  }

  const db = await getDb();
  let contentId = id ?? 0;
  let existingWeekIso: string | null = null;

  if (id) {
    const existing = await db.execute({
      sql: "SELECT week_iso FROM content_items WHERE id = ?",
      args: [id],
    });
    existingWeekIso = (existing.rows[0]?.week_iso as string | null) ?? null;
  }

  const weekIso = targetPostAt
    ? getISOWeek(targetPostAt)
    : existingWeekIso ?? submittedWeekIso ?? getCurrentWeek();

  if (id) {
    await db.execute({
      sql: `UPDATE content_items
        SET title = ?, format_id = ?, pillar_id = ?, brand = ?, post_type = ?, hook = ?, body = ?, close = ?,
            target_post_at = ?, week_iso = ?, notes = ?, updated_at = datetime('now')
        WHERE id = ?`,
      args: [title, formatId, pillarId, brand, postType, hook, body, close, targetPostAt, weekIso, notes, id],
    });
  } else {
    const result = await db.execute({
      sql: `INSERT INTO content_items
        (title, format_id, pillar_id, brand, post_type, hook, body, close, status, target_post_at, week_iso, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'drafting', ?, ?, ?, datetime('now'), datetime('now'))`,
      args: [title, formatId, pillarId, brand, postType, hook, body, close, targetPostAt, weekIso, notes],
    });
    contentId = Number(result.lastInsertRowid);
  }

  await syncContentChannels(contentId, channelIds, channelSchedules);
  await syncAssets(contentId, assetIds);
  await touchContentStatus(contentId);

  revalidateContentRoutes(contentId);
  redirect(`/content/${contentId}`);
}

export async function saveChannelSchedule(formData: FormData) {
  const contentChannelId = parseNullableInteger(formData.get("content_channel_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));
  const scheduledAt = parseText(formData.get("scheduled_at"));
  const postedAt = parseText(formData.get("posted_at"));
  const postedUrl = parseText(formData.get("posted_url"));

  if (!contentChannelId || !contentItemId) {
    throw new Error("Channel schedule context is required.");
  }

  const nextStatus = getChannelStatus({ scheduledAt, postedAt, postedUrl });
  const db = await getDb();

  await db.execute({
    sql: `UPDATE content_channels
      SET scheduled_at = ?, posted_at = ?, posted_url = ?, status = ?
      WHERE id = ?`,
    args: [scheduledAt, postedAt, postedUrl, nextStatus, contentChannelId],
  });

  await touchContentStatus(contentItemId);

  revalidateContentRoutes(contentItemId);
}

export async function markPosted(formData: FormData) {
  const contentChannelId = parseNullableInteger(formData.get("content_channel_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));
  const postedUrl = parseText(formData.get("posted_url"));

  if (!contentChannelId || !contentItemId) {
    throw new Error("Channel context is required.");
  }

  const db = await getDb();

  if (postedUrl !== null) {
    await db.execute({
      sql: `UPDATE content_channels
        SET posted_at = COALESCE(posted_at, datetime('now')),
            posted_url = ?,
            status = 'posted'
        WHERE id = ?`,
      args: [postedUrl, contentChannelId],
    });
  } else {
    await db.execute({
      sql: `UPDATE content_channels
        SET posted_at = COALESCE(posted_at, datetime('now')),
            status = 'posted'
        WHERE id = ?`,
      args: [contentChannelId],
    });
  }

  await touchContentStatus(contentItemId);

  revalidateKpiRoutes(contentItemId);
}

export async function deleteContent(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));
  if (!id) throw new Error("Content ID required.");

  const db = await getDb();
  await db.execute({ sql: "DELETE FROM content_items WHERE id = ?", args: [id] });

  revalidatePaths(CONTENT_COLLECTION_PATHS);
  redirect("/content");
}

export async function archiveContent(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));
  if (!id) throw new Error("Content ID required.");

  const db = await getDb();
  await db.execute({
    sql: "UPDATE content_items SET archived = 1, updated_at = datetime('now') WHERE id = ?",
    args: [id],
  });

  revalidatePaths(CONTENT_COLLECTION_PATHS);
}

export async function unarchiveContent(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));
  if (!id) throw new Error("Content ID required.");

  const db = await getDb();
  await db.execute({
    sql: "UPDATE content_items SET archived = 0, updated_at = datetime('now') WHERE id = ?",
    args: [id],
  });

  revalidatePaths(CONTENT_COLLECTION_PATHS);
}

export async function upsertKpi(formData: FormData) {
  const contentChannelId = parseNullableInteger(formData.get("content_channel_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));
  const snapshotId = parseNullableInteger(formData.get("snapshot_id"));
  const postAnalyticsId = parseNullableInteger(formData.get("post_analytics_id"));

  if (!contentChannelId || !contentItemId) {
    throw new Error("Channel KPI context is required.");
  }

  const impressions = parseInteger(formData.get("impressions"));
  const reach = parseInteger(formData.get("reach"));
  const views = parseInteger(formData.get("views"));
  const likes = parseInteger(formData.get("likes"));
  const comments = parseInteger(formData.get("comments"));
  const shares = parseInteger(formData.get("shares"));
  const saves = parseInteger(formData.get("saves"));
  const linkClicks = parseInteger(formData.get("link_clicks"));
  const follows = parseInteger(formData.get("follows"));
  const dmsOrLeads = parseInteger(formData.get("dms_or_leads"));
  const postedUrl = parseText(formData.get("posted_url"));

  const db = await getDb();

  // Save the post URL to the channel row if provided
  if (postedUrl !== null) {
    await db.execute({
      sql: "UPDATE content_channels SET posted_url = ? WHERE id = ?",
      args: [postedUrl, contentChannelId],
    });
  }

  if (snapshotId) {
    // Update existing snapshot
    await db.execute({
      sql: `UPDATE kpi_snapshots
        SET impressions = ?, reach = ?, views = ?, likes = ?, comments = ?, shares = ?,
            saves = ?, link_clicks = ?, follows = ?, dms_or_leads = ?,
            captured_at = datetime('now')
        WHERE id = ?`,
      args: [
        impressions,
        reach,
        views,
        likes,
        comments,
        shares,
        saves,
        linkClicks,
        follows,
        dmsOrLeads,
        snapshotId,
      ],
    });
  } else {
    // Insert first snapshot
    await db.execute({
      sql: `INSERT INTO kpi_snapshots
        (content_channel_id, impressions, reach, views, likes, comments, shares, saves, link_clicks, follows, dms_or_leads)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        contentChannelId,
        impressions,
        reach,
        views,
        likes,
        comments,
        shares,
        saves,
        linkClicks,
        follows,
        dmsOrLeads,
      ],
    });
  }

  if (postAnalyticsId) {
    await db.execute({
      sql: `UPDATE post_analytics
        SET status = 'manual',
            error_message = 'Manual override',
            updated_at = datetime('now')
        WHERE id = ?`,
      args: [postAnalyticsId],
    });
  }

  await touchContentStatus(contentItemId);
  revalidateKpiRoutes(contentItemId);
}

export async function deleteKpiSnapshot(formData: FormData) {
  const snapshotId = parseNullableInteger(formData.get("snapshot_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));

  if (!snapshotId) throw new Error("Snapshot ID required.");

  const db = await getDb();
  await db.execute({ sql: "DELETE FROM kpi_snapshots WHERE id = ?", args: [snapshotId] });

  if (contentItemId) {
    await touchContentStatus(contentItemId);
  }

  revalidateKpiRoutes(contentItemId);
}

// Keep old name as alias for backwards compatibility
export const addKpi = upsertKpi;
