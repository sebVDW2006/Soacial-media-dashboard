import { createClient, type Client } from "@libsql/client";
import { readFileSync } from "node:fs";
import path from "node:path";
import { seedReferenceData } from "@/lib/seed";

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

  for (const statement of statements) {
    await client.execute(statement);
  }
}

async function ensureReferenceData(client: Client) {
  const checks = await Promise.all([
    client.execute("SELECT COUNT(*) AS count FROM pillars"),
    client.execute("SELECT COUNT(*) AS count FROM formats"),
    client.execute("SELECT COUNT(*) AS count FROM channels"),
  ]);

  const [pillarCount, formatCount, channelCount] = checks.map((result) =>
    Number(result.rows[0]?.count ?? 0),
  );

  if (pillarCount === 0 || formatCount === 0 || channelCount === 0) {
    await seedReferenceData(client);
  }
}

export async function getDb() {
  if (clientInstance && initPromise) {
    return initPromise;
  }

  if (!clientInstance) {
    clientInstance = createClient({
      url: getEnv("TURSO_DATABASE_URL"),
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
  }

  if (!initPromise) {
    initPromise = ensureSchema(clientInstance)
      .then(() => ensureReferenceData(clientInstance as Client))
      .then(() => clientInstance as Client);
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
  const scheduled = await db.execute({
    sql: `SELECT
        COUNT(*) AS scheduled_count,
        SUM(CASE WHEN posted_url IS NOT NULL AND posted_url != '' THEN 1 ELSE 0 END) AS posted_count
      FROM content_channels
      WHERE content_item_id = ?`,
    args: [contentItemId],
  });
  const row = scheduled.rows[0] as
    | {
        scheduled_count?: number | string | null;
        posted_count?: number | string | null;
      }
    | undefined;
  const postedCount = Number(row?.posted_count ?? 0);
  const scheduledCount = Number(row?.scheduled_count ?? 0);

  let nextStatus: "drafting" | "scheduled" | "posted" | "tracked" = "drafting";

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

  const tracked = await db.execute({
    sql: `SELECT COUNT(*) AS tracked_count
      FROM kpi_snapshots ks
      INNER JOIN content_channels cc ON cc.id = ks.content_channel_id
      WHERE cc.content_item_id = ?`,
    args: [contentItemId],
  });

  if (Number(tracked.rows[0]?.tracked_count ?? 0) > 0) {
    nextStatus = "tracked";
  }

  await db.execute({
    sql: "UPDATE content_items SET status = ?, updated_at = datetime('now') WHERE id = ?",
    args: [nextStatus, contentItemId],
  });
}
