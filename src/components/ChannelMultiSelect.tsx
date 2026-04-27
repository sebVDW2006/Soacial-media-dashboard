import type { Channel } from "@/lib/types";

export function ChannelMultiSelect({
  channels,
  selectedIds,
  brand,
  onToggle,
}: {
  channels: Channel[];
  selectedIds: number[];
  brand: "seb" | "ublend";
  onToggle: (channelId: number) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {channels
        .filter((channel) => channel.brand === brand)
        .map((channel) => {
          const checked = selectedIds.includes(channel.id);
          return (
            <button
              key={channel.id}
              type="button"
              onClick={() => onToggle(channel.id)}
              className={`soft-card flex min-h-[52px] items-center justify-between px-4 py-3 text-left ${
                checked ? "border-leaf bg-amber-50" : ""
              }`}
            >
              <span className="font-semibold">{channel.name}</span>
              <span className="chip">{checked ? "On" : "Off"}</span>
            </button>
          );
        })}
      {selectedIds.map((id) => (
        <input key={`selected-${id}`} type="hidden" name="channel_ids" value={id} />
      ))}
    </div>
  );
}
