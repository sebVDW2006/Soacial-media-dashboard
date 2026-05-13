import { getDb } from "@/lib/db";
import { aggregateKpis } from "@/lib/kpi";
import { mergeAccountSlots } from "@/lib/social";
import { getCurrentWeek, getWeekTuesday, weekRange } from "@/lib/week";
import type {
  Asset,
  Brand,
  CaptureSession,
  Channel,
  ContentChannelDetail,
  ContentItem,
  ContentListItem,
  ContentType,
  Format,
  Idea,
  Pillar,
  SafeSocialAccount,
  SocialAccountType,
  SocialAnalyticsStatus,
  SocialConnectionStatus,
  SocialPlatform,
  WeeklyReview,
} from "@/lib/types";

type RowsResult = {
  rows: unknown[];
};

function rowsAs<T>(result: RowsResult) {
  return result.rows.map((row) => ({ ...(row as Record<string, unknown>) })) as T[];
}

function firstRowAs<T>(result: RowsResult) {
  return rowsAs<T>(result)[0];
}

function normalizeBrandFilter(filterBrand?: Brand | "all") {
  return filterBrand && filterBrand !== "all" ? filterBrand : null;
}

export async function getReferenceData() {
  const db = await getDb();
  const [pillars, formats, channels] = await Promise.all([
    db.execute("SELECT * FROM pillars ORDER BY id"),
    db.execute("SELECT * FROM formats WHERE active = 1 ORDER BY id"),
    db.execute("SELECT * FROM channels WHERE active = 1 ORDER BY brand, id"),
  ]);

  return {
    pillars: rowsAs<Pillar>(pillars),
    formats: rowsAs<Format>(formats),
    channels: rowsAs<Channel>(channels),
  };
}

export async function getIdeas(filterBrand?: Brand | "all") {
  const db = await getDb();
  const brandClause =
    filterBrand && filterBrand !== "all"
      ? `AND (
          CASE
            WHEN LOWER(COALESCE(f.best_for, '')) LIKE '%seb%' THEN 'seb'
            ELSE 'ublend'
          END
        ) = ?`
      : "";
  const result = await db.execute({
    sql: `SELECT i.*, f.name AS format_name
      FROM ideas i
      LEFT JOIN formats f ON f.id = i.suggested_format_id
      WHERE i.status = 'idea'
      ${brandClause}
      ORDER BY i.created_at DESC`,
    args: filterBrand && filterBrand !== "all" ? [filterBrand] : [],
  });
  return rowsAs<Idea & { format_name?: string | null }>(result);
}

export async function getIdeaCount() {
  const db = await getDb();
  const result = await db.execute("SELECT COUNT(*) AS count FROM ideas WHERE status = 'idea'");
  return Number(result.rows[0]?.count ?? 0);
}

export type ContentSortKey =
  | "scheduled"
  | "created"
  | "posted"
  | "edited";

export type ContentStatusGroup =
  | "all"
  | "draft"
  | "ready"
  | "scheduled"
  | "posted"
  | "repurpose"
  | "archived";

export type GetContentItemsOptions = {
  brand?: Brand | "all";
  search?: string | null;
  statusGroup?: ContentStatusGroup;
  formatId?: number | null;
  pillarId?: number | null;
  channelId?: number | null;
  contentType?: ContentType | "all" | null;
  subPillar?: string | null;
  weekIso?: string | null;
  sort?: ContentSortKey;
};

const STATUS_GROUP_TO_STATUSES: Record<ContentStatusGroup, string[]> = {
  all: [],
  draft: ["idea", "drafting"],
  ready: ["ready", "captured"],
  scheduled: ["scheduled"],
  posted: ["posted", "tracked"],
  repurpose: ["repurpose"],
  archived: [],
};

function buildContentSortClause(sort: ContentSortKey) {
  switch (sort) {
    case "created":
      return "ci.created_at DESC, ci.id DESC";
    case "posted":
      return "COALESCE((SELECT MAX(posted_at) FROM content_channels WHERE content_item_id = ci.id), ci.updated_at) DESC";
    case "edited":
      return "ci.updated_at DESC, ci.id DESC";
    case "scheduled":
    default:
      return "CASE WHEN ci.target_post_at IS NULL THEN 1 ELSE 0 END, ci.target_post_at ASC, ci.created_at ASC";
  }
}

