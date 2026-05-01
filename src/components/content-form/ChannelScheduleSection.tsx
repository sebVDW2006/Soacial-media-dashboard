import type { Brand, Channel } from "@/lib/types";
import { ChannelMultiSelect } from "@/components/ChannelMultiSelect";

type ChannelScheduleSectionProps = {
  channels: Channel[];
  brand: Brand;
  selectedChannelIds: number[];
  channelSchedules: Record<number, string>;
  targetPostAt: string;
  onToggleChannel: (channelId: number) => void;
  onChannelDateChange: (channelId: number, value: string) => void;
};

export function ChannelScheduleSection({
  channels,
  brand,
  selectedChannelIds,
  channelSchedules,
  targetPostAt,
  onToggleChannel,
  onChannelDateChange,
}: ChannelScheduleSectionProps) {
  const selectedChannels = channels.filter((channel) => selectedChannelIds.includes(channel.id));

  return (
    <section className="app-card space-y-6 p-6 sm:p-7">
      <input type="hidden" name="target_post_at" value={targetPostAt} />

      <div>
        <label>Channels</label>
        <ChannelMultiSelect
          channels={channels}
          selectedIds={selectedChannelIds}
          brand={brand}
          onToggle={onToggleChannel}
        />
        {selectedChannels.length > 0 ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-[var(--ink-soft)]">
              Schedule per channel
            </p>
            {selectedChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex flex-col gap-2 rounded-2xl border border-[var(--line)] p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="text-sm font-semibold text-[var(--ink)]">{channel.name}</span>
                <input
                  type="datetime-local"
                  name={`channel_schedule_${channel.id}`}
                  value={channelSchedules[channel.id] ?? ""}
                  onChange={(event) => onChannelDateChange(channel.id, event.target.value)}
                  className="sm:w-64"
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
