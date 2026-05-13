import { notFound } from "next/navigation";
import { ContentForm } from "@/components/ContentForm";
import { DeleteButton } from "@/components/DeleteButton";
import { WeeklyPlanSidebar } from "@/components/WeeklyPlanSidebar";
import { upsertContent } from "@/app/content/actions";
import { getAssets, getContentById, getReferenceData } from "@/lib/queries";
import { getISOWeek } from "@/lib/week";

type ContentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statusLabels: Record<string, string> = {
  idea: "Idea",
  drafting: "Drafting",
  ready: "Ready",
  captured: "Ready",
  scheduled: "Scheduled",
  posted: "Posted",
  repurpose: "Repurpose",
  tracked: "Posted",
};

export default async function ContentDetailPage({ params, searchParams }: ContentDetailPageProps) {
  const { id } = await params;
  const sp = (await searchParams) ?? {};
  const contentId = Number(id);

  if (!Number.isFinite(contentId)) notFound();

  const detail = await getContentById(contentId);
  if (!detail) notFound();

  const { formats, pillars, channels } = await getReferenceData();
  const assets = await getAssets();
  const overrideWeek = typeof sp.week === "string" ? sp.week : undefined;
  const itemWeek = detail.item.week_iso ?? (detail.item.target_post_at ? getISOWeek(detail.item.target_post_at) : undefined);
  const sidebarWeek = overrideWeek ?? itemWeek;

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="section-title">{detail.item.title}</h1>
              <span className="chip">{statusLabels[detail.item.status] ?? detail.item.status}</span>
            </div>
            <p className="muted mt-2 text-sm">Write and refine the piece. Once it is scheduled or posted, track it from the Pipeline.</p>
          </div>
          <DeleteButton id={detail.item.id} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px] items-start">
        <ContentForm
          action={upsertContent}
          item={detail.item}
          linkedChannelIds={detail.channels.map((channel) => channel.channel_id)}
          linkedChannelSchedules={Object.fromEntries(
            detail.channels.map((channel) => [channel.channel_id, channel.scheduled_at]),
          )}
          linkedAssetIds={detail.assets.map((asset) => asset.id)}
          formats={formats}
          pillars={pillars}
          channels={channels}
          assets={assets}
        />
        <WeeklyPlanSidebar weekIso={sidebarWeek} date={detail.item.target_post_at} />
      </div>
    </div>
  );
}
