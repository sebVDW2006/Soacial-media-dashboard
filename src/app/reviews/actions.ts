"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getDb, parseNullableInteger, parseText } from "@/lib/db";

export async function upsertReview(formData: FormData) {
  const weekIso = parseText(formData.get("week_iso"));

  if (!weekIso) {
    throw new Error("Week is required.");
  }

  const db = await getDb();
  const existing = await db.execute({
    sql: "SELECT id FROM weekly_reviews WHERE week_iso = ?",
    args: [weekIso],
  });

  if (existing.rows.length) {
    await db.execute({
      sql: `UPDATE weekly_reviews
        SET what_worked = ?, what_didnt = ?, next_week_focus = ?, top_content_id = ?
        WHERE week_iso = ?`,
      args: [
        parseText(formData.get("what_worked")),
        parseText(formData.get("what_didnt")),
        parseText(formData.get("next_week_focus")),
        parseNullableInteger(formData.get("top_content_id")),
        weekIso,
      ],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO weekly_reviews
        (week_iso, what_worked, what_didnt, next_week_focus, top_content_id)
        VALUES (?, ?, ?, ?, ?)`,
      args: [
        weekIso,
        parseText(formData.get("what_worked")),
        parseText(formData.get("what_didnt")),
        parseText(formData.get("next_week_focus")),
        parseNullableInteger(formData.get("top_content_id")),
      ],
    });
  }

  revalidatePath("/reviews");
  revalidatePath(`/reviews/${weekIso}`);
  revalidatePath("/");
  redirect(`/reviews/${weekIso}`);
}
