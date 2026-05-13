import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth";

function redirectToApp(request: Request, formData?: FormData) {
  const next = safeNextPath(formData?.get("next") ?? "/");
  return NextResponse.redirect(new URL(next, request.url));
}

export async function GET(request: Request) {
  return redirectToApp(request);
}

export async function POST(request: Request) {
  const formData = await request.formData();
  return redirectToApp(request, formData);
}