export async function getContentItems(options?: GetContentItemsOptions | Brand | "all") {
  const opts: GetContentItemsOptions =
    typeof options === "string" ? { brand: options } : options ?? {};
  const db = await getDb();
  const brand = normalizeBrandFilter(opts.brand);
  const statusGroup = opts.statusGroup ?? "all";
  const sort = opts.sort ?? "scheduled";
  const search = opts.search?.trim() || null;

  const conditions: string[] = [];
  const args: Array<string | number | null> = [];

  conditions.push("(? IS NULL OR ci.brand = ?)");
  args.push(brand, brand);

  if (statusGroup === "archived") {
    conditions.push("ci.archived = 1");
  } else {
    conditions.push("ci.archived = 0");
    const statuses = STATUS_GROUP_TO_STATUSES[statusGroup];
    if (statuses.length) {
      conditions.push(`ci.status IN (${statuses.map(() => "?").join(", ")})`);
      args.push(...statuses);
    }
  }

  if (opts.formatId) {
    conditions.push("ci.format_id = ?");
    args.push(opts.formatId);
  }

  if (opts.pillarId) {
    conditions.push("ci.pillar_id = ?");
    args.push(opts.pillarId);
  }

  if (opts.channelId) {
    conditions.push(
      "EXISTS (SELECT 1 FROM content_channels cc2 WHERE cc2.content_item_id = ci.id AND cc2.channel_id = ?)",
    );
    args.push(opts.channelId);
  }

  if (opts.contentType && opts.contentType !== "all") {
    conditions.push("ci.content_type = ?");
    args.push(opts.contentType);
  }

  if (opts.subPillar) {
    conditions.push("ci.sub_pillar = ?");
    args.push(opts.subPillar);
  }

  if (opts.weekIso) {
    conditions.push("ci.week_iso = ?");
    args.push(opts.weekIso);
  }

  if (search) {
    const like = `%${search}%`;
    conditions.push(
      `(
        LOWER(ci.title) LIKE LOWER(?)
        OR LOWER(COALESCE(ci.notes, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(ci.hook, '')) LIKE LOWER(?)
        OR LOWER(f.name) LIKE LOWER(?)
        OR LOWER(p.name) LIKE LOWER(?)
      )`,
    );
    args.push(like, like, like, like, like);
  }

  const result = await db.execute({
    sql: `SELECT ci.*, f.name AS format_name, p.name AS pillar_name,
        GROUP_CONCAT(ch.name, ', ') AS channel_names,
        GROUP_CONCAT(ch.slug, ',') AS channel_slugs
      FROM content_items ci
      INNER JOIN formats f ON f.id = ci.format_id
      INNER JOIN pillars p ON p.id = ci.pillar_id
      LEFT JOIN content_channels cc ON cc.content_item_id = ci.id
      LEFT JOIN channels ch ON ch.id = cc.channel_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY ci.id
      ORDER BY ${buildContentSortClause(sort)}`,
    args,
  });
  return rowsAs<ContentListItem>(result);
}

export type WeeklyContentTypeCount = {
  week_iso: string;
  brand: Brand;
  content_type: ContentType | null;
  count: number;
};

