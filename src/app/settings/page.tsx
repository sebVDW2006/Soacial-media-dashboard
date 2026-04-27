import { getReferenceData } from "@/lib/queries";

export default async function SettingsPage() {
  const { channels } = await getReferenceData();
  const dbUrl = process.env.TURSO_DATABASE_URL ?? "";
  let host = "";

  try {
    host = dbUrl ? new URL(dbUrl).host : "";
  } catch {
    host = dbUrl;
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Read-only settings</p>
        <h1 className="section-title mt-2">Settings</h1>
        <p className="muted mt-4 max-w-2xl">
          Reference channels, the connected Turso host, and the reminder that password resets happen via env vars.
        </p>
      </section>

      <section className="app-card p-5">
        <h2 className="sub-title">Channels</h2>
        <div className="mt-4 grid gap-3">
          {channels.map((channel) => (
            <div key={channel.id} className="soft-card flex items-center justify-between gap-3 px-4 py-3">
              <span className="font-semibold">{channel.name}</span>
              <span className="chip">{channel.brand}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="app-card space-y-4 p-5">
        <div>
          <p className="text-sm font-semibold text-stone-500">Turso host</p>
          <p className="mt-1 text-lg font-bold">{host || "Not configured"}</p>
        </div>
        <p className="muted text-sm">
          Password changes are handled by updating `CONTENT_OS_PASSWORD` in the environment.
        </p>
      </section>
    </div>
  );
}

