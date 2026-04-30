import { ContentForm } from "@/components/ContentForm";
import { WeeklyPlanSidebar } from "@/components/WeeklyPlanSidebar";
import { upsertContent } from "@/app/content/actions";
import { getAssets, getReferenceData } from "@/lib/queries";
import type { PostType } from "@/lib/types";
import { getISOWeek } from "@/lib/week";

type NewContentPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function defaultTarget(date?: string) {
  return date ? `${date}T09:00` : "";
}

export default async function NewContentPage({ searchParams }: NewContentPageProps) {
  const params = (await searchParams) ?? {};
  const initialBrand =
    typeof params.brand === "string" && params.brand === "ublend" ? "ublend" : "seb";
  const initialDate = typeof params.date === "string" ? params.date : undefined;
  const { formats, pillars, channels } = await getReferenceData();
  const assets = await getAssets();
  const initialFormatId =
    typeof params.format === "string"
      ? formats.find((format) => format.slug === params.format)?.id
      : undefined;
  const initialPillarId =
    typeof params.pillar === "string"
      ? pillars.find((pillar) => pillar.slug === params.pillar)?.id
      : undefined;
  const initialChannelIds =
    typeof params.channel === "string"
      ? channels.filter((channel) => channel.slug === params.channel).map((channel) => channel.id)
      : [];
  const initialPostType =
    typeof params.postType === "string" ? (params.postType as PostType) : undefined;
  const initialWeekIso = initialDate ? getISOWeek(initialDate) : undefined;

  return (
    <div className="space-y-6">
      <section className="app-card p-7 sm:p-8">
        <h1 className="section-title">Create content piece</h1>
        <p className="muted mt-2 text-sm">
          Fill in the details, write the post, and save. The weekly plan on the right shows what still needs to be made this week.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_300px] items-start">
        <ContentForm
          action={upsertContent}
          linkedChannelIds={[]}
          linkedAssetIds={[]}
          formats={formats}
          pillars={pillars}
          channels={channels}
          assets={assets}
          initialBrand={initialBrand}
          initialFormatId={initialFormatId}
          initialPillarId={initialPillarId}
          initialChannelIds={initialChannelIds}
          initialPostType={initialPostType}
          initialTargetPostAt={defaultTarget(initialDate)}
        />
        <WeeklyPlanSidebar weekIso={initialWeekIso} date={initialDate} />
      </div>
    </div>
  );
}