export async function getWeeklyContentTypeBalance(weekIso: string) {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT week_iso, brand, content_type, COUNT(*) AS count
      FROM content_items
      WHERE archived = 0 AND week_iso = ?
      GROUP BY week_iso, brand, content_type`,
    args: [weekIso],
  });
  return rowsAs<WeeklyContentTypeCount>(result);
}

export async function getContentStatusCounts(
  options?: Omit<GetContentItemsOptions, "statusGroup" | "sort">,
) {
  const db = await getDb();
  const brand = normalizeBrandFilter(options?.brand);
  const search = options?.search?.trim() || null;

  const conditions: string[] = ["(? IS NULL OR ci.brand = ?)"];
  const args: Array<string | number | null> = [brand, brand];

  if (options?.formatId) {
    conditions.push("ci.format_id = ?");
    args.push(options.formatId);
  }
  if (options?.pillarId) {
    conditions.push("ci.pillar_id = ?");
    args.push(options.pillarId);
  }
  if (options?.channelId) {
    conditions.push(
      "EXISTS (SELECT 1 FROM content_channels cc2 WHERE cc2.content_item_id = ci.id AND cc2.channel_id = ?)",
    );
    args.push(options.channelId);
  }
  if (options?.contentType && options.contentType !== "all") {
    conditions.push("ci.content_type = ?");
    args.push(options.contentType);
  }
  if (options?.subPillar) {
    conditions.push("ci.sub_pillar = ?");
    args.push(options.subPillar);
  }
  if (options?.weekIso) {
    conditions.push("ci.week_iso = ?");
    args.push(options.weekIso);
  }
  if (search) {
    const like = `%${search}%`;
    conditions.push(
      `(
        LOWER(ci.title) LIKE LOWER(?)
        OR LOWER(COALESCE(ci.notes, '')) LIKE LOWER(?)
        OR LOWER(COALESCE(ci.hook, '')) LIKE LOWER(?)
        OR LOWER(f.name) LIKE LOWER(?)
        OR LOWER(p.name) LIKE LOWER(?)
      )`,
    );
    args.push(like, like, like, like, like);
  }

  const result = await db.execute({
    sql: `SELECT
        SUM(CASE WHEN ci.archived = 0 THEN 1 ELSE 0 END) AS all_count,
        SUM(CASE WHEN ci.archived = 0 AND ci.status IN ('idea', 'drafting') THEN 1 ELSE 0 END) AS draft_count,
        SUM(CASE WHEN ci.archived = 0 AND ci.status IN ('ready', 'captured') THEN 1 ELSE 0 END) AS ready_count,
        SUM(CASE WHEN ci.archived = 0 AND ci.status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_count,
        SUM(CASE WHEN ci.archived = 0 AND ci.status IN ('posted', 'tracked') THEN 1 ELSE 0 END) AS posted_count,
        SUM(CASE WHEN ci.archived = 0 AND ci.status = 'repurpose' THEN 1 ELSE 0 END) AS repurpose_count,
        SUM(CASE WHEN ci.archived = 1 THEN 1 ELSE 0 END) AS archived_count
      FROM content_items ci
      INNER JOIN formats f ON f.id = ci.format_id
      INNER JOIN pillars p ON p.id = ci.pillar_id
      WHERE ${conditions.join(" AND ")}`,
    args,
  });

  const row = (result.rows[0] ?? {}) as Record<string, unknown>;
  const toNum = (key: string) => Number(row[key] ?? 0);
  return {
    all: toNum("all_count"),
    draft: toNum("draft_count"),
    ready: toNum("ready_count"),
    scheduled: toNum("scheduled_count"),
    posted: toNum("posted_count"),
    repurpose: toNum("repurpose_count"),
    archived: toNum("archived_count"),
  };
}

export async function getContentById(id: number) {
  const db = await getDb();
  const content = await db.execute({
    sql: "SELECT * FROM content_items WHERE id = ?",
    args: [id],
  });
  const item = firstRowAs<ContentItem>(content);

  if (!item) {
    return null;
  }

  const [channels, assets] = await Promise.all([
    db.execute({
      sql: `SELECT cc.*, ch.name AS channel_name, ch.slug AS channel_slug, ch.brand
        FROM content_channels cc
        INNER JOIN channels ch ON ch.id = cc.channel_id
        WHERE cc.content_item_id = ?
        ORDER BY ch.brand, ch.id`,
      args: [id],
    }),
    db.execute({
      sql: `SELECT a.*
        FROM assets a
        INNER JOIN content_assets ca ON ca.asset_id = a.id
        WHERE ca.content_item_id = ?
        ORDER BY a.created_at DESC`,
      args: [id],
    }),
  ]);

  return {
    item,
    channels: rowsAs<ContentChannelDetail>(channels),
    assets: rowsAs<Asset>(assets),
  };
}

export async function getScheduledRange(start: string, end: string) {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT
        COALESCE(cc.id, -ci.id) AS content_channel_id,
        cc.scheduled_at,
        COALESCE(ch.brand, ci.brand) AS brand,
        COALESCE(ch.name, 'No channel assigned') AS channel_name,
        COALESCE(ch.slug, 'unassigned') AS channel_slug,
        ci.id AS content_id,
        ci.title,
        ci.status,
        ci.target_post_at
      FROM content_items ci
      LEFT JOIN content_channels cc ON cc.content_item_id = ci.id
      LEFT JOIN channels ch ON ch.id = cc.channel_id
      WHERE ci.archived = 0
        AND substr(COALESCE(cc.scheduled_at, ci.target_post_at), 1, 10) BETWEEN ? AND ?
      ORDER BY COALESCE(cc.scheduled_at, ci.target_post_at) ASC`,
    args: [start, end],
  });

  return rowsAs<{
    content_channel_id: number;
    scheduled_at: string | null;
    brand: Brand;
    channel_name: string;
    channel_slug: string;
    content_id: number;
    title: string;
    status: string;
    target_post_at: string | null;
  }>(result);
}

