import { PaintingFeature } from "@/components/PaintingFeature";
import { ContentForm } from "@/components/ContentForm";
import { upsertContent } from "@/app/content/actions";
import { featuredInspiration } from "@/lib/inspiration";
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
      <section className="grid gap-8 2xl:grid-cols-[1.15fr_0.95fr]">
        <div className="app-card p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 1</p>
          <h1 className="section-title mt-2">Create content piece</h1>
          <p className="muted mt-4 max-w-2xl leading-8">
            Start from a clean brief, let the format seed empty fields, and choose the exact channels this post belongs to.
          </p>
        </div>

        <PaintingFeature
          artwork={featuredInspiration.content}
          eyebrow="Page atmosphere"
          title="Begin with a wider horizon."
          copy="A new piece should start with clarity, not clutter. Let the format guide the work while the space stays calm and elevated."
          heightClass="min-h-[380px]"
          align="top"
        />
      </section>
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
    </div>
  );
}
