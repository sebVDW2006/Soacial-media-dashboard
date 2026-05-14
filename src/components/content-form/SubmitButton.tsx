"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label?: string;
  pendingLabel?: string;
  className?: string;
};

export function SubmitButton({
  label = "Save content",
  pendingLabel = "Saving…",
  className = "primary-button",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} aria-busy={pending}>
      {pending ? pendingLabel : label}
    </button>
  );
}
