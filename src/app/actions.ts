"use server";

import { revalidatePath } from "next/cache";

export async function refreshAll() {
  revalidatePath("/");
  revalidatePath("/inbox");
  revalidatePath("/calendar");
  revalidatePath("/pipeline");
  revalidatePath("/capture");
  revalidatePath("/assets");
  revalidatePath("/formats");
  revalidatePath("/kpis");
  revalidatePath("/reviews");
}

