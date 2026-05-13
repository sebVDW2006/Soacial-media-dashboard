import type { Brand, Channel } from "@/lib/types";

export function ChannelMultiSelect({
  channels,
  selectedIds,
  brand,
  channelSchedules,
  onToggle,
  onScheduleChange,
}: {
  channels: Channel[];
  selectedIds: number[];
  brand: Brand;
  channelSchedules: Record<number, string>;
  onToggle: (channelId: number) => void;
  onScheduleChange: (channelId: number, value: string) => void;
}) {
  const visibleChannels = channels.filter((channel) => channel.brand === brand);

  return (
    <div className="space-y-3">
      {visibleChannels.map((channel) => {
        const checked = selectedIds.includes(channel.id);
        const scheduleInputId = `channel_schedule_${channel.id}`;

        return (
          <div
            key={channel.id}
            className={`soft-card p-4 ${checked ? "border-[var(--brand)] bg-white/95" : ""}`}
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(220px,260px)] sm:items-end">
              <button
                type="button"
                onClick={() => onToggle(channel.id)}
                aria-pressed={checked}
                className="flex min-h-[56px] w-full items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/70 px-4 py-3 text-left hover:border-[var(--line-strong)]"
              >
                <span className="font-semibold text-[var(--brand)]">{channel.name}</span>
                <span className={`chip ${checked ? "active" : ""}`}>
                  {checked ? "On" : "Off"}
                </span>
              </button>
              {checked ? (
                <div>
                  <label htmlFor={scheduleInputId}>Post date</label>
                  <input
                    id={scheduleInputId}
                    type="datetime-local"
                    name={scheduleInputId}
                    aria-label={`${channel.name} post date`}
                    value={channelSchedules[channel.id] ?? ""}
                    onChange={(event) => onScheduleChange(channel.id, event.target.value)}
                    className="min-h-[56px] rounded-2xl bg-white/90 text-sm"
                  />
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
      {selectedIds
        .filter((id) => channels.find((ch) => ch.id === id && ch.brand === brand))
        .map((id) => (
          <input key={`selected-${id}`} type="hidden" name="channel_ids" value={id} />
        ))}
    </div>
  );
}
