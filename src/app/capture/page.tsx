import Link from "next/link";
import { CaptureChecklist } from "@/components/CaptureChecklist";
import { addAsset, completeSession } from "@/app/capture/actions";
import { weeklyFlow } from "@/lib/content-framework";
import { getAssets, getOrCreateCurrentCaptureSession } from "@/lib/queries";

export default async function CapturePage() {
  const session = await getOrCreateCurrentCaptureSession();
  const assets = (await getAssets()).filter((asset) => asset.capture_session_id === session.id);

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="app-card p-7 sm:p-9">
          <div className="flex flex-wrap gap-2">
            <span className="chip active">Tuesday capture day</span>
            <span className="chip">One capture space</span>
            <span className="chip">Draft all week</span>
          </div>

          <h1 className="section-title mt-5 max-w-4xl text-[var(--brand)]">
            Capture once. Draft with clarity all week.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--ink-soft)] sm:text-lg">
            This page is your single capture space. Log the founder clip, product shots, lifestyle footage, proof,
            and photos here first, then use them to draft Monday through Friday without hunting around.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={`/capture/${session.id}`} className="secondary-button">
              Open session permalink
            </Link>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="soft-card p-4">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Capture date
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand)]">
                {session.capture_date}
              </div>
            </div>
            <div className="soft-card p-4">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Status
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand)]">
                {session.status}
              </div>
            </div>
            <div className="soft-card p-4">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Assets logged
              </div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-[var(--brand)]">
                {assets.length}
              </div>
            </div>
          </div>
        </div>

        <div className="app-card p-6 sm:p-7">
          <div className="eyebrow">Weekly flow</div>
          <h2 className="mt-3 text-[2rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
            Tuesday creates the week
          </h2>
          <div className="mt-5 space-y-4">
            {weeklyFlow.map((item) => (
              <div key={item.day} className="rounded-[22px] border border-[var(--line)] bg-white/55 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                      {item.day}
                    </div>
                    <div className="mt-1 text-lg font-semibold tracking-[-0.03em] text-[var(--brand)]">
                      {item.title}
                    </div>
                  </div>
                  <span className="chip">{item.output}</span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CaptureChecklist
        session={session}
        assets={assets}
        addAssetAction={addAsset}
        completeAction={completeSession}
      />
    </div>
  );
}