export async function getScheduledWeek(isoWeek = getCurrentWeek()) {
  const db = await getDb();
  const range = weekRange(isoWeek);
  const result = await db.execute({
    sql: `SELECT
        COALESCE(cc.id, -ci.id) AS content_channel_id,
        cc.scheduled_at,
        COALESCE(ch.brand, ci.brand) AS brand,
        COALESCE(ch.name, 'No channel assigned') AS channel_name,
        COALESCE(ch.slug, 'unassigned') AS channel_slug,
        ci.id AS content_id,
        ci.title,
        ci.status,
        ci.target_post_at
      FROM content_items ci
      LEFT JOIN content_channels cc ON cc.content_item_id = ci.id
      LEFT JOIN channels ch ON ch.id = cc.channel_id
      WHERE ci.archived = 0
        AND substr(COALESCE(cc.scheduled_at, ci.target_post_at), 1, 10) BETWEEN ? AND ?
      ORDER BY COALESCE(cc.scheduled_at, ci.target_post_at) ASC`,
    args: [range.start, range.end],
  });

  return {
    range,
    rows: rowsAs<{
      content_channel_id: number;
      scheduled_at: string | null;
      brand: Brand;
      channel_name: string;
      channel_slug: string;
      content_id: number;
      title: string;
      status: string;
      target_post_at: string | null;
    }>(result),
  };
}

export async function getCaptureSessionById(id: number) {
  const db = await getDb();
  const [session, assets] = await Promise.all([
    db.execute({
      sql: "SELECT * FROM capture_sessions WHERE id = ?",
      args: [id],
    }),
    db.execute({
      sql: "SELECT * FROM assets WHERE capture_session_id = ? ORDER BY created_at DESC",
      args: [id],
    }),
  ]);
  const row = firstRowAs<CaptureSession>(session);

  if (!row) return null;

  return {
    session: row,
    assets: rowsAs<Asset>(assets),
  };
}

export async function getOrCreateCurrentCaptureSession() {
  const db = await getDb();
  const currentWeek = getCurrentWeek();
  const captureDate = getWeekTuesday(currentWeek);

  await db.execute({
    sql: `INSERT OR IGNORE INTO capture_sessions (capture_date, status, notes)
      VALUES (?, 'planned', '')`,
    args: [captureDate],
  });

  const result = await db.execute({
    sql: "SELECT * FROM capture_sessions WHERE capture_date = ?",
    args: [captureDate],
  });

  return firstRowAs<CaptureSession>(result) as CaptureSession;
}

export async function getAssets(filters?: {
  kind?: string;
  captureSessionId?: string;
  brand?: Brand | "all";
}) {
  const db = await getDb();
  const conditions = ["1 = 1"];
  const args: Array<string | number> = [];

  if (filters?.kind && filters.kind !== "all") {
    conditions.push("a.kind = ?");
    args.push(filters.kind);
  }

  if (filters?.captureSessionId && filters.captureSessionId !== "all") {
    conditions.push("CAST(a.capture_session_id AS TEXT) = ?");
    args.push(filters.captureSessionId);
  }

  if (filters?.brand && filters.brand !== "all") {
    conditions.push(`EXISTS (
      SELECT 1
      FROM content_assets ca
      INNER JOIN content_items ci ON ci.id = ca.content_item_id
      WHERE ca.asset_id = a.id AND ci.brand = ?
    )`);
    args.push(filters.brand);
  }

  const result = await db.execute({
    sql: `SELECT
        a.*,
        GROUP_CONCAT(DISTINCT ci.title) AS linked_content_titles
      FROM assets a
      LEFT JOIN content_assets ca ON ca.asset_id = a.id
      LEFT JOIN content_items ci ON ci.id = ca.content_item_id
      WHERE ${conditions.join(" AND ")}
      GROUP BY a.id
      ORDER BY COALESCE(a.captured_on, substr(a.created_at, 1, 10)) DESC, a.id DESC`,
    args,
  });

  return rowsAs<Asset & { linked_content_titles?: string | null }>(result);
}

export async function getWeeklyReviews() {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM weekly_reviews ORDER BY week_iso DESC");
  return rowsAs<WeeklyReview>(result);
}

export async function getWeeklyReview(week: string) {
  const db = await getDb();
  const [review, content] = await Promise.all([
    db.execute({
      sql: "SELECT * FROM weekly_reviews WHERE week_iso = ?",
      args: [week],
    }),
    db.execute({
      sql: "SELECT id, title FROM content_items WHERE week_iso = ? ORDER BY target_post_at",
      args: [week],
    }),
  ]);

  return {
    review: firstRowAs<WeeklyReview>(review) ?? null,
    content: rowsAs<{ id: number; title: string }>(content),
  };
}

