import { InspirationGallery } from "@/components/InspirationGallery";
import { PaintingFeature } from "@/components/PaintingFeature";
import { updateFormat } from "@/app/formats/actions";
import { featuredInspiration, inspirationArtworks } from "@/lib/inspiration";
import { getReferenceData } from "@/lib/queries";

export default async function FormatsPage() {
  const { formats } = await getReferenceData();

  return (
    <div className="space-y-8">
      <section className="grid gap-8 2xl:grid-cols-[1.1fr_0.9fr]">
        <div className="app-card p-8 sm:p-10 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Reference templates</p>
          <h1 className="section-title mt-2">Formats</h1>
          <p className="muted mt-4 max-w-2xl text-base leading-8">
            Edit the eight canonical hook, body, and close structures, but keep the page feeling like a studio wall,
            not a spreadsheet.
          </p>
        </div>

        <PaintingFeature
          artwork={featuredInspiration.formats}
          eyebrow="Creative inspiration"
          title="Structure can still feel beautiful."
          copy="Use the paintings as reminders of composition, atmosphere, and scale while you shape the repeatable formats."
          heightClass="min-h-[420px]"
          align="top"
        />
      </section>

      <InspirationGallery
        title="Composition references"
        copy="These references are here to keep the framework visually alive: sky, order, light, weather, and emotional range."
        artworks={[
          inspirationArtworks[6],
          inspirationArtworks[7],
          inspirationArtworks[11],
          inspirationArtworks[9],
        ]}
      />

      <div className="grid gap-4">
        {formats.map((format) => (
          <form key={format.id} action={updateFormat} className="app-card space-y-4 p-6 sm:p-7">
            <input type="hidden" name="id" value={format.id} />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">{format.name}</h2>
                <p className="mt-2 text-sm text-stone-500">
                  {format.best_for} • {format.pillar_hint}
                </p>
              </div>
              <span className="chip">{format.est_minutes ?? 0} min</span>
            </div>
            <div>
              <label>Hook template</label>
              <textarea name="hook_template" defaultValue={format.hook_template ?? ""} />
            </div>
            <div>
              <label>Body template</label>
              <textarea name="body_template" defaultValue={format.body_template ?? ""} />
            </div>
            <div>
              <label>Close template</label>
              <textarea name="close_template" defaultValue={format.close_template ?? ""} />
            </div>
            <div>
              <label>Examples JSON</label>
              <textarea name="examples_json" defaultValue={format.examples_json ?? "[]"} />
            </div>
            <button type="submit" className="secondary-button">
              Save format
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
