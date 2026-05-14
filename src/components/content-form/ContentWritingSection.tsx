import { SubmitButton } from "@/components/content-form/SubmitButton";

type ContentWritingSectionProps = {
  hook: string;
  body: string;
  close: string;
  notes: string;
  backupLabel: string;
  recoveredDraftAt: string | null;
  onHookChange: (value: string) => void;
  onBodyChange: (value: string) => void;
  onCloseChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onDiscardRecoveredDraft: () => void;
};

export function ContentWritingSection({
  hook,
  body,
  close,
  notes,
  backupLabel,
  recoveredDraftAt,
  onHookChange,
  onBodyChange,
  onCloseChange,
  onNotesChange,
  onDiscardRecoveredDraft,
}: ContentWritingSectionProps) {
  return (
    <section className="app-card space-y-5 p-6 sm:p-7">
      <h2 className="sub-title">Write the post</h2>
      <div>
        <label htmlFor="hook">Hook</label>
        <textarea
          id="hook"
          name="hook"
          value={hook}
          onChange={(event) => onHookChange(event.target.value)}
          className="min-h-[120px]"
          placeholder="Opening line that stops the scroll"
        />
      </div>
      <div>
        <label htmlFor="body">Body</label>
        <textarea
          id="body"
          name="body"
          value={body}
          onChange={(event) => onBodyChange(event.target.value)}
          className="min-h-[240px]"
          placeholder="The substance of the post"
        />
      </div>
      <div>
        <label htmlFor="close">Close</label>
        <textarea
          id="close"
          name="close"
          value={close}
          onChange={(event) => onCloseChange(event.target.value)}
          className="min-h-[120px]"
          placeholder="Call to action or final thought"
        />
      </div>
      <div>
        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          className="min-h-[80px]"
          placeholder="Angle, audience, proof point, or edit note..."
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[var(--ink-soft)]" aria-live="polite">
          {backupLabel}
        </p>
        {recoveredDraftAt ? (
          <button
            type="button"
            onClick={onDiscardRecoveredDraft}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--ink)]"
          >
            Discard backup
          </button>
        ) : null}
      </div>
      <SubmitButton label="Save content" pendingLabel="Saving…" />
    </section>
  );
}