export async function getDashboardData() {
  const db = await getDb();
  const week = getCurrentWeek();

  const [currentCapture, nextPostsResult, ideaCount, reviewResult, summaryRows] =
    await Promise.all([
      getOrCreateCurrentCaptureSession(),
      db.execute({
        sql: `SELECT
            cc.id,
            cc.scheduled_at,
            ch.name AS channel_name,
            ci.id AS content_id,
            ci.title,
            ci.brand
          FROM content_channels cc
          INNER JOIN channels ch ON ch.id = cc.channel_id
          INNER JOIN content_items ci ON ci.id = cc.content_item_id
          WHERE COALESCE(cc.scheduled_at, ci.target_post_at) >= datetime('now')
          ORDER BY COALESCE(cc.scheduled_at, ci.target_post_at) ASC
          LIMIT 5`,
        args: [],
      }),
      getIdeaCount(),
      db.execute({
        sql: "SELECT id FROM weekly_reviews WHERE week_iso = ?",
        args: [week],
      }),
      getKpiSummaryRows("format", 28),
    ]);

  return {
    week,
    nextPosts: rowsAs<{
      id: number;
      scheduled_at: string | null;
      channel_name: string;
      content_id: number;
      title: string;
      brand: Brand;
    }>(nextPostsResult),
    ideaCount,
    captureSession: currentCapture,
    reviewMissing: !reviewResult.rows.length,
    kpiSummary: summaryRows,
  };
}

export async function getKpiSummaryRows(groupBy: "format" | "pillar" | "channel" | "brand", days = 30) {
  const db = await getDb();
  const result = await db.execute({
    sql: `WITH latest_snapshots AS (
        SELECT ks.*
        FROM kpi_snapshots ks
        INNER JOIN (
          SELECT content_channel_id, MAX(captured_at) AS latest
          FROM kpi_snapshots
          GROUP BY content_channel_id
        ) latest_ks
          ON latest_ks.content_channel_id = ks.content_channel_id
         AND latest_ks.latest = ks.captured_at
      )
      SELECT
        CASE
          WHEN ? = 'format' THEN CAST(f.id AS TEXT)
          WHEN ? = 'pillar' THEN CAST(p.id AS TEXT)
          WHEN ? = 'channel' THEN CAST(ch.id AS TEXT)
          ELSE ci.brand
        END AS groupKey,
        CASE
          WHEN ? = 'format' THEN f.name
          WHEN ? = 'pillar' THEN p.name
          WHEN ? = 'channel' THEN ch.name
          ELSE upper(substr(ci.brand, 1, 1)) || substr(ci.brand, 2)
        END AS label,
        COALESCE(ls.impressions, 0) AS impressions,
        COALESCE(ls.likes, 0) AS likes,
        COALESCE(ls.comments, 0) AS comments,
        COALESCE(ls.shares, 0) AS shares,
        COALESCE(ls.follows, 0) AS follows,
        COALESCE(ls.dms_or_leads, 0) AS dms_or_leads
      FROM latest_snapshots ls
      INNER JOIN content_channels cc ON cc.id = ls.content_channel_id
      INNER JOIN content_items ci ON ci.id = cc.content_item_id
      INNER JOIN formats f ON f.id = ci.format_id
      INNER JOIN pillars p ON p.id = ci.pillar_id
      INNER JOIN channels ch ON ch.id = cc.channel_id
      WHERE date(ls.captured_at) >= date('now', ?)
      ORDER BY impressions DESC`,
    args: [groupBy, groupBy, groupBy, groupBy, groupBy, groupBy, `-${days} days`],
  });

  return aggregateKpis(
    result.rows.map((row) => ({
      groupKey: String(row.groupKey ?? ""),
      label: String(row.label ?? ""),
      impressions: Number(row.impressions ?? 0),
      likes: Number(row.likes ?? 0),
      comments: Number(row.comments ?? 0),
      shares: Number(row.shares ?? 0),
      follows: Number(row.follows ?? 0),
      dms_or_leads: Number(row.dms_or_leads ?? 0),
    })),
  );
}

