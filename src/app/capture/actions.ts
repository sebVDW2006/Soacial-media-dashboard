"use server";

import { revalidatePath } from "next/cache";
import { getDb, parseNullableInteger, parseText } from "@/lib/db";

export async function addAsset(formData: FormData) {
  const captureSessionId = parseNullableInteger(formData.get("capture_session_id"));
  const kind = parseText(formData.get("kind"));
  const title = parseText(formData.get("title"));
  const url = parseText(formData.get("url"));
  const capturedOn = parseText(formData.get("captured_on"));

  if (!captureSessionId || !kind || !title) {
    throw new Error("Capture session, kind, and title are required.");
  }

  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO assets
      (kind, title, url, capture_session_id, captured_on, notes)
      VALUES (?, ?, ?, ?, ?, '')`,
    args: [kind, title, url, captureSessionId, capturedOn],
  });

  revalidatePath("/capture");
  revalidatePath(`/capture/${captureSessionId}`);
  revalidatePath("/assets");
}

export async function completeSession(formData: FormData) {
  const captureSessionId = parseNullableInteger(formData.get("capture_session_id"));

  if (!captureSessionId) {
    throw new Error("Capture session is required.");
  }

  const db = await getDb();
  await db.execute({
    sql: "UPDATE capture_sessions SET status = 'done' WHERE id = ?",
    args: [captureSessionId],
  });

  revalidatePath("/capture");
  revalidatePath(`/capture/${captureSessionId}`);
  revalidatePath("/");
}

