import { ContentForm } from "@/components/ContentForm";
import { WeeklyPlanSidebar } from "@/components/WeeklyPlanSidebar";
import { upsertContent } from "@/app/content/actions";
import { getAssets, getReferenceData } from "@/lib/queries";

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
          initialTargetPostAt={defaultTarget(initialDate)}
        />
        <WeeklyPlanSidebar />
      </div>
    </div>
  );
}
