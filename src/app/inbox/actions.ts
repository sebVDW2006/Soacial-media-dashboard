"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, parseNullableInteger, parseText } from "@/lib/db";

function inferBrand(bestFor: string | null) {
  return bestFor?.toLowerCase().includes("seb") ? "seb" : "ublend";
}

export async function createIdea(formData: FormData) {
  const title = parseText(formData.get("title"));
  const suggestedFormatId = parseNullableInteger(formData.get("suggested_format_id"));

  if (!title) {
    throw new Error("Idea title is required.");
  }

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO ideas (title, suggested_format_id, status)
      VALUES (?, ?, 'idea')`,
    args: [title, suggestedFormatId],
  });

  revalidatePath("/inbox");
  revalidatePath("/");
}

export async function promoteIdea(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));

  if (!id) {
    throw new Error("Idea id is required.");
  }

  const db = await getDb();
  const ideaResult = await db.execute({
    sql: "SELECT * FROM ideas WHERE id = ?",
    args: [id],
  });
  const idea = ideaResult.rows[0];

  if (!idea) {
    throw new Error("Idea not found.");
  }

  const formatId =
    Number(idea.suggested_format_id ?? 0) ||
    Number((await db.execute("SELECT id FROM formats ORDER BY id LIMIT 1")).rows[0]?.id ?? 1);
  const pillarId =
    Number(idea.suggested_pillar_id ?? 0) ||
    Number((await db.execute("SELECT id FROM pillars ORDER BY id LIMIT 1")).rows[0]?.id ?? 1);
  const format = await db.execute({
    sql: "SELECT best_for FROM formats WHERE id = ?",
    args: [formatId],
  });

  const inserted = await db.execute({
    sql: `INSERT INTO content_items
      (title, format_id, pillar_id, brand, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'drafting', datetime('now'), datetime('now'))`,
    args: [idea.title, formatId, pillarId, inferBrand(String(format.rows[0]?.best_for ?? null))],
  });
  const contentId = Number(inserted.lastInsertRowid);

  await db.execute({
    sql: `UPDATE ideas
      SET status = 'promoted', promoted_to_content_id = ?
      WHERE id = ?`,
    args: [contentId, id],
  });

  revalidatePath("/inbox");
  revalidatePath("/pipeline");
  revalidatePath("/");
  redirect(`/content/${contentId}`);
}

export async function deleteIdea(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));

  if (!id) {
    throw new Error("Idea id is required.");
  }

  const db = await getDb();
  await db.execute({
    sql: "UPDATE ideas SET status = 'dropped' WHERE id = ?",
    args: [id],
  });

  revalidatePath("/inbox");
  revalidatePath("/");
}

