import { deleteAsset, upsertAsset } from "@/app/assets/actions";
import { getDb } from "@/lib/db";
import { getAssets } from "@/lib/queries";
import type { Brand } from "@/lib/types";

type AssetsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AssetsPage({ searchParams }: AssetsPageProps) {
  const params = (await searchParams) ?? {};
  const filters: Parameters<typeof getAssets>[0] = {
    kind: typeof params.kind === "string" ? params.kind : "all",
    captureSessionId:
      typeof params.captureSessionId === "string" ? params.captureSessionId : "all",
    brand:
      typeof params.brand === "string" && (params.brand === "seb" || params.brand === "ublend")
        ? (params.brand as Brand)
        : "all",
  };
  const assets = await getAssets(filters);
  const db = await getDb();
  const captureSessions = await db.execute(
    "SELECT id, capture_date FROM capture_sessions ORDER BY capture_date DESC",
  );

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 8</p>
        <h1 className="section-title mt-2">Asset library</h1>
        <p className="muted mt-4 max-w-2xl">
          Reference footage, proof clips, and photos, all reusable across multiple content items.
        </p>
      </section>

      <form className="app-card grid gap-4 p-5 md:grid-cols-4">
        <div>
          <label>Kind</label>
          <select name="kind" defaultValue={filters.kind}>
            <option value="all">All kinds</option>
            <option value="founder_clip">Founder clip</option>
            <option value="product_clip">Product clip</option>
            <option value="lifestyle_clip">Lifestyle clip</option>
            <option value="proof_clip">Proof clip</option>
            <option value="photo">Photo</option>
            <option value="branding">Branding</option>
          </select>
        </div>
        <div>
          <label>Capture session</label>
          <select name="captureSessionId" defaultValue={filters.captureSessionId}>
            <option value="all">All sessions</option>
            {captureSessions.rows.map((row) => (
              <option key={String(row.id)} value={String(row.id)}>
                {String(row.capture_date)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label>Brand relevance</label>
          <select name="brand" defaultValue={filters.brand}>
            <option value="all">All brands</option>
            <option value="seb">Seb</option>
            <option value="ublend">uBlend</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="secondary-button w-full">
            Apply filters
          </button>
        </div>
      </form>

      <div className="grid gap-4 xl:grid-cols-2">
        {assets.map((asset) => (
          <article key={asset.id} className="app-card overflow-hidden">
            {asset.url && /\.(png|jpe?g|gif|webp|avif)$/i.test(asset.url) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.url} alt={asset.title} className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 items-center justify-center bg-stone-100 font-semibold text-stone-500">
                {asset.kind.replaceAll("_", " ")}
              </div>
            )}
            <div className="space-y-4 p-5">
              <div>
                <h2 className="text-xl font-bold">{asset.title}</h2>
                <p className="mt-2 text-sm text-stone-500">
                  {asset.captured_on ?? "No capture date"} • {asset.linked_content_titles ?? "No linked content yet"}
                </p>
              </div>
              <form action={upsertAsset} className="grid gap-3">
                <input type="hidden" name="id" value={asset.id} />
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label>Title</label>
                    <input name="title" defaultValue={asset.title} />
                  </div>
                  <div>
                    <label>Kind</label>
                    <select name="kind" defaultValue={asset.kind}>
                      <option value="founder_clip">Founder clip</option>
                      <option value="product_clip">Product clip</option>
                      <option value="lifestyle_clip">Lifestyle clip</option>
                      <option value="proof_clip">Proof clip</option>
                      <option value="photo">Photo</option>
                      <option value="branding">Branding</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label>URL</label>
                  <input name="url" defaultValue={asset.url ?? ""} />
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <label>Capture session id</label>
                    <input
                      name="capture_session_id"
                      type="number"
                      defaultValue={asset.capture_session_id ?? ""}
                    />
                  </div>
                  <div>
                    <label>Captured on</label>
                    <input name="captured_on" type="date" defaultValue={asset.captured_on ?? ""} />
                  </div>
                </div>
                <div>
                  <label>Notes</label>
                  <textarea name="notes" defaultValue={asset.notes ?? ""} />
                </div>
                <div className="flex flex-wrap gap-3">
                  <button type="submit" className="secondary-button">
                    Save asset
                  </button>
                </div>
              </form>
              <form action={deleteAsset}>
                <input type="hidden" name="id" value={asset.id} />
                <button type="submit" className="danger-button">
                  Delete asset
                </button>
              </form>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
