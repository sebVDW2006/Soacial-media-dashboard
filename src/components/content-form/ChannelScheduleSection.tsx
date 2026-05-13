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
  return (
    <section className="app-card space-y-6 p-6 sm:p-7">
      <input type="hidden" name="target_post_at" value={targetPostAt} />

      <div>
        <div className="eyebrow mb-3">Channels & post dates</div>
        <ChannelMultiSelect
          channels={channels}
          selectedIds={selectedChannelIds}
          brand={brand}
          channelSchedules={channelSchedules}
          onToggle={onToggleChannel}
          onScheduleChange={onChannelDateChange}
        />
      </div>
    </section>
  );
}
