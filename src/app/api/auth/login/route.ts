import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createSessionToken, getSessionCookieConfig } from "@/lib/auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");
  const configuredPassword = process.env.CONTENT_OS_PASSWORD;

  if (!configuredPassword || password !== configuredPassword) {
    return NextResponse.redirect(new URL(`/login?error=1&next=${encodeURIComponent(next)}`, request.url));
  }

  const cookieStore = await cookies();
  const token = await createSessionToken();
  cookieStore.set(getSessionCookieConfig().name, token, getSessionCookieConfig());

  return NextResponse.redirect(new URL(next, request.url));
}

