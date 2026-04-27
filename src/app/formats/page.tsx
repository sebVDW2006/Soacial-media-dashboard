import { updateFormat } from "@/app/formats/actions";
import { getReferenceData } from "@/lib/queries";

export default async function FormatsPage() {
  const { formats } = await getReferenceData();

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Reference templates</p>
        <h1 className="section-title mt-2">Formats</h1>
        <p className="muted mt-4 max-w-2xl">
          Edit the eight canonical hook/body/close templates without creating extra admin scaffolding.
        </p>
      </section>
      <div className="grid gap-4">
        {formats.map((format) => (
          <form key={format.id} action={updateFormat} className="app-card space-y-4 p-5">
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

