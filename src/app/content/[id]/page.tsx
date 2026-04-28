import { notFound } from "next/navigation";
import { ContentForm } from "@/components/ContentForm";
import { DeleteButton } from "@/components/DeleteButton";
import { WeeklyPlanSidebar } from "@/components/WeeklyPlanSidebar";
import { upsertContent } from "@/app/content/actions";
import { getAssets, getContentById, getReferenceData } from "@/lib/queries";

type ContentDetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels: Record<string, string> = {
  idea: "Idea",
  drafting: "Drafting",
  captured: "Captured",
  scheduled: "Scheduled",
  posted: "Posted",
  tracked: "Tracked",
};

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { id } = await params;
  const contentId = Number(id);

  if (!Number.isFinite(contentId)) notFound();

  const detail = await getContentById(contentId);
  if (!detail) notFound();

  const { formats, pillars, channels } = await getReferenceData();
  const assets = await getAssets();

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
          linkedAssetIds={detail.assets.map((asset) => asset.id)}
          formats={formats}
          pillars={pillars}
          channels={channels}
          assets={assets}
        />
        <WeeklyPlanSidebar />
      </div>
    </div>
  );
}
