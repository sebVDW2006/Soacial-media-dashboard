import Link from "next/link";

const surfaces = [
  {
    href: "/capture",
    label: "Capture day",
    title: "One place for founder clips, product proof, lifestyle, and photos.",
    copy: "Treat Tuesday like a source-material studio. Log the assets once, then reuse them all week.",
  },
  {
    href: "/content/new",
    label: "Drafting",
    title: "Write with the format, voice, proof, and cue visible beside you.",
    copy: "The editor should help you think clearly, not bury you in fields.",
  },
  {
    href: "/formats",
    label: "Formats",
    title: "Keep the eight repeatable formats alive as a creative system.",
    copy: "Each format holds structure, mood, proof, and the real job that post has to do.",
  },
];

export function WorkspaceDeck() {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      {surfaces.map((surface, index) => (
        <Link
          key={surface.href}
          href={surface.href}
          className={`app-card block p-7 sm:p-8 ${index === 0 ? "studio-accent-card" : ""}`}
        >
          <div className="eyebrow">{surface.label}</div>
          <h3 className="mt-4 text-[1.7rem] font-semibold tracking-[-0.05em] text-[var(--brand)]">
            {surface.title}
          </h3>
          <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)]">{surface.copy}</p>
          <div className="mt-8">
            <span className="chip active">Open workspace</span>
          </div>
        </Link>
      ))}
    </section>
  );
}