export async function getScheduledAndPostedItems(filterBrand?: Brand | "all") {
  const db = await getDb();
  const brand = normalizeBrandFilter(filterBrand);
  const result = await db.execute({
    sql: `SELECT
        ci.id AS content_id,
        ci.title,
        ci.status AS content_status,
        ci.brand,
        ci.target_post_at,
        cc.id AS content_channel_id,
        cc.scheduled_at,
        cc.posted_url,
        cc.status AS channel_status,
        ch.name AS channel_name,
        ch.slug AS channel_slug
      FROM content_items ci
      INNER JOIN content_channels cc ON cc.content_item_id = ci.id
      INNER JOIN channels ch ON ch.id = cc.channel_id
      WHERE ci.status IN ('scheduled', 'posted')
        AND (? IS NULL OR ci.brand = ?)
      ORDER BY COALESCE(ci.target_post_at, ci.created_at) ASC, ci.id, ch.id`,
    args: [brand, brand],
  });

  // Group flat rows into content items with their channels
  const map = new Map<number, {
    content_id: number;
    title: string;
    content_status: string;
    brand: Brand;
    target_post_at: string | null;
    channels: Array<{
      content_channel_id: number;
      channel_name: string;
      channel_slug: string;
      scheduled_at: string | null;
      posted_url: string | null;
      channel_status: string;
    }>;
  }>();

  for (const row of result.rows) {
    const id = Number(row.content_id);
    if (!map.has(id)) {
      map.set(id, {
        content_id: id,
        title: String(row.title ?? ""),
        content_status: String(row.content_status ?? ""),
        brand: (row.brand as Brand) ?? "seb",
        target_post_at: row.target_post_at ? String(row.target_post_at) : null,
        channels: [],
      });
    }
    map.get(id)!.channels.push({
      content_channel_id: Number(row.content_channel_id),
      channel_name: String(row.channel_name ?? ""),
      channel_slug: String(row.channel_slug ?? ""),
      scheduled_at: row.scheduled_at ? String(row.scheduled_at) : null,
      posted_url: row.posted_url ? String(row.posted_url) : null,
      channel_status: String(row.channel_status ?? ""),
    });
  }

  return Array.from(map.values());
}

export async function getWeeklySlotContent(weekIso: string) {
  const db = await getDb();
  const range = weekRange(weekIso);
  const result = await db.execute({
    sql: `SELECT
        ci.id,
        ci.title,
        ci.status,
        ch.slug AS channel_slug
      FROM content_items ci
      INNER JOIN content_channels cc ON cc.content_item_id = ci.id
      INNER JOIN channels ch ON ch.id = cc.channel_id
      WHERE (
          ci.target_post_at IS NOT NULL
          AND substr(ci.target_post_at, 1, 10) BETWEEN ? AND ?
        )
        OR (
          ci.target_post_at IS NULL
          AND ci.week_iso = ?
        )
        OR (
          ci.target_post_at IS NULL
          AND ci.week_iso IS NULL
          AND substr(COALESCE(ci.updated_at, ci.created_at, ''), 1, 10) BETWEEN ? AND ?
        )
      ORDER BY ci.created_at ASC`,
    args: [range.start, range.end, weekIso, range.start, range.end],
  });
  return rowsAs<{
    id: number;
    title: string;
    status: string;
    channel_slug: string;
  }>(result);
}

