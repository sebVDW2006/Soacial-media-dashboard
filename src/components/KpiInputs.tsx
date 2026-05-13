"use client";

import { useId, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

type Metrics = {
  impressions: number;
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  link_clicks: number;
  follows: number;
  dms_or_leads: number;
};

type KpiInputsProps = {
  action: (formData: FormData) => Promise<void>;
  contentChannelId: number;
  contentItemId: number;
  initial: Metrics;
  postedUrl: string | null;
  postAnalyticsId: number | null;
  snapshotId: number | null;
  analyticsStatus: string | null;
};

const PRIMARY_FIELDS: Array<[keyof Metrics, string]> = [
  ["likes", "Likes"],
  ["comments", "Comments"],
  ["shares", "Shares"],
  ["saves", "Saves"],
  ["impressions", "Impressions"],
  ["reach", "Reach"],
];

const ADVANCED_FIELDS: Array<[keyof Metrics, string]> = [
  ["views", "Views"],
  ["link_clicks", "Clicks"],
  ["follows", "Follows"],
  ["dms_or_leads", "DMs / leads"],
];

const PASTE_PATTERNS: Array<[keyof Metrics, RegExp]> = [
  ["impressions", /impression[s]?[\s:]*([0-9,]+)/i],
  ["reach", /reach(?:ed accounts?)?[\s:]*([0-9,]+)/i],
  ["likes", /(?:likes|reactions)[\s:]*([0-9,]+)/i],
  ["comments", /comments?[\s:]*([0-9,]+)/i],
  ["shares", /(?:shares|reposts|sends|shared)[\s:]*([0-9,]+)/i],
  ["saves", /saves?[\s:]*([0-9,]+)/i],
  ["views", /(?:plays|views)[\s:]*([0-9,]+)/i],
  ["link_clicks", /(?:link clicks?|clicks?)[\s:]*([0-9,]+)/i],
  ["follows", /(?:new follows?|follows?|followers gained)[\s:]*([0-9,]+)/i],
  ["dms_or_leads", /(?:dms?|messages|leads)[\s:]*([0-9,]+)/i],
];

function SaveButton({ snapshotId, isOverride }: { snapshotId: number | null; isOverride: boolean }) {
  const { pending } = useFormStatus();
  const label = pending
    ? "Saving..."
    : isOverride
      ? "Save manual override"
      : snapshotId
        ? "Update KPIs"
        : "Save KPIs";

  return (
    <button type="submit" className="primary-button" disabled={pending}>
      {label}
    </button>
  );
}

export function KpiInputs({
  action,
  contentChannelId,
  contentItemId,
  initial,
  postedUrl,
  postAnalyticsId,
  snapshotId,
  analyticsStatus,
}: KpiInputsProps) {
  const [metrics, setMetrics] = useState<Metrics>(initial);
  const [showAdvanced, setShowAdvanced] = useState(() =>
    ADVANCED_FIELDS.some(([key]) => initial[key] > 0),
  );
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  const pasteId = useId();

  const engagementRate = useMemo(() => {
    const denom = metrics.reach || metrics.impressions;
    if (!denom) return null;
    const interactions = metrics.likes + metrics.comments + metrics.shares + metrics.saves;
    return (interactions / denom) * 100;
  }, [metrics]);

  const totalInteractions =
    metrics.likes + metrics.comments + metrics.shares + metrics.saves;

  const updateField = (key: keyof Metrics, raw: string) => {
    const numeric = raw === "" ? 0 : Number(raw);
    if (Number.isNaN(numeric)) return;
    setMetrics((prev) => ({ ...prev, [key]: Math.max(0, numeric) }));
  };

  const parsePaste = () => {
    if (!pasteText.trim()) {
      setPasteFeedback("Paste some text first.");
      return;
    }

    const next: Metrics = { ...metrics };
    const matched: string[] = [];

    for (const [key, pattern] of PASTE_PATTERNS) {
      const match = pasteText.match(pattern);
      if (!match) continue;
      const value = Number(match[1].replace(/,/g, ""));
      if (Number.isFinite(value)) {
        next[key] = value;
        matched.push(key);
      }
    }

    if (!matched.length) {
      setPasteFeedback("Couldn't find any numbers. Make sure labels (Reach, Likes, etc.) are in the text.");
      return;
    }

    setMetrics(next);
    setPasteFeedback(`Filled ${matched.length} field${matched.length === 1 ? "" : "s"} from pasted text.`);
    setPasteText("");
    if (ADVANCED_FIELDS.some(([key]) => matched.includes(key))) {
      setShowAdvanced(true);
    }
  };

  const isOverride = analyticsStatus === "synced";

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="content_channel_id" value={contentChannelId} />
      <input type="hidden" name="content_item_id" value={contentItemId} />
      {postAnalyticsId && (
        <input type="hidden" name="post_analytics_id" value={postAnalyticsId} />
      )}
      {snapshotId && <input type="hidden" name="snapshot_id" value={snapshotId} />}

      {/* Post URL */}
      <div>
        <label htmlFor={`posted_url_${contentChannelId}`}>Post URL</label>
        <input
          id={`posted_url_${contentChannelId}`}
          name="posted_url"
          type="url"
          defaultValue={postedUrl ?? ""}
          placeholder="https://..."
        />
      </div>

      {/* Paste from Insights */}
      <div className="rounded-[22px] border border-[var(--line)] bg-white/60">
        <button
          type="button"
          onClick={() => {
            setPasteOpen((prev) => !prev);
            setPasteFeedback(null);
          }}
          className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)]"
          aria-expanded={pasteOpen}
        >
          <span>Paste from Insights</span>
          <span aria-hidden>{pasteOpen ? "−" : "+"}</span>
        </button>
        {pasteOpen && (
          <div className="space-y-3 border-t border-[var(--line)] p-4">
            <p className="muted text-sm">
              Long-press → copy from the Instagram Insights screen (or LinkedIn analytics) and paste here. We&apos;ll pull out the numbers automatically.
            </p>
            <textarea
              id={pasteId}
              value={pasteText}
              onChange={(event) => setPasteText(event.target.value)}
              placeholder={"Reach\n1,234\nLikes\n56\nComments\n7"}
              className="min-h-[120px]"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button type="button" onClick={parsePaste} className="secondary-button">
                Pull out numbers
              </button>
              {pasteFeedback && (
                <p className="text-sm text-[var(--ink-soft)]">{pasteFeedback}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Primary KPI grid */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {PRIMARY_FIELDS.map(([key, label]) => (
          <div key={key}>
            <label htmlFor={`${key}_${contentChannelId}`}>{label}</label>
            <input
              id={`${key}_${contentChannelId}`}
              name={key}
              type="number"
              inputMode="numeric"
              min="0"
              value={metrics[key] || ""}
              onChange={(event) => updateField(key, event.target.value)}
              placeholder="0"
            />
          </div>
        ))}
      </div>

      {/* Live engagement rate */}
      <div className="soft-card flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="eyebrow">Engagement rate</span>
          <span className="text-2xl font-semibold tracking-[-0.04em]">
            {engagementRate === null ? "—" : `${engagementRate.toFixed(2)}%`}
          </span>
        </div>
        <p className="text-sm text-[var(--ink-soft)]">
          {engagementRate === null
            ? "Add reach or impressions to calculate."
            : `${totalInteractions.toLocaleString("en-GB")} interactions / ${(metrics.reach || metrics.impressions).toLocaleString("en-GB")} ${metrics.reach ? "reached" : "impressions"}`}
        </p>
      </div>

      {/* Advanced toggle + fields */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowAdvanced((prev) => !prev)}
          className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--ink-soft)] hover:text-[var(--brand)]"
          aria-expanded={showAdvanced}
        >
          {showAdvanced ? "Hide" : "Show"} more metrics
        </button>
        {showAdvanced && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {ADVANCED_FIELDS.map(([key, label]) => (
              <div key={key}>
                <label htmlFor={`${key}_${contentChannelId}`}>{label}</label>
                <input
                  id={`${key}_${contentChannelId}`}
                  name={key}
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={metrics[key] || ""}
                  onChange={(event) => updateField(key, event.target.value)}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        )}
        {!showAdvanced &&
          ADVANCED_FIELDS.map(([key]) => (
            <input key={key} type="hidden" name={key} value={metrics[key]} />
          ))}
      </div>

      {isOverride && (
        <p className="muted text-sm">Saving will mark this as a manual override.</p>
      )}

      <div>
        <SaveButton snapshotId={snapshotId} isOverride={isOverride} />
      </div>
    </form>
  );
}
