"use server";

import { revalidatePath } from "next/cache";
import { getDb, parseNullableInteger, parseText } from "@/lib/db";

export async function upsertAsset(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));
  const kind = parseText(formData.get("kind"));
  const title = parseText(formData.get("title"));
  const url = parseText(formData.get("url"));
  const captureSessionId = parseNullableInteger(formData.get("capture_session_id"));
  const capturedOn = parseText(formData.get("captured_on"));
  const notes = parseText(formData.get("notes"));

  if (!kind || !title) {
    throw new Error("Asset kind and title are required.");
  }

  const db = await getDb();

  if (id) {
    await db.execute({
      sql: `UPDATE assets
        SET kind = ?, title = ?, url = ?, capture_session_id = ?, captured_on = ?, notes = ?
        WHERE id = ?`,
      args: [kind, title, url, captureSessionId, capturedOn, notes, id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO assets
        (kind, title, url, capture_session_id, captured_on, notes)
        VALUES (?, ?, ?, ?, ?, ?)`,
      args: [kind, title, url, captureSessionId, capturedOn, notes],
    });
  }

  revalidatePath("/assets");
  revalidatePath("/capture");
}

export async function deleteAsset(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));

  if (!id) {
    throw new Error("Asset id is required.");
  }

  const db = await getDb();
  await db.execute({
    sql: "DELETE FROM assets WHERE id = ?",
    args: [id],
  });

  revalidatePath("/assets");
  revalidatePath("/capture");
}

