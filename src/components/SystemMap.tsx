const nodes = {
  left: [
    "Idea inbox",
    "Founder truth",
    "Venue insight",
  ],
  center: [
    "Tuesday capture day",
    "Draft workspace",
    "Format blueprint",
  ],
  right: [
    "Seb channels",
    "uBlend channels",
    "Review + KPIs",
  ],
};

export function SystemMap() {
  return (
    <section className="app-card p-7 sm:p-8 lg:p-10">
      <div className="max-w-3xl">
        <div className="eyebrow">System flow</div>
        <h2 className="sub-title mt-3 text-[var(--brand)]">Your content engine, not a generic dashboard.</h2>
        <p className="mt-4 text-sm leading-8 text-[var(--ink-soft)] sm:text-base">
          Every screen should point back to the real operating rhythm: capture source material once, turn it into
          distinct formats, distribute it with intention, then review what actually moved the brand forward.
        </p>
      </div>

      <div className="system-map mt-8">
        <div className="system-column">
          {nodes.left.map((node, index) => (
            <div key={node} className={`system-node ${index === 1 ? "accent" : ""}`}>
              {node}
            </div>
          ))}
        </div>

        <div className="system-spine">
          <div className="system-line" />
          {nodes.center.map((node, index) => (
            <div key={node} className={`system-node ${index === 0 || index === 1 ? "accent" : ""}`}>
              {node}
            </div>
          ))}
        </div>

        <div className="system-column">
          {nodes.right.map((node, index) => (
            <div key={node} className={`system-node ${index === 2 ? "accent" : ""}`}>
              {node}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