export async function getPostedItemsWithChannels(filterBrand?: Brand | "all") {
  const db = await getDb();
  const brand = normalizeBrandFilter(filterBrand);
  const result = await db.execute({
    sql: `SELECT
        ci.id AS content_id,
        ci.title,
        ci.brand,
        cc.id AS content_channel_id,
        cc.posted_url,
        ch.name AS channel_name,
        ch.slug AS channel_slug,
        pa.id AS post_analytics_id,
        pa.status AS analytics_status,
        pa.error_message AS analytics_error_message,
        ks.id AS snapshot_id,
        ks.impressions,
        ks.reach,
        ks.views,
        ks.likes,
        ks.comments,
        ks.shares,
        ks.saves,
        ks.link_clicks,
        ks.follows,
        ks.dms_or_leads
      FROM content_items ci
      INNER JOIN content_channels cc ON cc.content_item_id = ci.id
      INNER JOIN channels ch ON ch.id = cc.channel_id
      LEFT JOIN post_analytics pa ON pa.post_id = cc.id
      LEFT JOIN kpi_snapshots ks ON ks.content_channel_id = cc.id
        AND ks.captured_at = (
          SELECT MAX(captured_at) FROM kpi_snapshots WHERE content_channel_id = cc.id
        )
      WHERE ci.status IN ('posted', 'tracked')
        AND cc.status = 'posted'
        AND (? IS NULL OR ci.brand = ?)
      ORDER BY ci.updated_at DESC, ci.id, ch.id`,
    args: [brand, brand],
  });

  const map = new Map<number, {
    content_id: number;
    title: string;
    brand: Brand;
    channels: Array<{
      content_channel_id: number;
      channel_name: string;
      channel_slug: string;
      posted_url: string | null;
      post_analytics_id: number | null;
      analytics_status: SocialAnalyticsStatus | null;
      analytics_error_message: string | null;
      snapshot_id: number | null;
      impressions: number;
      reach: number;
      views: number;
      likes: number;
      comments: number;
      shares: number;
      saves: number;
      link_clicks: number;
      follows: number;
      dms_or_leads: number;
    }>;
  }>();

  for (const row of result.rows) {
    const id = Number(row.content_id);
    if (!map.has(id)) {
      map.set(id, {
        content_id: id,
        title: String(row.title ?? ""),
        brand: (row.brand as Brand) ?? "seb",
        channels: [],
      });
    }
    map.get(id)!.channels.push({
      content_channel_id: Number(row.content_channel_id),
      channel_name: String(row.channel_name ?? ""),
      channel_slug: String(row.channel_slug ?? ""),
      posted_url: row.posted_url ? String(row.posted_url) : null,
      post_analytics_id: row.post_analytics_id ? Number(row.post_analytics_id) : null,
      analytics_status: row.analytics_status ? (String(row.analytics_status) as SocialAnalyticsStatus) : null,
      analytics_error_message: row.analytics_error_message ? String(row.analytics_error_message) : null,
      snapshot_id: row.snapshot_id ? Number(row.snapshot_id) : null,
      impressions: Number(row.impressions ?? 0),
      reach: Number(row.reach ?? 0),
      views: Number(row.views ?? 0),
      likes: Number(row.likes ?? 0),
      comments: Number(row.comments ?? 0),
      shares: Number(row.shares ?? 0),
      saves: Number(row.saves ?? 0),
      link_clicks: Number(row.link_clicks ?? 0),
      follows: Number(row.follows ?? 0),
      dms_or_leads: Number(row.dms_or_leads ?? 0),
    });
  }

  return Array.from(map.values());
}

export async function getTopKpiPosts(days = 30) {
  const db = await getDb();
  const result = await db.execute({
    sql: `WITH latest_snapshots AS (
        SELECT ks.*
        FROM kpi_snapshots ks
        INNER JOIN (
          SELECT content_channel_id, MAX(captured_at) AS latest
          FROM kpi_snapshots
          GROUP BY content_channel_id
        ) latest_ks
          ON latest_ks.content_channel_id = ks.content_channel_id
         AND latest_ks.latest = ks.captured_at
      )
      SELECT
        ci.id,
        ci.title,
        SUM(COALESCE(ls.likes, 0) + COALESCE(ls.comments, 0) + COALESCE(ls.shares, 0)) AS total_engagement
      FROM latest_snapshots ls
      INNER JOIN content_channels cc ON cc.id = ls.content_channel_id
      INNER JOIN content_items ci ON ci.id = cc.content_item_id
      WHERE date(ls.captured_at) >= date('now', ?)
      GROUP BY ci.id
      ORDER BY total_engagement DESC
      LIMIT 10`,
    args: [`-${days} days`],
  });
  return rowsAs<{
    id: number;
    title: string;
    total_engagement: number;
  }>(result);
}

function rowText(value: unknown) {
  return value == null ? null : String(value);
}

function rowNumber(value: unknown) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function engagementTotal(row: {
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
}) {
  return row.likes + row.comments + row.shares + row.saves + row.clicks;
}

