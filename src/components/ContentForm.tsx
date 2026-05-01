"use client";

import type { Asset, Channel, ContentItem, Format, Pillar, PostType } from "@/lib/types";
import { ContentBasicsSection } from "@/components/content-form/ContentBasicsSection";
import { ContentWritingSection } from "@/components/content-form/ContentWritingSection";
import { ChannelScheduleSection } from "@/components/content-form/ChannelScheduleSection";
import { useContentFormDraft } from "@/components/content-form/useContentFormDraft";

export function ContentForm({
  action,
  item,
  linkedChannelIds,
  linkedChannelSchedules,
  linkedAssetIds,
  formats,
  pillars,
  channels,
  assets,
  initialBrand,
  initialFormatId,
  initialPillarId,
  initialChannelIds,
  initialPostType,
  initialTargetPostAt,
}: {
  action: (formData: FormData) => Promise<void>;
  item?: ContentItem | null;
  linkedChannelIds: number[];
  linkedChannelSchedules?: Record<number, string | null>;
  linkedAssetIds: number[];
  formats: Format[];
  pillars: Pillar[];
  channels: Channel[];
  assets: Asset[];
  initialBrand?: "seb" | "ublend";
  initialFormatId?: number;
  initialPillarId?: number;
  initialChannelIds?: number[];
  initialPostType?: PostType;
  initialTargetPostAt?: string | null;
}) {
  const {
    draft,
    visiblePillars,
    resolvedTargetPostAt,
    backupLabel,
    recoveredDraftAt,
    setField,
    applyFormat,
    handleBrandChange,
    toggleChannel,
    setChannelDate,
    discardRecoveredDraft,
  } = useContentFormDraft({
    item,
    linkedChannelIds,
    linkedChannelSchedules,
    formats,
    pillars,
    channels,
    initialBrand,
    initialFormatId,
    initialPillarId,
    initialChannelIds,
    initialPostType,
    initialTargetPostAt,
  });

  return (
    <form action={action} className="space-y-6">
      {item?.id ? <input type="hidden" name="id" value={item.id} /> : null}

      <ContentBasicsSection
        title={draft.title}
        formatId={draft.formatId}
        postType={draft.postType}
        pillarId={draft.pillarId}
        brand={draft.brand}
        formats={formats}
        visiblePillars={visiblePillars}
        onTitleChange={(value) => setField("title", value)}
        onFormatChange={applyFormat}
        onPostTypeChange={(value) => setField("postType", value)}
        onPillarChange={(value) => setField("pillarId", value)}
        onBrandChange={handleBrandChange}
      />

      <ChannelScheduleSection
        channels={channels}
        brand={draft.brand}
        selectedChannelIds={draft.selectedChannels}
        channelSchedules={draft.channelSchedules}
        targetPostAt={resolvedTargetPostAt}
        onToggleChannel={toggleChannel}
        onChannelDateChange={setChannelDate}
      />

      <ContentWritingSection
        hook={draft.hook}
        body={draft.body}
        close={draft.close}
        notes={draft.notes}
        backupLabel={backupLabel}
        recoveredDraftAt={recoveredDraftAt}
        onHookChange={(value) => setField("hook", value)}
        onBodyChange={(value) => setField("body", value)}
        onCloseChange={(value) => setField("close", value)}
        onNotesChange={(value) => setField("notes", value)}
        onDiscardRecoveredDraft={discardRecoveredDraft}
      />
    </form>
  );
}
