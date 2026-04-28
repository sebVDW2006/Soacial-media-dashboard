"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, parseInteger, parseNullableInteger, parseText, touchContentStatus } from "@/lib/db";
import { getISOWeek } from "@/lib/week";

async function syncContentChannels(contentItemId: number, channelIds: number[]) {
  const db = await getDb();
  const existing = await db.execute({
    sql: "SELECT id, channel_id FROM content_channels WHERE content_item_id = ?",
    args: [contentItemId],
  });
  const existingIds = new Set(existing.rows.map((row) => Number(row.channel_id)));

  for (const channelId of channelIds) {
    if (!existingIds.has(channelId)) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO content_channels
          (content_item_id, channel_id, status)
          VALUES (?, ?, 'planned')`,
        args: [contentItemId, channelId],
      });
    }
  }

  const toDelete = existing.rows
    .filter((row) => !channelIds.includes(Number(row.channel_id)))
    .map((row) => Number(row.id));

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

  for (const assetId of assetIds) {
    if (!existingIds.has(assetId)) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO content_assets (content_item_id, asset_id)
          VALUES (?, ?)`,
        args: [contentItemId, assetId],
      });
    }
  }

  for (const row of existing.rows) {
    const assetId = Number(row.asset_id);
    if (!assetIds.includes(assetId)) {
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
  const targetPostAt = parseText(formData.get("target_post_at"));
  const notes = parseText(formData.get("notes"));
  const channelIds = formData
    .getAll("channel_ids")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
  const assetIds = formData
    .getAll("asset_ids")
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (!title || !formatId || !pillarId || (brand !== "seb" && brand !== "ublend")) {
    throw new Error("Missing required content fields.");
  }

  const weekIso = targetPostAt ? getISOWeek(targetPostAt) : null;
  const db = await getDb();
  let contentId = id ?? 0;

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

  await syncContentChannels(contentId, channelIds);
  await syncAssets(contentId, assetIds);
  await touchContentStatus(contentId);

  revalidatePath("/");
  revalidatePath("/calendar");
  revalidatePath("/pipeline");
  revalidatePath(`/content/${contentId}`);
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

  const nextStatus = postedUrl ? "posted" : scheduledAt ? "scheduled" : "planned";
  const db = await getDb();

  await db.execute({
    sql: `UPDATE content_channels
      SET scheduled_at = ?, posted_at = ?, posted_url = ?, status = ?
      WHERE id = ?`,
    args: [scheduledAt, postedAt, postedUrl, nextStatus, contentChannelId],
  });

  await touchContentStatus(contentItemId);

  revalidatePath(`/content/${contentItemId}`);
  revalidatePath("/calendar");
  revalidatePath("/pipeline");
  revalidatePath("/");
}

export async function markPosted(formData: FormData) {
  const contentChannelId = parseNullableInteger(formData.get("content_channel_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));

  if (!contentChannelId || !contentItemId) {
    throw new Error("Channel context is required.");
  }

  const db = await getDb();
  await db.execute({
    sql: `UPDATE content_channels
      SET posted_at = COALESCE(posted_at, datetime('now')),
          status = 'posted'
      WHERE id = ?`,
    args: [contentChannelId],
  });

  await touchContentStatus(contentItemId);

  revalidatePath(`/content/${contentItemId}`);
  revalidatePath("/pipeline");
  revalidatePath("/kpis");
  revalidatePath("/");
}

export async function deleteContent(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));
  if (!id) throw new Error("Content ID required.");

  const db = await getDb();
  await db.execute({ sql: "DELETE FROM content_items WHERE id = ?", args: [id] });

  revalidatePath("/content");
  revalidatePath("/pipeline");
  revalidatePath("/calendar");
  revalidatePath("/");
  redirect("/content");
}

export async function addKpi(formData: FormData) {
  const contentChannelId = parseNullableInteger(formData.get("content_channel_id"));
  const contentItemId = parseNullableInteger(formData.get("content_item_id"));

  if (!contentChannelId || !contentItemId) {
    throw new Error("Channel KPI context is required.");
  }

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO kpi_snapshots
      (content_channel_id, impressions, views, likes, comments, shares, saves, profile_visits, follows, link_clicks, dms_or_leads, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      contentChannelId,
      parseInteger(formData.get("impressions")),
      parseInteger(formData.get("views")),
      parseInteger(formData.get("likes")),
      parseInteger(formData.get("comments")),
      parseInteger(formData.get("shares")),
      parseInteger(formData.get("saves")),
      parseInteger(formData.get("profile_visits")),
      parseInteger(formData.get("follows")),
      parseInteger(formData.get("link_clicks")),
      parseInteger(formData.get("dms_or_leads")),
      parseText(formData.get("notes")),
    ],
  });

  await touchContentStatus(contentItemId);

  revalidatePath(`/content/${contentItemId}`);
  revalidatePath("/kpis");
  revalidatePath("/");
}

