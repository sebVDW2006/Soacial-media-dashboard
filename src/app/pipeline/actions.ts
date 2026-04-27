"use server";

import { revalidatePath } from "next/cache";
import { getDb, parseNullableInteger, parseText } from "@/lib/db";

export async function moveStatus(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));
  const status = parseText(formData.get("status"));

  if (!id || !status) {
    throw new Error("Content item and status are required.");
  }

  const db = await getDb();
  await db.execute({
    sql: "UPDATE content_items SET status = ?, updated_at = datetime('now') WHERE id = ?",
    args: [status, id],
  });

  revalidatePath("/pipeline");
  revalidatePath(`/content/${id}`);
  revalidatePath("/");
}

