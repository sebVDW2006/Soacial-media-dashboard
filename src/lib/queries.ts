import { getDb } from "@/lib/db";
import { aggregateKpis } from "@/lib/kpi";
import { getCurrentWeek, getWeekTuesday, weekRange } from "@/lib/week";
import type {
  Asset,
  Brand,
  CaptureSession,
  Channel,
  ContentChannelDetail,
  ContentItem,
  ContentListItem,
  Format,
  Idea,
  Pillar,
  WeeklyReview,
} from "@/lib/types";

export async function getReferenceData() {
  const db = await getDb();
  const [pillars, formats, channels] = await Promise.all([
    db.execute("SELECT * FROM pillars ORDER BY id"),
    db.execute("SELECT * FROM formats WHERE active = 1 ORDER BY id"),
    db.execute("SELECT * FROM channels WHERE active = 1 ORDER BY brand, id"),
  ]);

  return {
    pillars: pillars.rows as unknown as Pillar[],
    formats: formats.rows as unknown as Format[],
    channels: channels.rows as unknown as Channel[],
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
  return result.rows as unknown as Array<Idea & { format_name?: string | null }>;
}

export async function getIdeaCount() {
  const db = await getDb();
  const result = await db.execute("SELECT COUNT(*) AS count FROM ideas WHERE status = 'idea'");
  return Number(result.rows[0]?.count ?? 0);
}

export async function getContentItems(filterBrand?: Brand | "all") {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT ci.*, f.name AS format_name, p.name AS pillar_name,
        GROUP_CONCAT(ch.name, ', ') AS channel_names
      FROM content_items ci
      INNER JOIN formats f ON f.id = ci.format_id
      INNER JOIN pillars p ON p.id = ci.pillar_id
      LEFT JOIN content_channels cc ON cc.content_item_id = ci.id
      LEFT JOIN channels ch ON ch.id = cc.channel_id
      WHERE (? IS NULL OR ci.brand = ?)
      GROUP BY ci.id
      ORDER BY COALESCE(ci.target_post_at, ci.created_at) ASC`,
    args: [filterBrand && filterBrand !== "all" ? filterBrand : null, filterBrand && filterBrand !== "all" ? filterBrand : null],
  });
  return result.rows as unknown as ContentListItem[];
}

export async function getContentById(id: number) {
  const db = await getDb();
  const content = await db.execute({
    sql: "SELECT * FROM content_items WHERE id = ?",
    args: [id],
  });
  const item = content.rows[0] as unknown as ContentItem | undefined;

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
    channels: channels.rows as unknown as ContentChannelDetail[],
    assets: assets.rows as unknown as Asset[],
  };
}

export async function getScheduledRange(start: string, end: string) {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT
        cc.id AS content_channel_id,
        cc.scheduled_at,
        ch.brand,
        ch.name AS channel_name,
        ch.slug AS channel_slug,
        ci.id AS content_id,
        ci.title,
        ci.status,
        ci.target_post_at
      FROM content_channels cc
      INNER JOIN channels ch ON ch.id = cc.channel_id
      INNER JOIN content_items ci ON ci.id = cc.content_item_id
      WHERE substr(COALESCE(cc.scheduled_at, ci.target_post_at, ''), 1, 10) BETWEEN ? AND ?
      ORDER BY COALESCE(cc.scheduled_at, ci.target_post_at) ASC`,
    args: [start, end],
  });

  return result.rows as unknown as Array<{
    content_channel_id: number;
    scheduled_at: string | null;
    brand: Brand;
    channel_name: string;
    channel_slug: string;
    content_id: number;
    title: string;
    status: string;
    target_post_at: string | null;
  }>;
}

export async function getScheduledWeek(isoWeek = getCurrentWeek()) {
  const db = await getDb();
  const range = weekRange(isoWeek);
  const result = await db.execute({
    sql: `SELECT
        cc.id AS content_channel_id,
        cc.scheduled_at,
        ch.brand,
        ch.name AS channel_name,
        ch.slug AS channel_slug,
        ci.id AS content_id,
        ci.title,
        ci.status,
        ci.target_post_at
      FROM content_channels cc
      INNER JOIN channels ch ON ch.id = cc.channel_id
      INNER JOIN content_items ci ON ci.id = cc.content_item_id
      WHERE substr(COALESCE(cc.scheduled_at, ci.target_post_at, ''), 1, 10) BETWEEN ? AND ?
      ORDER BY COALESCE(cc.scheduled_at, ci.target_post_at) ASC`,
    args: [range.start, range.end],
  });

  return {
    range,
    rows: result.rows as unknown as Array<{
      content_channel_id: number;
      scheduled_at: string | null;
      brand: Brand;
      channel_name: string;
      channel_slug: string;
      content_id: number;
      title: string;
      status: string;
      target_post_at: string | null;
    }>,
  };
}

