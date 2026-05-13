import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "node:fs";
import path from "node:path";

let clientInstance: Client | null = null;
let initPromise: Promise<Client> | null = null;

function getEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is not set.`);
  }

  return value;
}

function getSchemaStatements() {
  const schemaPath = path.join(process.cwd(), "src/lib/schema.sql");
  const schema = readFileSync(schemaPath, "utf8");

  return schema
    .split(/;\s*\n/)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((sql) => ({
      sql,
      args: [],
    }));
}

async function ensureSchema(client: Client) {
  const statements = getSchemaStatements();
  // Batch all DDL statements in a single round trip instead of ~30 sequential calls
  await client.batch(statements, "write");
}

// Runs ALTER TABLE migrations for columns added after initial deploy.
// Each migration is wrapped in try/catch — if the column already exists, it's a no-op.
async function ensureMigrations(client: Client) {
  const migrations = [
    "ALTER TABLE content_items ADD COLUMN post_type TEXT NOT NULL DEFAULT 'single-image'",
    "ALTER TABLE content_items ADD COLUMN archived INTEGER NOT NULL DEFAULT 0",
    "ALTER TABLE content_items ADD COLUMN content_type TEXT",
    "ALTER TABLE content_items ADD COLUMN sub_pillar TEXT",
    "ALTER TABLE content_items ADD COLUMN storytelling_structure TEXT",
    "ALTER TABLE content_items ADD COLUMN performance_metrics TEXT",
    "ALTER TABLE content_items ADD COLUMN posted_at TEXT",
    "CREATE INDEX IF NOT EXISTS idx_content_content_type ON content_items(content_type)",
    "CREATE INDEX IF NOT EXISTS idx_content_sub_pillar ON content_items(sub_pillar)",
  ];
  for (const sql of migrations) {
    try {
      await client.execute(sql);
    } catch {
      // Column already exists — safe to ignore
    }
  }
  await rebuildContentItemsIfNeeded(client);
  await backfillTaxonomyForLegacyRows(client);
}

// The original schema had CHECK(status IN ('idea','drafting','captured','scheduled','posted','tracked')).
// The new workflow needs 'ready' and 'repurpose' too. SQLite can't ALTER a CHECK in place,
// so when we detect the legacy constraint we rebuild the table without it.
async function rebuildContentItemsIfNeeded(client: Client) {
  let tableSql = "";
  try {
    const meta = await client.execute({
      sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'content_items'",
      args: [],
    });
    tableSql = String(meta.rows[0]?.sql ?? "");
  } catch {
    return;
  }
  if (!tableSql || !tableSql.includes("'captured'")) return;

  await client.batch(
    [
      `CREATE TABLE content_items_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        format_id INTEGER NOT NULL REFERENCES formats(id),
        pillar_id INTEGER NOT NULL REFERENCES pillars(id),
        brand TEXT NOT NULL CHECK(brand IN ('seb', 'ublend')),
        content_type TEXT,
        sub_pillar TEXT,
        storytelling_structure TEXT,
        post_type TEXT NOT NULL DEFAULT 'linkedin-text-post',
        hook TEXT,
        body TEXT,
        close TEXT,
        status TEXT NOT NULL DEFAULT 'drafting',
        target_post_at TEXT,
        week_iso TEXT,
        notes TEXT,
        archived INTEGER NOT NULL DEFAULT 0,
        performance_metrics TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now')),
        posted_at TEXT
      )`,
      `INSERT INTO content_items_new (
        id, title, format_id, pillar_id, brand, content_type, sub_pillar, storytelling_structure, post_type,
        hook, body, close, status, target_post_at, week_iso, notes, archived,
        performance_metrics, created_at, updated_at, posted_at
      )
      SELECT
        id, title, format_id, pillar_id, brand, content_type, sub_pillar, storytelling_structure,
        CASE post_type
          WHEN 'text-post' THEN 'linkedin-text-post'
          WHEN 'single-image' THEN 'photo-post'
          WHEN 'story' THEN 'photo-post'
          WHEN 'reel' THEN 'reel-short'
          WHEN 'short-video' THEN 'reel-short'
          WHEN 'long-video' THEN 'reel-short'
          WHEN 'document' THEN 'document-post'
          ELSE COALESCE(post_type, 'linkedin-text-post')
        END,
        hook, body, close,
        CASE status
          WHEN 'captured' THEN 'ready'
          WHEN 'tracked' THEN 'posted'
          ELSE status
        END,
        target_post_at, week_iso, notes, archived, performance_metrics,
        created_at, updated_at, posted_at
      FROM content_items`,
      "DROP TABLE content_items",
      "ALTER TABLE content_items_new RENAME TO content_items",
      "CREATE INDEX IF NOT EXISTS idx_content_week ON content_items(week_iso)",
      "CREATE INDEX IF NOT EXISTS idx_content_status ON content_items(status)",
      "CREATE INDEX IF NOT EXISTS idx_content_content_type ON content_items(content_type)",
      "CREATE INDEX IF NOT EXISTS idx_content_sub_pillar ON content_items(sub_pillar)",
    ],
    "write",
  );
}

// One-time backfill: map legacy pillar_id values to content_type + sub_pillar for any rows
// that don't yet have them. Idempotent — only touches rows with NULL content_type or sub_pillar.
async function backfillTaxonomyForLegacyRows(client: Client) {
  const mappings: Array<{
    pillarSlug: string;
    brand: "seb" | "ublend";
    contentType: string;
    subPillar: string;
  }> = [
    { pillarSlug: "startup-journey", brand: "seb", contentType: "storytelling", subPillar: "founder-journey" },
    { pillarSlug: "startup-journey", brand: "ublend", contentType: "storytelling", subPillar: "behind-the-build" },
    { pillarSlug: "b2b-experience", brand: "seb", contentType: "educational", subPillar: "business-lessons" },
    { pillarSlug: "b2b-experience", brand: "ublend", contentType: "educational", subPillar: "b2b-education" },
    { pillarSlug: "healthy-eating", brand: "seb", contentType: "educational", subPillar: "discipline-lifestyle" },
    { pillarSlug: "healthy-eating", brand: "ublend", contentType: "educational", subPillar: "healthy-convenience" },
    { pillarSlug: "discipline-lifestyle", brand: "seb", contentType: "educational", subPillar: "discipline-lifestyle" },
    { pillarSlug: "discipline-lifestyle", brand: "ublend", contentType: "educational", subPillar: "healthy-convenience" },
    { pillarSlug: "faith-integrity", brand: "seb", contentType: "educational", subPillar: "faith-integrity" },
    { pillarSlug: "faith-integrity", brand: "ublend", contentType: "educational", subPillar: "mission-vision" },
  ];

  for (const m of mappings) {
    try {
      await client.execute({
        sql: `UPDATE content_items
          SET content_type = COALESCE(content_type, ?),
              sub_pillar = COALESCE(sub_pillar, ?)
          WHERE brand = ?
            AND pillar_id = (SELECT id FROM pillars WHERE slug = ? LIMIT 1)
            AND (content_type IS NULL OR sub_pillar IS NULL)`,
        args: [m.contentType, m.subPillar, m.brand, m.pillarSlug],
      });
    } catch {
      // Pillar may not exist on a clean install — safe to skip.
    }
  }
}

export async function getDb() {
  if (!clientInstance) {
    clientInstance = createClient({
      url: getEnv("TURSO_DATABASE_URL"),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  if (!initPromise) {
    const client = clientInstance;
    initPromise = ensureSchema(client)
      .then(() => ensureMigrations(client))
      .then(() => client)
      .catch((error) => {
        // Reset so a future call can retry — otherwise a single failed init
        // poisons the whole process and every page fails until restart.
        initPromise = null;
        throw error;
      });
  }

  return initPromise;
}

export function parseInteger(value: FormDataEntryValue | null, fallback = 0) {
  if (typeof value !== "string" || value.trim() === "") {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function parseNullableInteger(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function touchContentStatus(contentItemId: number) {
  const db = await getDb();
  const existing = await db.execute({
    sql: "SELECT status FROM content_items WHERE id = ?",
    args: [contentItemId],
  });
  const existingStatus = String(existing.rows[0]?.status ?? "drafting");
  // Don't overwrite manually-set workflow stages like 'ready' or 'repurpose'.
  // Only auto-advance from drafting/idea up through scheduled/posted.
  const autoStatuses = new Set(["idea", "drafting", "scheduled", "posted"]);
  if (!autoStatuses.has(existingStatus)) return;

  const channelCounts = await db.execute({
    sql: `SELECT
        COUNT(*) AS scheduled_count,
        SUM(CASE WHEN status = 'posted' THEN 1 ELSE 0 END) AS posted_count
      FROM content_channels
      WHERE content_item_id = ?`,
    args: [contentItemId],
  });
  const row = channelCounts.rows[0] as
    | {
        scheduled_count?: number | string | null;
        posted_count?: number | string | null;
      }
    | undefined;
  const postedCount = Number(row?.posted_count ?? 0);
  const scheduledCount = Number(row?.scheduled_count ?? 0);

  let nextStatus: "drafting" | "scheduled" | "posted" = "drafting";

  if (postedCount > 0) {
    nextStatus = "posted";
  } else if (scheduledCount > 0) {
    const content = await db.execute({
      sql: "SELECT target_post_at FROM content_items WHERE id = ?",
      args: [contentItemId],
    });
    if (content.rows[0]?.target_post_at) {
      nextStatus = "scheduled";
    }
  }

  await db.execute({
    sql: `UPDATE content_items
      SET status = ?,
          posted_at = CASE WHEN ? = 'posted' AND posted_at IS NULL THEN datetime('now') ELSE posted_at END,
          updated_at = datetime('now')
      WHERE id = ?`,
    args: [nextStatus, nextStatus, contentItemId],
  });
}
