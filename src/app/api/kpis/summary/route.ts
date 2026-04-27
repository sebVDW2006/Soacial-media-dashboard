import { NextResponse } from "next/server";
import { getKpiSummaryRows } from "@/lib/queries";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const groupBy = url.searchParams.get("groupBy");
  const range = Number(url.searchParams.get("range") ?? "30");

  if (!groupBy || !["format", "pillar", "channel", "brand"].includes(groupBy)) {
    return NextResponse.json({ error: "Invalid groupBy" }, { status: 400 });
  }

  try {
    const summary = await getKpiSummaryRows(
      groupBy as "format" | "pillar" | "channel" | "brand",
      Number.isFinite(range) ? range : 30,
    );

    return NextResponse.json({ groupBy, range, summary });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to fetch KPI summary.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

