import Link from "next/link";
import { CaptureChecklist } from "@/components/CaptureChecklist";
import { addAsset, completeSession } from "@/app/capture/actions";
import { getAssets, getOrCreateCurrentCaptureSession } from "@/lib/queries";

export default async function CapturePage() {
  const session = await getOrCreateCurrentCaptureSession();
  const assets = (await getAssets()).filter((asset) => asset.capture_session_id === session.id);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Step 7</p>
          <h1 className="section-title mt-2">This week&apos;s capture day</h1>
          <p className="muted mt-4 max-w-2xl">
            Tuesday flow, auto-created for the current ISO week, with the five repeatable sequences built in.
          </p>
        </div>
        <Link href={`/capture/${session.id}`} className="secondary-button">
          Open session permalink
        </Link>
      </section>

      <section className="app-card flex flex-wrap items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm font-semibold text-stone-500">Capture date</p>
          <p className="mt-1 text-xl font-bold">{session.capture_date}</p>
        </div>
        <span className="chip">{session.status}</span>
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

