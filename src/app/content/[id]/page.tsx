import { notFound } from "next/navigation";
import { ContentForm } from "@/components/ContentForm";
import { DeleteButton } from "@/components/DeleteButton";
import { addKpi, markPosted, saveChannelSchedule, upsertContent } from "@/app/content/actions";
import { getAssets, getContentById, getReferenceData } from "@/lib/queries";
import { formatDateTimeLocal } from "@/lib/week";

type ContentDetailPageProps = {
  params: Promise<{ id: string }>;
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
            <h1 className="section-title">{detail.item.title}</h1>
            <p className="muted mt-2 text-sm">Edit the piece, schedule it, and log KPIs from this page.</p>
          </div>
          <DeleteButton id={detail.item.id} />
        </div>
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

      <section className="app-card space-y-5 p-6 sm:p-7">
        <div>
          <h2 className="sub-title">Schedule and post</h2>
          <p className="muted mt-2 text-sm">
            Set the date, mark it posted, and log KPIs per channel once it is live.
          </p>
        </div>

        {detail.channels.length ? (
          detail.channels.map((channel) => (
            <div key={channel.id} className="soft-card space-y-5 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-bold">{channel.channel_name}</h3>
                <form action={markPosted}>
                  <input type="hidden" name="content_channel_id" value={channel.id} />
                  <input type="hidden" name="content_item_id" value={detail.item.id} />
                  <button type="submit" className="primary-button">
                    Mark posted
                  </button>
                </form>
              </div>

              <form action={saveChannelSchedule} className="grid gap-4 sm:grid-cols-3">
                <input type="hidden" name="content_channel_id" value={channel.id} />
                <input type="hidden" name="content_item_id" value={detail.item.id} />
                <div>
                  <label>Scheduled date</label>
                  <input
                    name="scheduled_at"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(channel.scheduled_at)}
                  />
                </div>
                <div>
                  <label>Posted date</label>
                  <input
                    name="posted_at"
                    type="datetime-local"
                    defaultValue={formatDateTimeLocal(channel.posted_at)}
                  />
                </div>
                <div>
                  <label>Post URL</label>
                  <input name="posted_url" defaultValue={channel.posted_url ?? ""} placeholder="https://..." />
                </div>
                <div className="sm:col-span-3">
                  <button type="submit" className="secondary-button">
                    Save schedule
                  </button>
                </div>
              </form>

              <form action={addKpi} className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
                <input type="hidden" name="content_channel_id" value={channel.id} />
                <input type="hidden" name="content_item_id" value={detail.item.id} />
                <div>
                  <label>Impressions</label>
                  <input name="impressions" type="number" min="0" defaultValue="0" />
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
                  <label>Follows</label>
                  <input name="follows" type="number" min="0" defaultValue="0" />
                </div>
                <div>
                  <label>DMs / leads</label>
                  <input name="dms_or_leads" type="number" min="0" defaultValue="0" />
                </div>
                <div className="sm:col-span-3 lg:col-span-6">
                  <button type="submit" className="primary-button">
                    Save KPIs
                  </button>
                </div>
              </form>
            </div>
          ))
        ) : (
          <p className="muted text-sm">Add at least one channel above to unlock scheduling and KPIs.</p>
        )}
      </section>
    </div>
  );
}
