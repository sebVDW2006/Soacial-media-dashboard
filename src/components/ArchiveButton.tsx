"use client";

import { archiveContent, unarchiveContent } from "@/app/content/actions";

type ArchiveButtonProps = {
  id: number;
  archived: boolean;
};

export function ArchiveButton({ id, archived }: ArchiveButtonProps) {
  return (
    <form action={archived ? unarchiveContent : archiveContent}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="secondary-button">
        {archived ? "Restore" : "Archive"}
      </button>
    </form>
  );
}
