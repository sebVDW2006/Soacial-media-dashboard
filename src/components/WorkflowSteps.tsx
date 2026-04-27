import Link from "next/link";
import { inspirationArtworks } from "@/lib/inspiration";

const steps = [
  {
    step: "01",
    title: "Build the piece",
    copy: "Pick the format, brand, and pillar. Write the hook, body, and close. Choose which platforms it goes to. Set the target date and move it into the pipeline. Everything about a piece is created here in one go.",
    href: "/content/new",
    cta: "Create piece",
    artwork: inspirationArtworks[10],
  },
  {
    step: "02",
    title: "Post it",
    copy: "Open the calendar to see the week. Use the pipeline to move pieces from drafted to scheduled to posted. Mark it live when it goes out.",
    href: "/pipeline",
    cta: "View pipeline",
    artwork: inspirationArtworks[11],
  },
  {
    step: "03",
    title: "Track and build on it",
    copy: "Once it is live, log the KPI data. See which formats, pillars, and channels are performing. Drop what is not working. Double down on what is.",
    href: "/kpis",
    cta: "Track data",
    artwork: inspirationArtworks[1],
  },
];

export function WorkflowSteps() {
  return (
    <section className="app-card p-7 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <div className="eyebrow">Core workflow</div>
        <h2 className="sub-title mt-3 text-[var(--brand)]">Three steps. That is the whole system.</h2>
        <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)] sm:text-base">
          Build the piece fully. Post it. Track what works. Everything in the app supports one of those three actions.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        {steps.map((step) => (
          <Link
            key={step.step}
            href={step.href}
            className="soft-card block h-full overflow-hidden"
          >
            <div
              className="h-28 w-full bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(180deg, rgba(10, 12, 11, 0.04), rgba(10, 12, 11, 0.22)), url(${step.artwork.src})`,
              }}
            />
            <div className="flex min-h-[238px] flex-col p-5">
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
                Step {step.step}
              </div>
              <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.04em] text-[var(--brand)]">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{step.copy}</p>
              <div className="mt-auto pt-5">
                <span className="chip active">{step.cta}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