export async function getSocialAccountSlots() {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT
        id,
        brand,
        platform,
        account_type,
        display_name,
        handle,
        external_account_id,
        token_expires_at,
        connection_status,
        last_synced_at,
        created_at,
        updated_at
      FROM social_accounts
      ORDER BY brand, platform, account_type`,
    args: [],
  });

  const accounts = result.rows.map((row) => ({
    id: rowNumber(row.id),
    brand: (rowText(row.brand) === "ublend" ? "ublend" : "seb") as Brand,
    platform: (rowText(row.platform) === "linkedin" ? "linkedin" : "instagram") as SocialPlatform,
    account_type: rowText(row.account_type) as SocialAccountType,
    display_name: rowText(row.display_name) ?? "",
    handle: rowText(row.handle),
    external_account_id: rowText(row.external_account_id),
    token_expires_at: rowText(row.token_expires_at),
    connection_status: (rowText(row.connection_status) ?? "needs_review") as SocialConnectionStatus,
    last_synced_at: rowText(row.last_synced_at),
    created_at: rowText(row.created_at) ?? "",
    updated_at: rowText(row.updated_at) ?? "",
  })) satisfies SafeSocialAccount[];

  return mergeAccountSlots(accounts);
}

export type SocialAnalyticsOverviewRow = {
  id: number;
  content_id: number;
  title: string;
  brand: Brand;
  platform: SocialPlatform;
  status: SocialAnalyticsStatus;
  last_synced_at: string | null;
  accountLabel: string;
  metrics: {
    impressions: number;
    reach: number;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    engagementRate: number;
  };
};

export async function getSocialAnalyticsOverview(filterBrand?: Brand | "all") {
  const db = await getDb();
  const brand = normalizeBrandFilter(filterBrand);
  const result = await db.execute({
    sql: `SELECT
        pa.id,
        cc.content_item_id AS content_id,
        ci.title,
        pa.brand,
        pa.platform,
        pa.status,
        pa.last_synced_at,
        pa.impressions,
        pa.reach,
        pa.views,
        pa.likes,
        pa.comments,
        pa.shares,
        pa.saves,
        pa.clicks,
        pa.engagement_rate,
        COALESCE(sa.display_name, ch.name) AS account_label
      FROM post_analytics pa
      INNER JOIN content_channels cc ON cc.id = pa.post_id
      INNER JOIN content_items ci ON ci.id = cc.content_item_id
      INNER JOIN channels ch ON ch.id = cc.channel_id
      LEFT JOIN social_accounts sa ON sa.id = pa.social_account_id
      WHERE (? IS NULL OR pa.brand = ?)
      ORDER BY COALESCE(pa.last_synced_at, pa.updated_at, pa.created_at) DESC, pa.id DESC`,
    args: [brand, brand],
  });

  const rows: SocialAnalyticsOverviewRow[] = result.rows.map((row) => {
    const likes = rowNumber(row.likes);
    const comments = rowNumber(row.comments);
    const shares = rowNumber(row.shares);
    const saves = rowNumber(row.saves);
    const clicks = rowNumber(row.clicks);

    return {
      id: rowNumber(row.id),
      content_id: rowNumber(row.content_id),
      title: rowText(row.title) ?? "Untitled post",
      brand: (rowText(row.brand) === "ublend" ? "ublend" : "seb") as Brand,
      platform: (rowText(row.platform) === "linkedin" ? "linkedin" : "instagram") as SocialPlatform,
      status: (rowText(row.status) ?? "not_connected") as SocialAnalyticsStatus,
      last_synced_at: rowText(row.last_synced_at),
      accountLabel: rowText(row.account_label) ?? "Unassigned account",
      metrics: {
        impressions: rowNumber(row.impressions),
        reach: rowNumber(row.reach),
        views: rowNumber(row.views),
        likes,
        comments,
        shares,
        saves,
        clicks,
        engagementRate: rowNumber(row.engagement_rate),
      },
    };
  });

  const totals = rows.reduce(
    (acc, row) => {
      acc.impressions += row.metrics.impressions;
      acc.reach += row.metrics.reach;
      acc.views += row.metrics.views;
      acc.engagement += engagementTotal(row.metrics);
      return acc;
    },
    { impressions: 0, reach: 0, views: 0, engagement: 0 },
  );
  const denominator = totals.reach || totals.impressions || totals.views;
  const averageEngagementRate = denominator
    ? Number(((totals.engagement / denominator) * 100).toFixed(2))
    : 0;

  const bestPost =
    rows
      .map((row) => ({ label: row.title, value: engagementTotal(row.metrics) }))
      .sort((a, b) => b.value - a.value)[0] ?? null;

  const platformTotals = new Map<SocialPlatform, number>();
  const accountTotals = new Map<string, number>();
  for (const row of rows) {
    const engagement = engagementTotal(row.metrics);
    platformTotals.set(row.platform, (platformTotals.get(row.platform) ?? 0) + engagement);
    accountTotals.set(row.accountLabel, (accountTotals.get(row.accountLabel) ?? 0) + engagement);
  }

  const bestPlatform =
    Array.from(platformTotals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)[0] ?? null;
  const bestAccount =
    Array.from(accountTotals.entries())
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)[0] ?? null;

  return {
    rows,
    totals,
    averageEngagementRate,
    bestPost,
    bestPlatform,
    bestAccount,
  };
}
