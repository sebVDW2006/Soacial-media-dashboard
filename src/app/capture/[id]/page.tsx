import { notFound } from "next/navigation";
import { CaptureChecklist } from "@/components/CaptureChecklist";
import { addAsset, completeSession } from "@/app/capture/actions";
import { getCaptureSessionById } from "@/lib/queries";

type CaptureSessionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CaptureSessionPage({ params }: CaptureSessionPageProps) {
  const { id } = await params;
  const detail = await getCaptureSessionById(Number(id));

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <section>
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-stone-500">Capture archive</p>
        <h1 className="section-title mt-2">{detail.session.capture_date}</h1>
        <p className="muted mt-4 max-w-2xl">Re-open any historical Tuesday session and keep adding assets if you need to.</p>
      </section>
      <CaptureChecklist
        session={detail.session}
        assets={detail.assets}
        addAssetAction={addAsset}
        completeAction={completeSession}
      />
    </div>
  );
}

