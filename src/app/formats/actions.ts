"use server";

import { revalidatePath } from "next/cache";
import { getDb, parseNullableInteger, parseText } from "@/lib/db";

export async function updateFormat(formData: FormData) {
  const id = parseNullableInteger(formData.get("id"));

  if (!id) {
    throw new Error("Format id is required.");
  }

  const db = await getDb();
  await db.execute({
    sql: `UPDATE formats
      SET hook_template = ?, body_template = ?, close_template = ?, examples_json = ?
      WHERE id = ?`,
    args: [
      parseText(formData.get("hook_template")),
      parseText(formData.get("body_template")),
      parseText(formData.get("close_template")),
      parseText(formData.get("examples_json")),
      id,
    ],
  });

  revalidatePath("/formats");
  revalidatePath("/content/new");
}