export async function getCaptureSessionById(id: number) {
  const db = await getDb();
  const session = await db.execute({
    sql: "SELECT * FROM capture_sessions WHERE id = ?",
    args: [id],
  });
  const row = session.rows[0] as unknown as CaptureSession | undefined;

  if (!row) return null;

  const assets = await db.execute({
    sql: "SELECT * FROM assets WHERE capture_session_id = ? ORDER BY created_at DESC",
    args: [id],
  });

  return {
    session: row,
    assets: assets.rows as unknown as Asset[],
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

  return result.rows[0] as unknown as CaptureSession;
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

  return result.rows as unknown as Array<Asset & { linked_content_titles?: string | null }>;
}

export async function getWeeklyReviews() {
  const db = await getDb();
  const result = await db.execute("SELECT * FROM weekly_reviews ORDER BY week_iso DESC");
  return result.rows as unknown as WeeklyReview[];
}

export async function getWeeklyReview(week: string) {
  const db = await getDb();
  const review = await db.execute({
    sql: "SELECT * FROM weekly_reviews WHERE week_iso = ?",
    args: [week],
  });
  const content = await db.execute({
    sql: "SELECT id, title FROM content_items WHERE week_iso = ? ORDER BY target_post_at",
    args: [week],
  });

  return {
    review: (review.rows[0] as unknown as WeeklyReview | undefined) ?? null,
    content: content.rows as unknown as Array<{ id: number; title: string }>,
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
    nextPosts: nextPostsResult.rows as unknown as Array<{
      id: number;
      scheduled_at: string | null;
      channel_name: string;
      content_id: number;
      title: string;
      brand: Brand;
    }>,
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
        ch.name AS channel_name
      FROM content_items ci
      INNER JOIN content_channels cc ON cc.content_item_id = ci.id
      INNER JOIN channels ch ON ch.id = cc.channel_id
      WHERE ci.status IN ('scheduled', 'posted')
        AND (? IS NULL OR ci.brand = ?)
      ORDER BY COALESCE(ci.target_post_at, ci.created_at) ASC, ci.id, ch.id`,
    args: [
      filterBrand && filterBrand !== "all" ? filterBrand : null,
      filterBrand && filterBrand !== "all" ? filterBrand : null,
    ],
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
      scheduled_at: row.scheduled_at ? String(row.scheduled_at) : null,
      posted_url: row.posted_url ? String(row.posted_url) : null,
      channel_status: String(row.channel_status ?? ""),
    });
  }

  return Array.from(map.values());
}

export async function getPostedItemsWithChannels(filterBrand?: Brand | "all") {
  const db = await getDb();
  const result = await db.execute({
    sql: `SELECT
        ci.id AS content_id,
        ci.title,
        ci.brand,
        cc.id AS content_channel_id,
        cc.posted_url,
        ch.name AS channel_name
      FROM content_items ci
      INNER JOIN content_channels cc ON cc.content_item_id = ci.id
      INNER JOIN channels ch ON ch.id = cc.channel_id
      WHERE ci.status IN ('posted', 'tracked')
        AND cc.status = 'posted'
        AND (? IS NULL OR ci.brand = ?)
      ORDER BY ci.updated_at DESC, ci.id, ch.id`,
    args: [
      filterBrand && filterBrand !== "all" ? filterBrand : null,
      filterBrand && filterBrand !== "all" ? filterBrand : null,
    ],
  });

  const map = new Map<number, {
    content_id: number;
    title: string;
    brand: Brand;
    channels: Array<{
      content_channel_id: number;
      channel_name: string;
      posted_url: string | null;
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
      posted_url: row.posted_url ? String(row.posted_url) : null,
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
  return result.rows as unknown as Array<{
    id: number;
    title: string;
    total_engagement: number;
  }>;
}
