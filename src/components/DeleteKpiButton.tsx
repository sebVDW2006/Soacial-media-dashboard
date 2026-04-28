"use client";

import { deleteKpiSnapshot } from "@/app/content/actions";

export function DeleteKpiButton({
  snapshotId,
  contentItemId,
}: {
  snapshotId: number;
  contentItemId: number;
}) {
  return (
    <form action={deleteKpiSnapshot}>
      <input type="hidden" name="snapshot_id" value={snapshotId} />
      <input type="hidden" name="content_item_id" value={contentItemId} />
      <button
        type="submit"
        className="text-xs font-semibold text-red-500 hover:text-red-700"
        onClick={(e) => {
          if (!confirm("Delete these KPI numbers?")) e.preventDefault();
        }}
      >
        Delete
      </button>
    </form>
  );
}
