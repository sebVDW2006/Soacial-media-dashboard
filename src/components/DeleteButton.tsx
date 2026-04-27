"use client";

import { deleteContent } from "@/app/content/actions";

export function DeleteButton({ id }: { id: number }) {
  return (
    <form action={deleteContent}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="secondary-button"
        onClick={(e) => {
          if (!confirm("Delete this piece? This cannot be undone.")) {
            e.preventDefault();
          }
        }}
      >
        Delete
      </button>
    </form>
  );
}
