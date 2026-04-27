import Link from "next/link";

const steps = [
  {
    step: "01",
    title: "Create content pieces",
    copy: "Start a new post or promote an idea into a real content piece.",
    href: "/content",
    cta: "Open content pieces",
  },
  {
    step: "02",
    title: "Edit the draft",
    copy: "Shape the hook, body, close, proof, and channel plan while the format stays visible.",
    href: "/content",
    cta: "Edit pieces",
  },
  {
    step: "03",
    title: "Schedule it",
    copy: "Place the content into the weekly calendar so the week has a clear publishing plan.",
    href: "/calendar",
    cta: "Open schedule",
  },
  {
    step: "04",
    title: "Post flow",
    copy: "Move work through drafting, captured, scheduled, posted, and tracked without losing momentum.",
    href: "/pipeline",
    cta: "View post flow",
  },
  {
    step: "05",
    title: "Capture data",
    copy: "Log KPI snapshots and see what formats, pillars, and channels are actually working.",
    href: "/kpis",
    cta: "Track data",
  },
];

export function WorkflowSteps() {
  return (
    <section className="app-card p-7 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <div className="eyebrow">Core workflow</div>
        <h2 className="sub-title mt-3 text-[var(--brand)]">The practical flow of the website.</h2>
        <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)] sm:text-base">
          Keep the top level very simple. Create the piece, edit it, schedule it, move it through posting, then track
          the data. Everything else supports those five actions.
        </p>
      </div>

      <div className="mt-8 grid gap-4 xl:grid-cols-5">
        {steps.map((step, index) => (
          <Link
            key={step.step}
            href={step.href}
            className={`soft-card block p-5 ${index === 0 ? "studio-accent-card" : ""}`}
          >
            <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-soft)]">
              Step {step.step}
            </div>
            <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.04em] text-[var(--brand)]">{step.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--ink-soft)]">{step.copy}</p>
            <div className="mt-5 text-sm font-semibold text-emerald-900">{step.cta}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
