import { notFound } from "next/navigation";
import { ContentForm } from "@/components/ContentForm";
import { PaintingFeature } from "@/components/PaintingFeature";
import { addKpi, markPosted, saveChannelSchedule, upsertContent } from "@/app/content/actions";
import { featuredInspiration } from "@/lib/inspiration";
import { getAssets, getContentById, getReferenceData } from "@/lib/queries";
import { formatDateTimeLocal } from "@/lib/week";

type ContentDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ContentDetailPage({ params }: ContentDetailPageProps) {
  const { id } = await params;
  const contentId = Number(id);

  if (!Number.isFinite(contentId)) {
    notFound();
  }

  const detail = await getContentById(contentId);

  if (!detail) {
    notFound();
  }

  const { formats, pillars, channels } = await getReferenceData();
  const assets = await getAssets();

  return (
    <div className="space-y-6">
      <section className="grid gap-8 2xl:grid-cols-[1.15fr_0.95fr]">
        <div className="app-card p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 2</p>
          <h1 className="section-title mt-2">{detail.item.title}</h1>
          <p className="muted mt-4 max-w-2xl leading-8">
            Edit the piece, then handle scheduling, posting, and KPI capture from the same page.
          </p>
        </div>

        <PaintingFeature
          artwork={featuredInspiration.content}
          eyebrow="Page atmosphere"
          title="Refine the piece without losing the mood."
          copy="The editor should feel composed and serious: one source piece, clear choices, and enough atmosphere to keep the work expressive."
          heightClass="min-h-[380px]"
          align="top"
        />
      </section>

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

      <section className="app-card space-y-5 p-5">
        <div>
          <h2 className="sub-title">Per-channel scheduling</h2>
          <p className="muted mt-2 text-sm">
            Schedule, post, and track each distribution stream independently.
          </p>
        </div>
        {detail.channels.length ? (
          detail.channels.map((channel) => (
            <div key={channel.id} className="soft-card space-y-4 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">{channel.channel_name}</h3>
                  <p className="text-sm text-stone-500">{channel.brand}</p>
                </div>
                <form action={markPosted}>
                  <input type="hidden" name="content_channel_id" value={channel.id} />
                  <input type="hidden" name="content_item_id" value={detail.item.id} />
                  <button type="submit" className="secondary-button">
                    Mark posted
                  </button>
                </form>
              </div>

              <form action={saveChannelSchedule} className="grid gap-4 xl:grid-cols-4">
                <input type="hidden" name="content_channel_id" value={channel.id} />
                <input type="hidden" name="content_item_id" value={detail.item.id} />
                <div>
                  <label>Scheduled at</label>
                  <input
                    name="scheduled_at"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(channel.scheduled_at)}
                  />
                </div>
                <div>
                  <label>Posted at</label>
                  <input
                    name="posted_at"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(channel.posted_at)}
                  />
                </div>
                <div>
                  <label>Posted URL</label>
                  <input name="posted_url" defaultValue={channel.posted_url ?? ""} />
                </div>
                <div className="flex items-end">
                  <button type="submit" className="secondary-button w-full">
                    Save schedule
                  </button>
                </div>
              </form>

              <form action={addKpi} className="grid gap-3 xl:grid-cols-6">
                <input type="hidden" name="content_channel_id" value={channel.id} />
                <input type="hidden" name="content_item_id" value={detail.item.id} />
                <div>
                  <label>Impressions</label>
                  <input name="impressions" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Views</label>
                  <input name="views" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Likes</label>
                  <input name="likes" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Comments</label>
                  <input name="comments" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Shares</label>
                  <input name="shares" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Saves</label>
                  <input name="saves" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Profile visits</label>
                  <input name="profile_visits" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Follows</label>
                  <input name="follows" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>Link clicks</label>
                  <input name="link_clicks" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>DMs / leads</label>
                  <input name="dms_or_leads" type="number" min="0" defaultValue="0" />
                </div>
                <div className="xl:col-span-2">
                  <label>Notes</label>
                  <input name="notes" />
                </div>
                <div className="xl:col-span-6">
                  <button type="submit" className="primary-button">
                    Add KPI snapshot
                  </button>
                </div>
              </form>
            </div>
          ))
        ) : (
          <p className="muted text-sm">Choose at least one channel above to unlock scheduling and KPI tracking.</p>
        )}
      </section>
    </div>
  );
}
