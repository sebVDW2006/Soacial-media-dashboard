import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import path from "node:path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error("TURSO_DATABASE_URL is required.");
}

const client = createClient({ url, authToken });
const schema = readFileSync(path.join(process.cwd(), "src/lib/schema.sql"), "utf8");

for (const statement of schema.split(/;\s*\n/).map((part) => part.trim()).filter(Boolean)) {
  await client.execute(statement);
}

console.log("Schema applied.");

