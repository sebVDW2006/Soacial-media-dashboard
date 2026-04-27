"use client";

import { useFormStatus } from "react-dom";
import type { Format } from "@/lib/types";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className="primary-button min-w-[140px]" disabled={pending}>
      {pending ? "Saving..." : "Add idea"}
    </button>
  );
}

export function IdeaQuickAdd({
  action,
  formats,
}: {
  action: (formData: FormData) => Promise<void>;
  formats: Format[];
}) {
  return (
    <form action={action} className="app-card sticky top-24 z-20 grid gap-4 p-4 md:grid-cols-[2fr_1fr_auto]">
      <div>
        <label htmlFor="title">Quick add</label>
        <input id="title" name="title" placeholder="New idea, angle, or proof point..." required />
      </div>
      <div>
        <label htmlFor="suggested_format_id">Suggested format</label>
        <select id="suggested_format_id" name="suggested_format_id" defaultValue="">
          <option value="">No format yet</option>
          {formats.map((format) => (
            <option key={format.id} value={format.id}>
              {format.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex items-end">
        <SubmitButton />
      </div>
    </form>
  );
}

