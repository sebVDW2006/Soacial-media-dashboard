type KpiBarItem = {
  label: string;
  impressions: number;
  engagement_rate: number;
  follows: number;
  dms_or_leads: number;
};

export function KPIBars({
  title,
  rows,
  metric,
}: {
  title: string;
  rows: KpiBarItem[];
  metric: "impressions" | "engagement_rate" | "follows" | "dms_or_leads";
}) {
  const max = Math.max(...rows.map((row) => row[metric]), 1);

  return (
    <section className="soft-card p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="sub-title">{title}</h3>
        <span className="text-sm font-semibold text-stone-500">{metric.replaceAll("_", " ")}</span>
      </div>
      <div className="space-y-3">
        {rows.length ? (
          rows.map((row) => {
            const rawValue = row[metric];
            const percentage = (rawValue / max) * 100;
            const displayValue =
              metric === "engagement_rate" ? `${(rawValue * 100).toFixed(1)}%` : `${rawValue}`;

            return (
              <div key={`${title}-${row.label}`}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm font-semibold">
                  <span>{row.label}</span>
                  <span className="text-stone-500">{displayValue}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-200">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-gold to-ember"
                    style={{ width: `${Math.max(8, percentage)}%` }}
                  />
                </div>
              </div>
            );
          })
        ) : (
          <p className="muted text-sm">No KPI data yet for this range.</p>
        )}
      </div>
    </section>
  );
}

